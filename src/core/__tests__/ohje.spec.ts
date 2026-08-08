import { describe, it, expect } from 'vitest'
import ohjeLahde from '../../../KILPAILUOHJE.md?raw'
import { jasennaOhje, jasennaPalat, type Lohko, type Pala } from '../ohje'

/** Kaikki lohkon tekstisisältö yhtenä merkkijonona. */
function teksti(lohko: Lohko): string {
  if (lohko.laji === 'viiva') return ''
  const palat: Pala[] = lohko.laji === 'lista' ? lohko.kohdat.flat() : lohko.palat
  return palat.map((pala) => pala.sisalto).join('')
}

describe('ohjeen jäsennys', () => {
  it('tunnistaa otsikot tasoineen', () => {
    const lohkot = jasennaOhje('# Yksi\n\n## Kaksi\n\n### Kolme')
    expect(lohkot.map((l) => (l.laji === 'otsikko' ? l.taso : null))).toEqual([1, 2, 3])
    expect(lohkot.map(teksti)).toEqual(['Yksi', 'Kaksi', 'Kolme'])
  })

  it('tunnistaa vaakaviivan eikä sekoita sitä luettelomerkkiin', () => {
    const lohkot = jasennaOhje('---\n\n- kohta')
    expect(lohkot[0]!.laji).toBe('viiva')
    expect(lohkot[1]!.laji).toBe('lista')
  })

  it('numeroi listan ja yhdistää sisennetyt jatkorivit samaan kohtaan', () => {
    const lohkot = jasennaOhje('1. Ensimmäinen\n   jatkuu tässä\n2. Toinen')
    const lista = lohkot[0]!
    expect(lista.laji).toBe('lista')
    if (lista.laji !== 'lista') return
    expect(lista.numeroitu).toBe(true)
    expect(lista.kohdat).toHaveLength(2)
    expect(lista.kohdat[0]!.map((p) => p.sisalto).join('')).toBe('Ensimmäinen jatkuu tässä')
  })

  it('erottaa numeroimattoman listan', () => {
    const lohkot = jasennaOhje('- yksi\n- kaksi')
    const lista = lohkot[0]!
    expect(lista.laji === 'lista' && lista.numeroitu).toBe(false)
    expect(lista.laji === 'lista' && lista.kohdat).toHaveLength(2)
  })

  it('kokoaa monirivisen huomion yhdeksi lohkoksi', () => {
    const lohkot = jasennaOhje('> Älä päivitä\n> kesken kisan.')
    expect(lohkot).toHaveLength(1)
    expect(lohkot[0]!.laji).toBe('huomio')
    expect(teksti(lohkot[0]!)).toBe('Älä päivitä kesken kisan.')
  })

  it('yhdistää kappaleen rivit ja katkaisee sen tyhjään riviin', () => {
    const lohkot = jasennaOhje('Rivi yksi\nrivi kaksi\n\nToinen kappale')
    expect(lohkot.map(teksti)).toEqual(['Rivi yksi rivi kaksi', 'Toinen kappale'])
  })

  it('poimii korostukset ja koodimerkinnät', () => {
    expect(jasennaPalat('Merkitse **napa** merkillä `*`.')).toEqual([
      { laji: 'teksti', sisalto: 'Merkitse ' },
      { laji: 'vahva', sisalto: 'napa' },
      { laji: 'teksti', sisalto: ' merkillä ' },
      { laji: 'koodi', sisalto: '*' },
      { laji: 'teksti', sisalto: '.' },
    ])
  })

  it('palauttaa aina vähintään yhden palan', () => {
    expect(jasennaPalat('')).toEqual([{ laji: 'teksti', sisalto: '' }])
  })
})

/*
 * Ohje on yksi ainoa lähde, ja jäsennin tuntee vain käytetyn Markdownin osajoukon.
 * Nämä testit kaatuvat, jos ohjeeseen lisätään merkintää jota jäsennin ei tunne —
 * muuten se päätyisi näkyviin raakana tähtinä ja viivoina.
 */
describe('KILPAILUOHJE.md', () => {
  const lohkot = jasennaOhje(ohjeLahde)

  it('alkaa ykköstason otsikolla', () => {
    expect(lohkot[0]).toMatchObject({ laji: 'otsikko', taso: 1 })
  })

  it('ei jätä jäsentämätöntä merkintää näkyviin', () => {
    for (const lohko of lohkot) {
      const sisalto = teksti(lohko)
      expect(sisalto).not.toMatch(/\*\*/)
      expect(sisalto).not.toMatch(/`/)
      expect(sisalto).not.toMatch(/^[-*]\s/)
      expect(sisalto).not.toMatch(/^#/)
      expect(sisalto).not.toMatch(/^>/)
      // Taulukkomerkintää jäsennin ei tunne lainkaan.
      expect(sisalto).not.toMatch(/\|/)
    }
  })

  it('sisältää päivitysohjeen, jota varten ohje ylipäätään on', () => {
    const kaikki = lohkot.map(teksti).join('\n')
    expect(kaikki).toContain('Myöhemmin')
    expect(kaikki).toContain('Älä päivitä sovellusta kisapäivänä.')
  })
})
