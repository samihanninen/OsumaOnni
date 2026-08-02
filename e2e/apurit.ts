import type { Page } from '@playwright/test'

/**
 * Yhteiset apurit selaintesteille.
 *
 * Kilpailijat kirjataan käyttöliittymän kautta vain silloin, kun juuri sitä testataan.
 * Muissa testeissä tila kirjoitetaan suoraan localStorageen ennen sivun latausta — se on
 * nopeaa ja pitää testin kohteena varsinaisen testattavan asian.
 */

export interface TestiKilpailija {
  etunimi: string
  sukunimi: string
  yhdistys: string
  ikasarja?: 'H' | 'H50'
  lajit?: Partial<Record<'RA1' | 'RA2' | 'RA3' | 'RA4', { luokka?: 'vakio' | 'avoin' }>>
}

/** Rakentaa kisa-storen sisällön samassa muodossa kuin sovellus sen tallentaa. */
function rakennaKisa(kilpailijat: TestiKilpailija[], kisanNimi: string) {
  const rakenteet = {
    RA1: { kilpasarjoja: 2, laukauksiaSarjassa: 10, tulosSaanto: 'paras' },
    RA2: { kilpasarjoja: 3, laukauksiaSarjassa: 6, tulosSaanto: 'summa' },
    RA3: { kilpasarjoja: 2, laukauksiaSarjassa: 10, tulosSaanto: 'paras' },
    RA4: { kilpasarjoja: 2, laukauksiaSarjassa: 10, tulosSaanto: 'paras' },
  } as const

  const lajiMaaritykset = Object.fromEntries(
    Object.entries(rakenteet).map(([koodi, r]) => [
      koodi,
      {
        koodi,
        nimi: `${koodi} — testilaji`,
        kuvaus: '',
        ase: '',
        kilpasarjoja: r.kilpasarjoja,
        laukauksiaSarjassa: r.laukauksiaSarjassa,
        tulosSaanto: r.tulosSaanto,
        etaisyys: '',
        taulu: '',
        asento: '',
        koelaukauksia: 5,
      },
    ]),
  )

  return {
    kisa: {
      schemaVersion: 1,
      kisaId: 'TESTI123',
      kisatiedot: {
        nimi: kisanNimi,
        jarjestaja: 'Testiseura',
        paikka: 'Testirata',
        pvm: '15.6.2026',
        kilpailunjohtaja: '',
        tuomari: '',
        kirjuri: '',
        muistiinpanot: '',
      },
      asetukset: { laskettavatParhaat: 3, lajiMaaritykset },
      kilpailijat: kilpailijat.map((k, i) => ({
        id: `testi-${i}`,
        etunimi: k.etunimi,
        sukunimi: k.sukunimi,
        yhdistys: k.yhdistys,
        ikasarja: k.ikasarja ?? 'H',
        osallistumiset: Object.fromEntries(
          Object.entries(k.lajit ?? { RA1: {} }).map(([laji, asetus]) => {
            const r = rakenteet[laji as keyof typeof rakenteet]
            return [
              laji,
              {
                luokka: asetus?.luokka ?? 'vakio',
                kilpasarjat: Array.from({ length: r.kilpasarjoja }, () => ({
                  laukaukset: Array.from({ length: r.laukauksiaSarjassa }, () => null),
                })),
                rangaistuksia: 0,
                hylatty: false,
              },
            ]
          }),
        ),
      })),
    },
  }
}

/**
 * Avaa sovelluksen valmiiksi täytetyllä kisalla.
 *
 * localStorage kirjoitetaan `addInitScript`illä, joka ajetaan ennen sovelluksen koodia
 * jokaisella sivunlatauksella — muuten Pinia ehtisi tallentaa tyhjän tilan päälle.
 */
export async function avaaKisalla(
  page: Page,
  kilpailijat: TestiKilpailija[],
  optiot: {
    polku?: string
    kisanNimi?: string
    viimeinenVienti?: string
    /**
     * Pakota syöttötapa. Näin sekä näppäimistö että taulukko testataan kaikilla
     * selainmoottoreilla — Playwright ei salli laiteprofiilin vaihtoa describe-lohkossa,
     * ja sovelluksen oma valinta on joka tapauksessa luotettavampi tapa ohjata näkymää.
     */
    syottotapa?: 'auto' | 'nappaimisto' | 'taulukko'
  } = {},
) {
  const kisa = rakennaKisa(kilpailijat, optiot.kisanNimi ?? 'Selaintestikisa')
  const laite = {
    laiteId: 'testi-laite',
    laiteNimi: 'Testi',
    viimeinenVienti: optiot.viimeinenVienti ?? new Date().toISOString(),
    luovutettu: false,
    syottotapa: optiot.syottotapa ?? 'auto',
  }

  /*
   * Alustus tehdään täsmälleen kerran välilehteä kohti.
   *
   * addInitScript ajetaan JOKAISELLA sivunlatauksella, myös page.reload():n yhteydessä.
   * Ehdoton kirjoitus ylikirjoittaisi sovelluksen tallentaman tilan, joten tallennusta ei
   * voisi testata. Pelkkä "kirjoita jos localStorage on tyhjä" ei riitä sekään: silloin
   * localStorage.clear() johtaisi tietojen palautumiseen uudelleenlatauksessa, eikä
   * muistin tyhjenemistä voisi simuloida. Merkintä pidetään siksi sessionStoragessa,
   * jota localStorage.clear() ei koske.
   */
  await page.addInitScript(
    ([kisaJson, laiteJson]) => {
      if (sessionStorage.getItem('testi-alustettu')) return
      sessionStorage.setItem('testi-alustettu', '1')
      localStorage.setItem('kisa', kisaJson as string)
      localStorage.setItem('laite', laiteJson as string)
    },
    [JSON.stringify(kisa), JSON.stringify(laite)],
  )

  await siirry(page, optiot.polku ?? '/')
}

/** Avaa sovelluksen tyhjänä. */
export async function avaaTyhjana(page: Page, polku = '/') {
  await siirry(page, polku)
}

/**
 * Siirry sovelluksen sisäiseen osoitteeseen. Käytä tätä aina `page.goto`n sijaan.
 *
 * Polku kirjoitetaan sovelluksen juuresta (`/#/vienti`), mutta alkava vinoviiva on
 * poistettava ennen `page.goto`a. Playwright ratkaisee osoitteen `new URL(polku, baseURL)`
 * -säännöillä, joissa alkava vinoviiva pyyhkii `baseURL`:n polkuosan `/osumaonni/` pois —
 * testi menisi palvelimen juureen. Vite ohjaa juuren takaisin base-polkuun, ja juuri se
 * uudelleenohjaus keskeyttää käynnissä olevan navigoinnin: Playwright kaatuu virheeseen
 * "interrupted by another navigation", ja sovellus kirjaa reitittimen virheen R0011.
 * Ajoituksesta riippuen vika osuu satunnaisesti, joten se on syytä estää keskitetysti.
 *
 * Toinen ansa on navigointi osoitteeseen, jossa jo ollaan. Hash-reitityksessä se on saman
 * dokumentin navigointi, jonka WebKit keskeyttää edelliseen: "interrupted by another
 * navigation" — sama osoite molemmin puolin. Koska kutsun tarkoitus on *varmistaa* oikea
 * näkymä eikä ladata sivua uudelleen, jo perillä oleva tapaus ohitetaan. Uudelleenlataus
 * pyydetään aina erikseen `page.reload()`illa.
 */
export async function siirry(page: Page, polku: string) {
  const suhteellinen = polku.replace(/^\/+/, '') || './'
  if (suhteellinen !== './' && page.url().endsWith(suhteellinen)) return
  await page.goto(suhteellinen)
}

/** Näppäimistön arvonäppäin näkyvän tekstin perusteella. */
export function nappain(page: Page, teksti: string) {
  return page.locator('.nappain', { hasText: new RegExp(`^${teksti}$`) })
}

/**
 * Vierittää näppäimistön näkyviin kertaalleen.
 *
 * Näppäimistö on kiinnitetty näytön alalaitaan (position: sticky). Jos jokainen napautus
 * joutuu ensin vierittämään sen näkyviin, Playwrightin vakausarviointi voi tulkita
 * kiinnitetyn elementin liikkuvaksi. Oikea käyttäjäkin näkee näppäimistön ennen
 * ensimmäistä napautusta, joten tämä vastaa todellista käyttöä.
 */
export async function valmistaNappaimisto(page: Page) {
  await page.locator('.nappaimisto-alue').scrollIntoViewIfNeeded()
}

/** Napauttaa arvonäppäintä varmistaen ensin, että näppäimistö on näkyvissä. */
export async function napauta(page: Page, teksti: string) {
  await valmistaNappaimisto(page)
  await nappain(page, teksti).click()
}

/** Napauttaa arvonäppäintä `maara` kertaa. */
export async function napautaMonta(page: Page, teksti: string, maara: number) {
  await valmistaNappaimisto(page)
  const nappi = nappain(page, teksti)
  for (let i = 0; i < maara; i++) await nappi.click()
}
