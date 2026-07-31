/**
 * Luo sovelluksen kuvakkeet ohjelmallisesti.
 *
 * Kuvake on ampumataulu eli sisäkkäisiä renkaita, joten se voidaan piirtää pikseleittäin
 * ilman kuvankäsittelykirjastoa tai fonttia. Näin kuvakkeet ovat toistettavissa, eikä
 * projektiin tarvitse tuoda binäärejä joiden alkuperää ei voi tarkistaa.
 *
 * Aja: node scripts/luo-kuvakkeet.mjs
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const JUURI = join(dirname(fileURLToPath(import.meta.url)), '..')
const KOHDE = join(JUURI, 'public')

// Brändivärit (samat kuin base.css)
const VIHREA = [0x1f, 0x6f, 0x4a]
const VALKOINEN = [0xff, 0xff, 0xff]
const TUMMA = [0x16, 0x17, 0x1a]

// --- PNG-koodaus -----------------------------------------------------------

const CRC_TAULU = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(tavut) {
  let c = 0xffffffff
  for (const t of tavut) c = CRC_TAULU[(c ^ t) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(tyyppi, data) {
  const pituus = Buffer.alloc(4)
  pituus.writeUInt32BE(data.length)
  const nimi = Buffer.from(tyyppi, 'ascii')
  const runko = Buffer.concat([nimi, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(runko))
  return Buffer.concat([pituus, runko, crc])
}

/** Kirjoittaa RGBA-pikselipuskurin PNG-tiedostoksi. */
function pngTavut(leveys, korkeus, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(leveys, 0)
  ihdr.writeUInt32BE(korkeus, 4)
  ihdr[8] = 8 // bittisyvyys
  ihdr[9] = 6 // väri: RGBA
  ihdr[10] = 0 // pakkaus
  ihdr[11] = 0 // suodatin
  ihdr[12] = 0 // ei lomitusta

  // Jokainen rivi alkaa suodatintavulla 0.
  const rivit = Buffer.alloc(korkeus * (leveys * 4 + 1))
  for (let y = 0; y < korkeus; y++) {
    const lahde = y * leveys * 4
    const kohde = y * (leveys * 4 + 1)
    rivit[kohde] = 0
    rgba.copy(rivit, kohde + 1, lahde, lahde + leveys * 4)
  }

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(rivit, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// --- Piirto ----------------------------------------------------------------

/**
 * Piirtää ampumataulun.
 *
 * @param koko kuvan sivun pituus pikseleinä
 * @param tayttoOsuus kuinka suuri osa kuvasta on taulua (maskable tarvitsee marginaalin)
 * @param pyoristys nurkkien pyöristys osuutena koosta; 0.5 = ympyrä
 */
function piirraTaulu(koko, { tayttoOsuus = 0.86, pyoristys = 0.22, tausta = VIHREA } = {}) {
  const rgba = Buffer.alloc(koko * koko * 4)
  const keski = (koko - 1) / 2
  const sade = (koko * tayttoOsuus) / 2
  const r = koko * pyoristys

  // Renkaiden reunat ulkoa sisään, osuutena säteestä.
  const renkaat = [1.0, 0.82, 0.64, 0.46, 0.28, 0.12]

  for (let y = 0; y < koko; y++) {
    for (let x = 0; x < koko; x++) {
      const i = (y * koko + x) * 4

      // Pyöristetty neliö taustaksi (superellipsin sijaan yksinkertainen nurkkatesti).
      const dx = Math.max(r - x, 0, x - (koko - 1 - r))
      const dy = Math.max(r - y, 0, y - (koko - 1 - r))
      const nurkkaEtaisyys = Math.hypot(dx, dy)
      if (nurkkaEtaisyys > r) {
        rgba[i + 3] = 0 // läpinäkyvä nurkka
        continue
      }

      let vari = tausta
      const etaisyys = Math.hypot(x - keski, y - keski)

      for (let k = 0; k < renkaat.length; k++) {
        if (etaisyys <= sade * renkaat[k]) {
          // Vuorottelevat renkaat: valkoinen ja tumma, keskellä valkoinen napa.
          vari = k % 2 === 0 ? VALKOINEN : TUMMA
        }
      }

      rgba[i] = vari[0]
      rgba[i + 1] = vari[1]
      rgba[i + 2] = vari[2]
      rgba[i + 3] = 255
    }
  }
  return rgba
}

/** Maskable-kuvake: sama kuva mutta reunoihin jää turva-alue ja tausta täyttää kaiken. */
function piirraMaskable(koko) {
  const rgba = piirraTaulu(koko, { tayttoOsuus: 0.6, pyoristys: 0.5 })
  // Täytetään läpinäkyvät nurkat taustavärillä, koska maskable leikataan itse.
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] === 0) {
      rgba[i] = VIHREA[0]
      rgba[i + 1] = VIHREA[1]
      rgba[i + 2] = VIHREA[2]
      rgba[i + 3] = 255
    }
  }
  return rgba
}

// --- Kirjoitus -------------------------------------------------------------

mkdirSync(KOHDE, { recursive: true })

const tiedostot = [
  ['pwa-64x64.png', 64, piirraTaulu(64)],
  ['pwa-192x192.png', 192, piirraTaulu(192)],
  ['pwa-512x512.png', 512, piirraTaulu(512)],
  ['apple-touch-icon-180x180.png', 180, piirraTaulu(180, { pyoristys: 0.5, tayttoOsuus: 0.78 })],
  ['maskable-icon-512x512.png', 512, piirraMaskable(512)],
]

for (const [nimi, koko, rgba] of tiedostot) {
  const polku = join(KOHDE, nimi)
  writeFileSync(polku, pngTavut(koko, koko, rgba))
  console.log(`kirjoitettu ${nimi} (${koko}×${koko})`)
}
