import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import ExcelJS from 'exceljs'
import { avaaKisalla, napautaMonta } from './apurit'

/**
 * Vienti ja tuonti oikeassa selaimessa.
 *
 * Tämä on sovelluksen tärkein turvaverkko: jos selaimen muisti tyhjenee, viety tiedosto
 * on ainoa jäljelle jäävä kopio. Kierros ajetaan siksi läpi aidosti — tiedosto ladataan
 * levylle ja luetaan takaisin sisään.
 */

const AMPUJAT = [
  { etunimi: 'Aada', sukunimi: 'Ahonen', yhdistys: 'KaRes' },
  { etunimi: 'Sami', sukunimi: 'Hänninen', yhdistys: 'Nupures' },
]

test('vienti lataa Excel-tiedoston', async ({ page }) => {
  await avaaKisalla(page, AMPUJAT, { polku: '/#/syota/RA1', syottotapa: 'nappaimisto' })

  // Kirjataan tuloksia, jotta tiedostossa on jotain.
  await napautaMonta(page, '9', 10)

  await page.goto('/#/vienti')
  const lataus = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Lataa tiedosto' }).click()
  const tiedosto = await lataus

  expect(tiedosto.suggestedFilename()).toMatch(/^selaintestikisa-\d{4}-\d{2}-\d{2}\.xlsx$/)

  const polku = await tiedosto.path()
  const tavut = await readFile(polku)
  // xlsx on zip-paketti, joten se alkaa PK-tunnisteella.
  expect(tavut.subarray(0, 2).toString('latin1')).toBe('PK')
  expect(tavut.byteLength).toBeGreaterThan(5000)
})

test('viennin jälkeen muistutus katoaa', async ({ page }) => {
  // Vanha vienti → muistutus näkyvissä.
  await avaaKisalla(page, AMPUJAT, {
    polku: '/#/vienti',
    viimeinenVienti: new Date(Date.now() - 3 * 3600_000).toISOString(),
  })
  await expect(page.locator('.varoitus')).toBeVisible()

  const lataus = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Lataa tiedosto' }).click()
  await lataus

  await expect(page.locator('.varoitus')).toHaveCount(0)
  // Kohdistetaan ilmoituslaatikkoon: mailto-ohjeteksti sisältää myös sanan "ladattu".
  await expect(page.locator('.huomio.ilmoitus')).toContainText('ladattu')
})

/** Tukeeko selain tiedostojen jakamista? Käytännössä tosi vain mobiiliselaimissa. */
async function tukeeJakoa(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const n = navigator as Navigator & { canShare?: (d?: ShareData) => boolean }
    if (typeof n.canShare !== 'function' || typeof navigator.share !== 'function') return false
    try {
      return n.canShare({ files: [new File([], 'koe.xlsx')] })
    } catch {
      return false
    }
  })
}

// Kaksi erillistä testiä, jotta ohitettu tapaus näkyy raportissa. Jokin näistä poluista
// on aina tarjolla — muuten tulosten lähettäminen jäisi käyttäjän keksimisen varaan.

test('jakotuen kanssa tarjotaan jakopainike', async ({ page }) => {
  await avaaKisalla(page, AMPUJAT, { polku: '/#/vienti' })
  test.skip(!(await tukeeJakoa(page)), 'Selain ei tue tiedostojen jakamista')

  await expect(page.getByRole('button', { name: 'Jaa tulokset' })).toBeVisible()
  await expect(page.getByText(/laitteen jakovalikkoon/)).toBeVisible()
})

test('ilman jakotukea tarjotaan sähköpostiluonnos', async ({ page }) => {
  await avaaKisalla(page, AMPUJAT, { polku: '/#/vienti' })
  test.skip(await tukeeJakoa(page), 'Selain tukee jakamista')

  const sahkoposti = page.getByText('Lähettäminen sähköpostilla')
  await expect(sahkoposti).toBeVisible()
  await sahkoposti.click()
  await expect(page.getByRole('button', { name: 'Avaa sähköpostiluonnos' })).toBeVisible()
  // Rajoite on kerrottava, jottei käyttäjä oleta liitteen ilmestyvän itsestään.
  await expect(page.getByText(/ei voi sisältää liitettä/)).toBeVisible()
})

test('kierros: vie, tyhjennä muisti, tuo takaisin', async ({ page }) => {
  await avaaKisalla(page, AMPUJAT, { polku: '/#/syota/RA1', syottotapa: 'nappaimisto' })

  // Kirjataan tunnistettava tulos: 10 × napakymppi = 100.
  await napautaMonta(page, '★', 10)
  await expect(page.locator('.sarja').first().locator('.sarja-summa strong')).toHaveText('100')

  await page.goto('/#/vienti')
  const lataus = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Lataa tiedosto' }).click()
  const polku = await (await lataus).path()

  /*
   * Simuloidaan pahin tapaus: selaimen sivustotiedot tyhjenevät kokonaan. Juuri tätä
   * varten vienti on olemassa.
   */
  await page.evaluate(() => localStorage.clear())
  await page.reload()

  // Vientisivu kertoo tyhjästä tilasta: vienti ei aktivoidu ilman kilpailijoita.
  await expect(page.getByText('Lisää ensin kilpailijoita')).toBeVisible()
  await page.goto('/#/kilpailijat')
  await expect(page.getByText('Ei vielä kilpailijoita')).toBeVisible()

  // Tuodaan tiedosto takaisin.
  await page.goto('/#/vienti')
  await page.locator('input[type="file"]').setInputFiles(polku)

  // Esikatselu kertoo mitä ollaan tuomassa, ennen kuin mitään korvataan.
  await expect(page.getByText('Tarkista ennen tuontia')).toBeVisible()
  await expect(page.getByText('Selaintestikisa')).toBeVisible()

  await page.getByRole('button', { name: 'Korvaa tulokset' }).click()
  await expect(page.getByText(/Tulokset tuotu: 2 kilpailijaa/)).toBeVisible()

  // Tulos on palautunut sellaisenaan.
  await page.goto('/#/tulokset/RA1')
  const rivi = page.locator('tbody tr').first()
  await expect(rivi).toContainText('Ahonen')
  await expect(rivi.locator('.tulos')).toContainText('100')
})

test('käsin korjattu laukaus menee tuonnissa läpi', async ({ page }) => {
  await avaaKisalla(page, AMPUJAT, { polku: '/#/syota/RA1', syottotapa: 'taulukko' })

  const ruudut = page.locator('.ruutu')
  await ruudut.first().click()
  for (let i = 0; i < 10; i++) await page.keyboard.press('5')

  await page.goto('/#/vienti')
  const lataus = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Lataa tiedosto' }).click()
  const polku = await (await lataus).path()

  /*
   * Muokataan tiedostoa kuten järjestäjä tekisi Excelissä. Muokkaus tehdään Nodessa,
   * jossa ExcelJS on käytettävissä — selainkontekstissa paljasta moduulinimeä ei voi
   * ratkaista.
   */
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(await readFile(polku))
  const ws = wb.getWorksheet('Tuloskortti RA1')!
  // Ahonen on rivi 4; ensimmäinen laukaussarake on 7 (RA1: 6 perussaraketta).
  for (let i = 0; i < 10; i++) ws.getCell(4, 7 + i).value = 10
  const muokatut = await wb.xlsx.writeBuffer()

  await page.locator('input[type="file"]').setInputFiles({
    name: 'korjattu.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.from(muokatut as ArrayBuffer),
  })

  await page.getByRole('button', { name: 'Korvaa tulokset' }).click()

  // Korjaus näkyy: 10 × 10 = 100 aiemman 50:n sijaan.
  await page.goto('/#/tulokset/RA1')
  const rivi = page.locator('tbody tr').first()
  await expect(rivi).toContainText('Ahonen')
  await expect(rivi.locator('.tulos')).toContainText('100')
})

test('kelvoton tiedosto antaa selkeän virheen eikä hukkaa tuloksia', async ({ page }) => {
  await avaaKisalla(page, AMPUJAT, { polku: '/#/vienti' })

  await page.locator('input[type="file"]').setInputFiles({
    name: 'vaara.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.from('en ole xlsx-tiedosto'),
  })

  await expect(page.locator('.huomio--virhe')).toBeVisible()
  // Nykyiset tulokset ovat edelleen tallessa.
  await expect(page.getByText('Kilpailijoita')).toBeVisible()
  await page.goto('/#/kilpailijat')
  await expect(page.getByText('2 kilpailijaa')).toBeVisible()
})
