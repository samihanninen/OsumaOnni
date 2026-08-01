import { XLSX_TYYPPI } from './lataa'

/**
 * Tulosten jakaminen.
 *
 * TÄRKEÄÄ: `mailto:`-linkki **ei voi sisältää liitetiedostoa** — mikään selain ei tue
 * sitä. Ainoa tapa saada tiedosto suoraan sähköpostin liitteeksi selaimesta on Web Share
 * API, joka antaa tiedoston laitteen omalle jakovalikolle. Se toimii käytännössä
 * puhelimissa; työpöydällä tiedosto ladataan ja liitetään käsin.
 */

export type JakoTulos =
  /** Käyttäjä valitsi kohteen ja jako onnistui. */
  | 'jaettu'
  /** Käyttäjä sulki jakovalikon. */
  | 'peruutettu'
  /** Selain ei tue tiedostojen jakamista. */
  | 'ei-tuettu'
  /**
   * Selain esti jaon, koska käyttäjän eleen ja kutsun välissä oli liikaa odotusta.
   * Tyypillinen Safarissa, jos tiedosto valmistellaan awaitin takana.
   */
  | 'estetty'

export function luoTiedosto(tavut: ArrayBuffer, nimi: string, tyyppi = XLSX_TYYPPI): File {
  return new File([tavut], nimi, { type: tyyppi })
}

/**
 * Tukeeko selain tämän tiedoston jakamista? Tarkistus tehdään aidolla File-oliolla,
 * koska `canShare` arvioi myös tiedostotyypin.
 */
export function tukeeTiedostonJakoa(tiedosto: File): boolean {
  const n = navigator as Navigator & { canShare?: (data?: ShareData) => boolean }
  if (typeof n.canShare !== 'function' || typeof navigator.share !== 'function') return false
  try {
    return n.canShare({ files: [tiedosto] })
  } catch {
    return false
  }
}

/**
 * Onko jakaminen ylipäätään käytettävissä tällä laitteella?
 *
 * Tarkistus on tarkoituksella väljä: pelkkä `navigator.share` riittää. Aiemmin tässä
 * kokeiltiin `canShare`ia tyhjällä koetiedostolla, mutta osa selaimista hylkää
 * nollatavuisen tiedoston — jolloin jakopainike jäi piiloon laitteilla, joilla jakaminen
 * olisi toiminut oikealla tiedostolla mainiosti. Lopullinen tarkistus tehdään vasta
 * aidolla tiedostolla, ja jos jako ei onnistu, tiedosto ladataan sen sijaan.
 */
export function jakoKaytettavissa(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

export async function jaaTiedosto(
  tiedosto: File,
  tiedot: { otsikko: string; teksti: string },
): Promise<JakoTulos> {
  if (!tukeeTiedostonJakoa(tiedosto)) return 'ei-tuettu'
  try {
    await navigator.share({ files: [tiedosto], title: tiedot.otsikko, text: tiedot.teksti })
    return 'jaettu'
  } catch (e) {
    if (e instanceof DOMException) {
      if (e.name === 'AbortError') return 'peruutettu'
      if (e.name === 'NotAllowedError') return 'estetty'
    }
    return 'ei-tuettu'
  }
}

export interface SahkopostiLuonnos {
  vastaanottaja?: string
  aihe: string
  viesti: string
}

/** Rakentaa `mailto:`-osoitteen. Liitettä ei voi lisätä — se on kerrottava käyttäjälle. */
export function mailtoOsoite(luonnos: SahkopostiLuonnos): string {
  const parametrit = new URLSearchParams()
  parametrit.set('subject', luonnos.aihe)
  parametrit.set('body', luonnos.viesti)
  // URLSearchParams koodaa välilyönnit plussiksi; sähköpostiohjelmat odottavat %20.
  const kysely = parametrit.toString().replace(/\+/g, '%20')
  return `mailto:${luonnos.vastaanottaja ?? ''}?${kysely}`
}

/** Oletusviesti järjestäjälle. */
export function luonnosTeksti(tiedot: {
  kisanNimi: string
  pvm: string
  tiedostonimi: string
  kilpailijoita: number
}): SahkopostiLuonnos {
  const nimi = tiedot.kisanNimi || 'Reserviläisammunta'
  const rivit = [
    `Kisa: ${nimi}`,
    tiedot.pvm ? `Päivämäärä: ${tiedot.pvm}` : '',
    `Kilpailijoita: ${tiedot.kilpailijoita}`,
    '',
    `Tulokset ovat tiedostossa ${tiedot.tiedostonimi}.`,
    '',
    'HUOM: liitä tiedosto viestiin itse — selain ei voi lisätä liitettä automaattisesti.',
  ].filter((r) => r !== '')

  return {
    aihe: `Tulokset: ${nimi}${tiedot.pvm ? ` (${tiedot.pvm})` : ''}`,
    viesti: rivit.join('\n'),
  }
}
