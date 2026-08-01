/**
 * Luo M05-tyylisen pikselikuosin taustaksi.
 *
 * Kuosi piirretään ohjelmallisesti samasta syystä kuin sovelluskuvakkeet: se on omaa
 * jälkeä, toistettavissa ja ilman lisensointikysymyksiä. M05 on ruutupohjainen kuvio,
 * joten se syntyy luontevasti ruudukosta.
 *
 * Kuvio on saumaton: arvokenttä lasketaan ympäri kiertyvästä kohinasta, joten reunat
 * jatkuvat toisiinsa eikä toistuva tausta näytä ruudukolta.
 *
 * Aja: node scripts/luo-kuosi.mjs
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const JUURI = join(dirname(fileURLToPath(import.meta.url)), '..')
const KOHDE = join(JUURI, 'src/assets/m05.svg')

/** Ruutuja sivulla. Pieni ruudukko pitää tiedoston keveänä. */
const RUUTUJA = 40
/** Yhden ruudun koko käyttäjäyksikköinä. */
const RUUTU = 8
/** Karkean kohinakentän koko. Pienempi = suuremmat läiskät. */
const KOHINA = 5

/** Toistettava satunnaisluku: sama siemen tuottaa aina saman kuosin. */
function arpoja(siemen) {
  let tila = siemen >>> 0
  return () => {
    // xorshift32
    tila ^= tila << 13
    tila ^= tila >>> 17
    tila ^= tila << 5
    return ((tila >>> 0) % 100000) / 100000
  }
}

/** Ympäri kiertyvä kohinakenttä, jotta kuvio jatkuu saumattomasti. */
function luoKentta(arvo) {
  const kentta = []
  for (let y = 0; y < KOHINA; y++) {
    const rivi = []
    for (let x = 0; x < KOHINA; x++) rivi.push(arvo())
    kentta.push(rivi)
  }
  return kentta
}

function pehmeaArvo(kentta, x, y) {
  // Bilineaarinen interpolointi kiertävillä indekseillä.
  const fx = (x / RUUTUJA) * KOHINA
  const fy = (y / RUUTUJA) * KOHINA
  const x0 = Math.floor(fx)
  const y0 = Math.floor(fy)
  const tx = fx - x0
  const ty = fy - y0
  const kierra = (n) => ((n % KOHINA) + KOHINA) % KOHINA

  const a = kentta[kierra(y0)][kierra(x0)]
  const b = kentta[kierra(y0)][kierra(x0 + 1)]
  const c = kentta[kierra(y0 + 1)][kierra(x0)]
  const d = kentta[kierra(y0 + 1)][kierra(x0 + 1)]

  // Pehmennysfunktio tekee läiskien reunoista luontevammat.
  const sx = tx * tx * (3 - 2 * tx)
  const sy = ty * ty * (3 - 2 * ty)
  return a * (1 - sx) * (1 - sy) + b * sx * (1 - sy) + c * (1 - sx) * sy + d * sx * sy
}

/*
 * Värit kirjoitetaan tiedostoon sellaisenaan.
 *
 * CSS-muuttujat eivät kelpaa: taustakuvana ladattu SVG on oma dokumenttinsa eikä näe
 * sivun muuttujia. Siksi teemoille tehdään omat tiedostot, jotka valitaan
 * mediakyselyllä.
 */
const TEEMAT = {
  vaalea: ['#4a5b3a', '#6b7248', '#b7ab86', '#4b3f2f'],
  tumma: ['#3d4a30', '#545c3a', '#6f6a52', '#2f2820'],
}

function luoKuosi(siemen, varit) {
  const arvo = arpoja(siemen)
  const pohja = luoKentta(arvo)
  const lisa = luoKentta(arvo)

  // Ruudut väreittäin, jotta samasta väristä syntyy yksi path — pieni tiedosto.
  const ryhmat = varit.map(() => [])

  for (let y = 0; y < RUUTUJA; y++) {
    // Rivin värit ensin, jotta vierekkäiset samanväriset voi yhdistää yhdeksi laatikoksi.
    const rivi = []
    for (let x = 0; x < RUUTUJA; x++) {
      // Kaksi kenttää yhdessä rikkoo säännöllisyyden.
      const v = pehmeaArvo(pohja, x, y) * 0.7 + pehmeaArvo(lisa, x * 2, y * 2) * 0.3
      // Hieman kohinaa ruututasolla: M05:ssä läiskien reunat ovat rosoisia.
      const rosoinen = v + (arvo() - 0.5) * 0.12

      let indeksi = 0
      if (rosoinen > 0.72) indeksi = 3
      else if (rosoinen > 0.55) indeksi = 2
      else if (rosoinen > 0.38) indeksi = 1
      rivi.push(indeksi)
    }

    let alku = 0
    for (let x = 1; x <= RUUTUJA; x++) {
      if (x < RUUTUJA && rivi[x] === rivi[alku]) continue
      const leveys = (x - alku) * RUUTU
      ryhmat[rivi[alku]].push(`M${alku * RUUTU} ${y * RUUTU}h${leveys}v${RUUTU}h-${leveys}z`)
      alku = x
    }
  }

  const koko = RUUTUJA * RUUTU
  const polut = ryhmat
    .map((osat, i) => (osat.length ? `  <path fill="${varit[i]}" d="${osat.join('')}"/>` : ''))
    .filter(Boolean)
    .join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${koko} ${koko}" width="${koko}" height="${koko}">
  <title>M05-tyylinen pikselikuosi</title>
${polut}
</svg>
`
}

for (const [nimi, varit] of Object.entries(TEEMAT)) {
  const polku = KOHDE.replace('m05.svg', `m05-${nimi}.svg`)
  const sisalto = luoKuosi(20260801, varit)
  writeFileSync(polku, sisalto)
  console.log(`kirjoitettu ${polku} (${sisalto.length} tavua)`)
}
