import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TallennusVaroitus from '../TallennusVaroitus.vue'
import { useKisaStore } from '@/stores/kisa'
import { useLaiteStore } from '@/stores/laite'

const globaalit = { stubs: { RouterLink: { template: '<a><slot /></a>' } } }

describe('TallennusVaroitus', () => {
  let kisa: ReturnType<typeof useKisaStore>
  let laite: ReturnType<typeof useLaiteStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    kisa = useKisaStore()
    laite = useLaiteStore()
  })

  function lisaaKilpailija() {
    kisa.lisaaKilpailija({ etunimi: 'A', sukunimi: 'B', yhdistys: 'C' })
  }

  it('on piilossa kun kirjattavaa ei ole', () => {
    const wrapper = mount(TallennusVaroitus, { global: globaalit })
    expect(wrapper.find('.varoitus').exists()).toBe(false)
  })

  it('varoittaa kiireellisesti, kun vientiä ei ole tehty lainkaan', () => {
    lisaaKilpailija()
    const wrapper = mount(TallennusVaroitus, { global: globaalit })
    expect(wrapper.find('.varoitus--kiireellinen').exists()).toBe(true)
    expect(wrapper.text()).toContain('ei ole viety tiedostoon')
  })

  it('vaikenee heti viennin jälkeen', () => {
    lisaaKilpailija()
    laite.merkitseVienti(new Date().toISOString())
    const wrapper = mount(TallennusVaroitus, { global: globaalit })
    expect(wrapper.find('.varoitus').exists()).toBe(false)
  })

  it('muistuttaa, kun edellisestä viennistä on yli 30 minuuttia', () => {
    lisaaKilpailija()
    laite.merkitseVienti(new Date(Date.now() - 45 * 60_000).toISOString())
    const wrapper = mount(TallennusVaroitus, { global: globaalit })
    expect(wrapper.find('.varoitus--muistutus').exists()).toBe(true)
    expect(wrapper.text()).toContain('45 min sitten')
  })

  it('näyttää tunnit ja minuutit pidemmällä välillä', () => {
    lisaaKilpailija()
    laite.merkitseVienti(new Date(Date.now() - (2 * 60 + 15) * 60_000).toISOString())
    const wrapper = mount(TallennusVaroitus, { global: globaalit })
    expect(wrapper.text()).toContain('2 h 15 min sitten')
  })

  it('näyttää vuorokaudet vielä pidemmällä välillä', () => {
    lisaaKilpailija()
    laite.merkitseVienti(new Date(Date.now() - 3 * 24 * 3600_000).toISOString())
    const wrapper = mount(TallennusVaroitus, { global: globaalit })
    expect(wrapper.text()).toContain('3 vrk sitten')
  })

  it('kelvoton aikaleima käsitellään kuin vientiä ei olisi tehty', () => {
    lisaaKilpailija()
    laite.merkitseVienti('ei-aikaleima')
    const wrapper = mount(TallennusVaroitus, { global: globaalit })
    expect(wrapper.find('.varoitus--kiireellinen').exists()).toBe(true)
  })
})
