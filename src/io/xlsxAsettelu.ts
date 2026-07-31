import type { Laji, LajiMaaritys } from '@/types/kisa'

/** Tiedostomuodon versio. Kasvatetaan, jos asettelu muuttuu yhteensopimattomasti. */
export const TIEDOSTO_VERSIO = 1

export const SOVELLUS_NIMI = 'OsumaOnni'

/** Muista päivittää julkaisun yhteydessä. */
export const SOVELLUS_VERSIO = '0.1.0'

export const META_VALILEHTI = '_meta'
export const KISATIEDOT_VALILEHTI = 'Kisatiedot'
export const YHDISTYKSET_VALILEHTI = 'Yhdistykset'

export function tuloskorttiNimi(laji: Laji): string {
  return `Tuloskortti ${laji}`
}

export function sijoituksetNimi(laji: Laji): string {
  return `Sijoitukset ${laji}`
}

/** Sarakenumero (1 = A) kirjaimeksi. ExcelJS ei tarjoa tätä julkisesti. */
export function sarakeKirjain(numero: number): string {
  let n = numero
  let tulos = ''
  while (n > 0) {
    const jaannos = (n - 1) % 26
    tulos = String.fromCharCode(65 + jaannos) + tulos
    n = Math.floor((n - 1) / 26)
  }
  return tulos
}

/** Solun A1-viittaus. */
export function solu(rivi: number, sarake: number): string {
  return `${sarakeKirjain(sarake)}${rivi}`
}

/** Alue A1:B2 -muodossa. */
export function alue(rivi: number, alkuSarake: number, loppuSarake: number): string {
  return `${solu(rivi, alkuSarake)}:${solu(rivi, loppuSarake)}`
}

export const OTSIKKO_RIVI = 3
export const ENSIMMAINEN_DATARIVI = 4

/** Kilpailijan perustiedot ennen laukaussarakkeita. */
export const PERUSSARAKKEET = [
  '#',
  'Sukunimi',
  'Etunimi',
  'Yhdistys',
  'Ikäsarja',
  'Luokka',
] as const

/**
 * Tuloskortin sarakeasettelu. Lasketaan lajin rakenteesta, koska sarjojen ja laukausten
 * määrä on asetus eikä vakio. Sama asettelu ohjaa sekä vientiä että tuontia.
 */
export interface Asettelu {
  /** Kilpasarjojen määrä. */
  kilpasarjoja: number
  laukauksiaSarjassa: number
  /** Ensimmäinen laukaussarake kilpasarjassa `s` (0-alkuinen). */
  laukausAlku: (s: number) => number
  laukausLoppu: (s: number) => number
  sarjaYht: (s: number) => number
  sarjaNavat: (s: number) => number
  sarjaIskemat: (s: number) => number
  tulos: number
  iskemat: number
  navat: number
  rikkeet: number
  hylatty: number
  huom: number
  /** Piilotettu sarake kilpailijan tunnisteelle, jotta tuonti osuu oikeaan riviin. */
  tunnus: number
  leveys: number
}

/** Kolme johdettua saraketta kilpasarjaa kohti: Yht, ★ ja Isk. */
const JOHDETUT_PER_SARJA = 3

export function luoAsettelu(maaritys: LajiMaaritys): Asettelu {
  const { kilpasarjoja, laukauksiaSarjassa } = maaritys
  const perus = PERUSSARAKKEET.length

  const lohko = laukauksiaSarjassa + JOHDETUT_PER_SARJA
  const laukausAlku = (s: number) => perus + s * lohko + 1
  const laukausLoppu = (s: number) => laukausAlku(s) + laukauksiaSarjassa - 1
  const sarjaYht = (s: number) => laukausLoppu(s) + 1
  const sarjaNavat = (s: number) => laukausLoppu(s) + 2
  const sarjaIskemat = (s: number) => laukausLoppu(s) + 3

  const jalkeen = perus + kilpasarjoja * lohko
  const tulos = jalkeen + 1
  const iskemat = jalkeen + 2
  const navat = jalkeen + 3
  const rikkeet = jalkeen + 4
  const hylatty = jalkeen + 5
  const huom = jalkeen + 6
  const tunnus = jalkeen + 7

  return {
    kilpasarjoja,
    laukauksiaSarjassa,
    laukausAlku,
    laukausLoppu,
    sarjaYht,
    sarjaNavat,
    sarjaIskemat,
    tulos,
    iskemat,
    navat,
    rikkeet,
    hylatty,
    huom,
    tunnus,
    leveys: tunnus,
  }
}

/**
 * Kaavat johdetuille sarakkeille. Käytetään tarkoituksella tavallisia funktioita
 * (SUMIF/COUNTIF) eikä taulukkokaavoja: alkuperäisen Excelin SUMPRODUCT(IF(...))
 * vaatii uudemman Excelin, ja SORTBY/FILTER-tyyliset kaavat eivät ole ExcelJS:llä
 * luotettavasti kirjoitettavissa.
 */
export const KAAVAT = {
  /** Sarjan pisteet: numerot ≥ 1 plus napakympit kymppeinä. */
  sarjaYht(alueViite: string): string {
    return `SUMIF(${alueViite},">=1")+COUNTIF(${alueViite},"*")*10`
  },
  /** Napakymppien määrä. */
  navat(alueViite: string): string {
    return `COUNTIF(${alueViite},"*")`
  },
  /** Iskemien määrä: osumat numerorenkaisiin, eli numerot ≥ 1 ja napakympit. */
  iskemat(alueViite: string): string {
    return `COUNTIF(${alueViite},">=1")+COUNTIF(${alueViite},"*")`
  },
  /**
   * Kilpailutulos. Rangaistus on 2 pistettä kerrallaan, hylätyn tulos on 0, eikä
   * tulos voi mennä negatiiviseksi.
   */
  tulos(yhtSolut: string[], rikeSolu: string, hylattySolu: string, summa: boolean): string {
    const pohja = summa ? `SUM(${yhtSolut.join(',')})` : `MAX(${yhtSolut.join(',')})`
    return `IF(${hylattySolu}="x",0,MAX(0,${pohja}-2*N(${rikeSolu})))`
  },
}
