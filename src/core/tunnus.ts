/**
 * Tunnisteiden luonti.
 *
 * `crypto.randomUUID` vaatii turvallisen kontekstin (https tai localhost). GitHub Pages
 * on https, mutta varmuuden vuoksi käytetään varamenetelmää, jotta sovellus ei kaadu
 * esimerkiksi lähiverkon http-osoitteessa testattaessa.
 */
export function uusiId(): string {
  const c = globalThis.crypto
  if (c && typeof c.randomUUID === 'function') return c.randomUUID()

  if (c && typeof c.getRandomValues === 'function') {
    const tavut = c.getRandomValues(new Uint8Array(16))
    return [...tavut].map((t) => t.toString(16).padStart(2, '0')).join('')
  }

  // Viimeinen oljenkorsi. Ei kryptografisesti vahva, mutta riittää paikalliseen tunnisteeseen.
  return `id-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
}

/** Lyhyt, ihmiselle luettava tunniste esim. kisan tunnukseksi. */
export function lyhytTunnus(pituus = 8): string {
  const merkit = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // ilman helposti sekoittuvia I,O,0,1
  const c = globalThis.crypto
  const tavut =
    c && typeof c.getRandomValues === 'function'
      ? c.getRandomValues(new Uint8Array(pituus))
      : Array.from({ length: pituus }, () => Math.floor(Math.random() * 256))
  return [...tavut].map((t) => merkit[t % merkit.length] ?? 'X').join('')
}
