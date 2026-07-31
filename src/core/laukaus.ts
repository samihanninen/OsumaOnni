import { NAPAKYMPPI, OHI, type Laukaus } from '@/types/kisa'

/** Napakympin näyttömerkki käyttöliittymässä. Datassa ja viennissä käytetään `*`. */
export const NAPA_NAYTTO = '★'

/** Ohilaukauksen näyttömerkki. */
export const OHI_NAYTTO = '–'

/** Tyhjän ruudun näyttömerkki. */
export const TYHJA_NAYTTO = '·'

/** Muotoilee laukauksen käyttöliittymään. */
export function naytaLaukaus(l: Laukaus): string {
  if (l === NAPAKYMPPI) return NAPA_NAYTTO
  if (l === OHI) return OHI_NAYTTO
  if (l === null || l === undefined) return TYHJA_NAYTTO
  if (typeof l === 'number') return l === 0 ? OHI_NAYTTO : String(l)
  return TYHJA_NAYTTO
}

/** Muotoilee laukauksen tekstikenttään muokattavaksi (tyhjä = tyhjä merkkijono). */
export function laukausKenttaan(l: Laukaus): string {
  if (l === NAPAKYMPPI) return NAPAKYMPPI
  if (l === OHI) return OHI
  if (l === null || l === undefined) return ''
  if (typeof l === 'number') return String(l)
  return ''
}

/**
 * Jäsentää käyttäjän syöttämän tekstin laukaukseksi.
 *
 * Hyväksytään:
 * - `''` → tyhjä
 * - `-`, `.`, `x` (ohi) → ohilaukaus
 * - `*`, `X` → napakymppi
 * - `0`–`10` → numeerinen arvo (0 on ohilaukaus)
 *
 * Palauttaa `undefined`, jos syöte ei ole kelvollinen — kutsuja voi silloin jättää
 * arvon muuttamatta.
 */
export function jasennaLaukaus(teksti: string): Laukaus | undefined {
  const t = teksti.trim()
  if (t === '') return null
  if (t === NAPAKYMPPI || t === 'X' || t === NAPA_NAYTTO) return NAPAKYMPPI
  if (t === OHI || t === OHI_NAYTTO || t === '.' || t === 'x' || t === '_') return OHI

  if (/^\d{1,2}$/.test(t)) {
    const luku = Number(t)
    if (luku === 0) return OHI
    if (luku >= 1 && luku <= 10) return luku
  }
  return undefined
}

/** Sallitut näppäimet syöttökentässä (numerot ja erikoismerkit). */
export function onSyottoMerkki(merkki: string): boolean {
  return /^[0-9*xX.\-_]$/.test(merkki)
}

/**
 * Onko merkki sellainen, että syöte on varmasti valmis ja voi siirtyä seuraavaan
 * ruutuun? `1` ei ole, koska sitä voi seurata `0` (= 10).
 */
export function onLopullinenMerkki(merkki: string): boolean {
  return onSyottoMerkki(merkki) && merkki !== '1'
}

/** Näppäimistön näppäinten arvot syöttöjärjestyksessä. */
export const NAPPAIMISTON_ARVOT: Laukaus[] = [7, 8, 9, 10, 4, 5, 6, NAPAKYMPPI, 1, 2, 3, OHI]
