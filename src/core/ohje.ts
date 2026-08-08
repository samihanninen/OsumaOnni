/**
 * Kilpailupäivän ohjeen jäsennys.
 *
 * Ohje on yksi ainoa lähde: `KILPAILUOHJE.md` repositorion juuressa. GitHubissa sen
 * lukee sellaisenaan, ja sovellus lataa saman tiedoston käännösaikana mukaansa. Näin
 * ohje ei voi päätyä eri tilaan kahdessa paikassa.
 *
 * Ohjetta luetaan nimenomaan radalla, jossa ei ole verkkoyhteyttä. Siksi ohje ei voi
 * olla linkki GitHubiin: se toimisi vain silloin kun sitä ei tarvita. Käännösaikainen
 * sisällytys tarkoittaa, että service worker tallentaa ohjeen muun sovelluksen mukana.
 *
 * Jäsennin tunnistaa vain sen Markdownin osajoukon, jota ohjeessa käytetään. Tämä on
 * tarkoituksellista: valmis Markdown-kirjasto olisi satoja kilotavuja sovellukseen,
 * joka muuten ladataan puhelimeen kentällä. Jos ohjeeseen lisätään uutta merkintää,
 * se on lisättävä myös tänne — testit kattavat käytetyn osajoukon.
 */

/** Tekstin pätkä rivin sisällä. */
export type Pala =
  | { laji: 'teksti'; sisalto: string }
  | { laji: 'vahva'; sisalto: string }
  | { laji: 'koodi'; sisalto: string }

/** Ohjeen rakenneosa. */
export type Lohko =
  | { laji: 'otsikko'; taso: 1 | 2 | 3; palat: Pala[] }
  | { laji: 'kappale'; palat: Pala[] }
  | { laji: 'lista'; numeroitu: boolean; kohdat: Pala[][] }
  | { laji: 'huomio'; palat: Pala[] }
  | { laji: 'viiva' }

const OTSIKKO = /^(#{1,3})\s+(.*)$/
const VIIVA = /^-{3,}\s*$/
const HUOMIO = /^>\s?(.*)$/
const LUETTELO = /^[-*]\s+(.*)$/
const NUMEROITU = /^\d+\.\s+(.*)$/
/** Jatkorivi: sisennetty rivi, joka kuuluu edelliseen kohtaan. */
const JATKO = /^\s+\S/

/** Korostukset rivin sisällä: `**vahva**` ja `` `koodi` ``. */
const KOROSTUS = /\*\*([^*]+)\*\*|`([^`]+)`/g

/**
 * Pilkkoo rivin paloihin. Tuloksena on aina vähintään yksi pala, jotta tyhjäkin rivi
 * renderöityy ilman erikoiskäsittelyä.
 */
export function jasennaPalat(rivi: string): Pala[] {
  const palat: Pala[] = []
  let edellinen = 0

  for (const osuma of rivi.matchAll(KOROSTUS)) {
    const alku = osuma.index
    if (alku > edellinen) {
      palat.push({ laji: 'teksti', sisalto: rivi.slice(edellinen, alku) })
    }
    palat.push(
      osuma[1] !== undefined
        ? { laji: 'vahva', sisalto: osuma[1] }
        : { laji: 'koodi', sisalto: osuma[2]! },
    )
    edellinen = alku + osuma[0].length
  }

  if (edellinen < rivi.length) {
    palat.push({ laji: 'teksti', sisalto: rivi.slice(edellinen) })
  }
  return palat.length > 0 ? palat : [{ laji: 'teksti', sisalto: '' }]
}

/** Yhdistää monirivisen kohdan yhdeksi riviksi. Rivinvaihdot ovat vain lähteen taittoa. */
function yhdista(rivit: string[]): string {
  return rivit.map((rivi) => rivi.trim()).join(' ')
}

function aloittaaLohkon(rivi: string): boolean {
  return (
    !rivi.trim() ||
    OTSIKKO.test(rivi) ||
    VIIVA.test(rivi) ||
    HUOMIO.test(rivi) ||
    LUETTELO.test(rivi) ||
    NUMEROITU.test(rivi)
  )
}

/** Jäsentää ohjeen Markdown-lähteen rakenteeksi, jonka näkymä renderöi. */
export function jasennaOhje(lahde: string): Lohko[] {
  const rivit = lahde.replace(/\r\n/g, '\n').split('\n')
  const lohkot: Lohko[] = []
  let i = 0

  while (i < rivit.length) {
    const rivi = rivit[i]!

    if (!rivi.trim()) {
      i++
      continue
    }

    const viiva = VIIVA.exec(rivi)
    if (viiva) {
      lohkot.push({ laji: 'viiva' })
      i++
      continue
    }

    const otsikko = OTSIKKO.exec(rivi)
    if (otsikko) {
      lohkot.push({
        laji: 'otsikko',
        taso: otsikko[1]!.length as 1 | 2 | 3,
        palat: jasennaPalat(otsikko[2]!.trim()),
      })
      i++
      continue
    }

    if (HUOMIO.test(rivi)) {
      const keratyt: string[] = []
      while (i < rivit.length && HUOMIO.test(rivit[i]!)) {
        keratyt.push(HUOMIO.exec(rivit[i]!)![1]!)
        i++
      }
      lohkot.push({ laji: 'huomio', palat: jasennaPalat(yhdista(keratyt)) })
      continue
    }

    const numeroitu = NUMEROITU.test(rivi)
    if (numeroitu || LUETTELO.test(rivi)) {
      const kaava = numeroitu ? NUMEROITU : LUETTELO
      const kohdat: Pala[][] = []

      while (i < rivit.length) {
        const osuma = kaava.exec(rivit[i]!)
        if (!osuma) break

        const kohta = [osuma[1]!]
        i++
        // Sisennetyt rivit ovat samaa kohtaa, eivät uutta.
        while (i < rivit.length && JATKO.test(rivit[i]!) && !aloittaaLohkon(rivit[i]!.trim())) {
          kohta.push(rivit[i]!)
          i++
        }
        kohdat.push(jasennaPalat(yhdista(kohta)))
      }

      lohkot.push({ laji: 'lista', numeroitu, kohdat })
      continue
    }

    const kappale = [rivi]
    i++
    while (i < rivit.length && !aloittaaLohkon(rivit[i]!)) {
      kappale.push(rivit[i]!)
      i++
    }
    lohkot.push({ laji: 'kappale', palat: jasennaPalat(yhdista(kappale)) })
  }

  return lohkot
}
