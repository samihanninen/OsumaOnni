import { describe, it, expect } from 'vitest'
import {
  jasennaLaukaus,
  laukausKenttaan,
  naytaLaukaus,
  onLopullinenMerkki,
  onSyottoMerkki,
  NAPA_NAYTTO,
  OHI_NAYTTO,
  TYHJA_NAYTTO,
} from '../laukaus'

describe('laukauksen näyttömuoto', () => {
  it('napakymppi ja ohilaukaus saavat omat merkit', () => {
    expect(naytaLaukaus('*')).toBe(NAPA_NAYTTO)
    expect(naytaLaukaus('-')).toBe(OHI_NAYTTO)
    expect(naytaLaukaus(null)).toBe(TYHJA_NAYTTO)
  })

  it('nolla näytetään ohilaukauksena', () => {
    expect(naytaLaukaus(0)).toBe(OHI_NAYTTO)
  })

  it('numerot näytetään sellaisenaan', () => {
    expect(naytaLaukaus(10)).toBe('10')
    expect(naytaLaukaus(7)).toBe('7')
  })
})

describe('laukaus tekstikenttään', () => {
  it('käyttää datan merkkejä, ei näyttömerkkejä', () => {
    expect(laukausKenttaan('*')).toBe('*')
    expect(laukausKenttaan('-')).toBe('-')
    expect(laukausKenttaan(null)).toBe('')
    expect(laukausKenttaan(9)).toBe('9')
  })
})

describe('laukauksen jäsennys', () => {
  it('tyhjä tarkoittaa tyhjää ruutua', () => {
    expect(jasennaLaukaus('')).toBeNull()
    expect(jasennaLaukaus('   ')).toBeNull()
  })

  it('tähti ja iso X ovat napakymppi', () => {
    expect(jasennaLaukaus('*')).toBe('*')
    expect(jasennaLaukaus('X')).toBe('*')
    expect(jasennaLaukaus(NAPA_NAYTTO)).toBe('*')
  })

  it('miinus, piste, pieni x ja nolla ovat ohilaukaus', () => {
    expect(jasennaLaukaus('-')).toBe('-')
    expect(jasennaLaukaus('.')).toBe('-')
    expect(jasennaLaukaus('x')).toBe('-')
    expect(jasennaLaukaus('0')).toBe('-')
  })

  it('numerot 1–10 kelpaavat', () => {
    expect(jasennaLaukaus('1')).toBe(1)
    expect(jasennaLaukaus('9')).toBe(9)
    expect(jasennaLaukaus('10')).toBe(10)
  })

  it('liian suuret ja virheelliset hylätään', () => {
    expect(jasennaLaukaus('11')).toBeUndefined()
    expect(jasennaLaukaus('99')).toBeUndefined()
    expect(jasennaLaukaus('abc')).toBeUndefined()
    expect(jasennaLaukaus('1,5')).toBeUndefined()
  })
})

describe('näppäinten tunnistus', () => {
  it('numerot ja erikoismerkit ovat syöttömerkkejä', () => {
    for (const m of ['0', '5', '9', '*', 'x', 'X', '-', '.']) {
      expect(onSyottoMerkki(m)).toBe(true)
    }
    expect(onSyottoMerkki('a')).toBe(false)
    expect(onSyottoMerkki('Enter')).toBe(false)
  })

  it('ykkönen ei ole lopullinen, koska sitä voi seurata nolla', () => {
    expect(onLopullinenMerkki('1')).toBe(false)
    expect(onLopullinenMerkki('2')).toBe(true)
    expect(onLopullinenMerkki('0')).toBe(true)
    expect(onLopullinenMerkki('*')).toBe(true)
    expect(onLopullinenMerkki('-')).toBe(true)
  })
})
