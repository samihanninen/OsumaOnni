/**
 * Tiedoston lataaminen selaimessa.
 *
 * Ei tarvita erillistä kirjastoa: object-URL ja <a download> riittävät.
 */

export const XLSX_TYYPPI = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

/** Lataa tavut tiedostona. */
export function lataaTiedosto(tavut: ArrayBuffer, tiedostonimi: string, tyyppi = XLSX_TYYPPI) {
  const blob = new Blob([tavut], { type: tyyppi })
  const url = URL.createObjectURL(blob)
  try {
    const a = document.createElement('a')
    a.href = url
    a.download = tiedostonimi
    a.rel = 'noopener'
    document.body.append(a)
    a.click()
    a.remove()
  } finally {
    // Vapautetaan vasta seuraavalla tapahtumakierroksella, jotta lataus ehtii alkaa.
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }
}

/** Lukee valitun tiedoston tavuiksi. */
export function lueTiedosto(tiedosto: File): Promise<ArrayBuffer> {
  return tiedosto.arrayBuffer()
}
