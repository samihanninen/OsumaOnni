import { describe, it, expect } from 'vitest'
import { onLohkonLatausVirhe } from '../index'

/**
 * Lohkotiedoston latausvirheen tunnistus.
 *
 * Selaimet muotoilevat viestin eri tavoin, ja väärä tunnistus on kallis kumpaankin
 * suuntaan: tunnistamatta jäänyt virhe jättää linkit toimimattomiksi, ja liian herkkä
 * tunnistus lataisi sivun uudelleen tavallisen virheen takia.
 */
describe('lohkon latausvirheen tunnistus', () => {
  it('tunnistaa Chromen ja Viten viestit', () => {
    expect(
      onLohkonLatausVirhe(new TypeError('Failed to fetch dynamically imported module: /a/b.js')),
    ).toBe(true)
    expect(onLohkonLatausVirhe(new TypeError('error loading dynamically imported module'))).toBe(
      true,
    )
  })

  it('tunnistaa Safarin viestin', () => {
    expect(onLohkonLatausVirhe(new TypeError('Importing a module script failed.'))).toBe(true)
  })

  it('tunnistaa nimetyn ChunkLoadErrorin', () => {
    const virhe = new Error('Loading chunk 42 failed')
    virhe.name = 'ChunkLoadError'
    expect(onLohkonLatausVirhe(virhe)).toBe(true)
  })

  it('ei tulkitse tavallisia virheitä latausvirheiksi', () => {
    expect(onLohkonLatausVirhe(new Error('Jokin muu meni pieleen'))).toBe(false)
    expect(onLohkonLatausVirhe(new TypeError('undefined is not a function'))).toBe(false)
    expect(onLohkonLatausVirhe(null)).toBe(false)
    expect(onLohkonLatausVirhe('navigation aborted')).toBe(false)
  })
})
