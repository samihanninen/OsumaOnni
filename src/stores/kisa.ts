import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type {
  IkaSarja,
  Kilpailija,
  Kisa,
  Laji,
  LajiMaaritys,
  Laukaus,
  Luokka,
  Osallistuminen,
} from '@/types/kisa'
import { LAJIT, LAJI_KOODIT, tyhjatKilpasarjat } from '@/core/lajit'
import { laskeLaji } from '@/core/laskenta'
import { lyhytTunnus, uusiId } from '@/core/tunnus'
import { useLaiteStore } from './laite'

function oletusLajiMaaritykset(): Record<Laji, LajiMaaritys> {
  // Syväkopio, jotta järjestäjän muokkaukset eivät muuta vakioita.
  return structuredClone(LAJIT)
}

export function tyhjaKisa(): Kisa {
  return {
    schemaVersion: 1,
    kisaId: lyhytTunnus(),
    kisatiedot: {
      nimi: '',
      jarjestaja: '',
      paikka: '',
      pvm: '',
      kilpailunjohtaja: '',
      tuomari: '',
      kirjuri: '',
      muistiinpanot: '',
    },
    asetukset: {
      laskettavatParhaat: 3,
      lajiMaaritykset: oletusLajiMaaritykset(),
    },
    kilpailijat: [],
  }
}

export const useKisaStore = defineStore(
  'kisa',
  () => {
    const kisa = ref<Kisa>(tyhjaKisa())

    // ---------- Johdetut tiedot ----------

    /** Yhdistysten nimet aiemmista syötteistä. Käytetään ehdotuslistana, jotta
     * kirjoitusasu pysyy samana — väärä kirjoitusasu rikkoisi yhdistyskilpailun. */
    const yhdistysEhdotukset = computed(() => {
      const nimet = new Set<string>()
      for (const k of kisa.value.kilpailijat) {
        const y = k.yhdistys?.trim()
        if (y) nimet.add(y)
      }
      return [...nimet].sort((a, b) => a.localeCompare(b, 'fi'))
    })

    const kilpailijoita = computed(() => kisa.value.kilpailijat.length)

    /** Montako kilpailijaa osallistuu kyseiseen lajiin. */
    function osallistujia(laji: Laji): number {
      return kisa.value.kilpailijat.filter((k) => k.osallistumiset[laji]).length
    }

    /** Kuinka moni lajin osallistuja on täysin kirjattu. */
    function valmiita(laji: Laji): number {
      const maaritys = kisa.value.asetukset.lajiMaaritykset[laji]
      let n = 0
      for (const k of kisa.value.kilpailijat) {
        const o = k.osallistumiset[laji]
        if (o && laskeLaji(laji, maaritys, o).valmis) n++
      }
      return n
    }

    const onTietoja = computed(
      () => kisa.value.kilpailijat.length > 0 || kisa.value.kisatiedot.nimi.trim() !== '',
    )

    function kilpailija(id: string): Kilpailija | undefined {
      return kisa.value.kilpailijat.find((k) => k.id === id)
    }

    // ---------- Kilpailijat ----------

    function lisaaKilpailija(tiedot: {
      etunimi: string
      sukunimi: string
      yhdistys: string
      ikasarja?: IkaSarja
    }): Kilpailija {
      const uusi: Kilpailija = {
        id: uusiId(),
        etunimi: tiedot.etunimi.trim(),
        sukunimi: tiedot.sukunimi.trim(),
        yhdistys: tiedot.yhdistys.trim(),
        ikasarja: tiedot.ikasarja ?? 'H',
        osallistumiset: {},
      }
      kisa.value.kilpailijat.push(uusi)
      return uusi
    }

    function paivitaKilpailija(id: string, muutokset: Partial<Omit<Kilpailija, 'id'>>) {
      const k = kilpailija(id)
      if (!k) return
      Object.assign(k, muutokset)
    }

    function poistaKilpailija(id: string) {
      const i = kisa.value.kilpailijat.findIndex((k) => k.id === id)
      if (i >= 0) kisa.value.kilpailijat.splice(i, 1)
    }

    // ---------- Osallistumiset ----------

    /** Lisää kilpailijan lajiin annetulla aseluokalla. */
    function lisaaOsallistuminen(id: string, laji: Laji, luokka: Luokka = 'vakio') {
      const k = kilpailija(id)
      if (!k || k.osallistumiset[laji]) return
      const maaritys = kisa.value.asetukset.lajiMaaritykset[laji]
      const osallistuminen: Osallistuminen = {
        luokka,
        kilpasarjat: tyhjatKilpasarjat(maaritys).map((laukaukset) => ({ laukaukset })),
        rangaistuksia: 0,
        hylatty: false,
      }
      k.osallistumiset[laji] = osallistuminen
    }

    /** Poistaa osallistumisen ja sen tulokset. */
    function poistaOsallistuminen(id: string, laji: Laji) {
      const k = kilpailija(id)
      if (!k) return
      delete k.osallistumiset[laji]
    }

    function asetaLuokka(id: string, laji: Laji, luokka: Luokka) {
      const o = kilpailija(id)?.osallistumiset[laji]
      if (o) o.luokka = luokka
    }

    function asetaRangaistukset(id: string, laji: Laji, maara: number) {
      const o = kilpailija(id)?.osallistumiset[laji]
      if (o) o.rangaistuksia = Math.max(0, Math.trunc(maara))
    }

    function asetaHylatty(id: string, laji: Laji, hylatty: boolean) {
      const o = kilpailija(id)?.osallistumiset[laji]
      if (o) o.hylatty = hylatty
    }

    function asetaHuomio(id: string, laji: Laji, huom: string) {
      const o = kilpailija(id)?.osallistumiset[laji]
      if (o) o.huom = huom
    }

    // ---------- Laukaukset ----------

    /**
     * Asettaa yhden laukauksen ja merkitsee sarjan muokatuksi. Muokkausaika ja laitetunnus
     * tarvitaan tulosten yhdistämisessä ristiriitojen tunnistamiseen.
     */
    function asetaLaukaus(
      id: string,
      laji: Laji,
      kilpasarja: number,
      laukaus: number,
      arvo: Laukaus,
    ) {
      const o = kilpailija(id)?.osallistumiset[laji]
      const sarja = o?.kilpasarjat[kilpasarja]
      if (!sarja) return
      if (laukaus < 0 || laukaus >= sarja.laukaukset.length) return

      sarja.laukaukset[laukaus] = arvo
      sarja.muokattu = new Date().toISOString()
      sarja.laiteId = useLaiteStore().laiteId
    }

    /** Tyhjentää yhden kilpasarjan laukaukset. */
    function tyhjennaKilpasarja(id: string, laji: Laji, kilpasarja: number) {
      const o = kilpailija(id)?.osallistumiset[laji]
      const sarja = o?.kilpasarjat[kilpasarja]
      if (!sarja) return
      sarja.laukaukset = sarja.laukaukset.map(() => null)
      sarja.muokattu = new Date().toISOString()
      sarja.laiteId = useLaiteStore().laiteId
    }

    // ---------- Asetukset ----------

    function asetaLaskettavatParhaat(maara: number) {
      kisa.value.asetukset.laskettavatParhaat = Math.max(1, Math.trunc(maara))
    }

    /**
     * Muuttaa lajin rakennetta ja sovittaa olemassa olevat kilpasarjat uuteen mittaan.
     * Lyhentäminen poistaa laukauksia lopusta, joten kutsuja vastaa varmistuksesta.
     */
    function asetaLajiMaaritys(laji: Laji, muutokset: Partial<LajiMaaritys>) {
      const maaritys = kisa.value.asetukset.lajiMaaritykset[laji]
      Object.assign(maaritys, muutokset)

      for (const k of kisa.value.kilpailijat) {
        const o = k.osallistumiset[laji]
        if (!o) continue

        // Sovita kilpasarjojen määrä.
        while (o.kilpasarjat.length < maaritys.kilpasarjoja) {
          o.kilpasarjat.push({
            laukaukset: Array.from({ length: maaritys.laukauksiaSarjassa }, () => null),
          })
        }
        o.kilpasarjat.length = maaritys.kilpasarjoja

        // Sovita laukausten määrä kussakin sarjassa.
        for (const sarja of o.kilpasarjat) {
          while (sarja.laukaukset.length < maaritys.laukauksiaSarjassa) sarja.laukaukset.push(null)
          sarja.laukaukset.length = maaritys.laukauksiaSarjassa
        }
      }
    }

    /** Palauttaa lajien rakenteet sääntöjen mukaisiin oletuksiin. */
    function palautaOletusRakenteet() {
      for (const laji of LAJI_KOODIT) {
        asetaLajiMaaritys(laji, LAJIT[laji])
      }
    }

    // ---------- Koko kisa ----------

    /** Korvaa kisan kokonaan, esim. tiedostosta tuotaessa. */
    function korvaaKisa(uusi: Kisa) {
      kisa.value = uusi
    }

    /** Aloittaa uuden tyhjän kisan. Kutsujan on varmistettava tämä käyttäjältä. */
    function aloitaUusi() {
      kisa.value = tyhjaKisa()
    }

    return {
      kisa,
      yhdistysEhdotukset,
      kilpailijoita,
      onTietoja,
      osallistujia,
      valmiita,
      kilpailija,
      lisaaKilpailija,
      paivitaKilpailija,
      poistaKilpailija,
      lisaaOsallistuminen,
      poistaOsallistuminen,
      asetaLuokka,
      asetaRangaistukset,
      asetaHylatty,
      asetaHuomio,
      asetaLaukaus,
      tyhjennaKilpasarja,
      asetaLaskettavatParhaat,
      asetaLajiMaaritys,
      palautaOletusRakenteet,
      korvaaKisa,
      aloitaUusi,
    }
  },
  { persist: true },
)
