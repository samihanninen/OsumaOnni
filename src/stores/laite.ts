import { defineStore } from 'pinia'
import { ref } from 'vue'
import { uusiId } from '@/core/tunnus'

/**
 * Laitekohtaiset tiedot. **Ei osa kisadataa** — näitä ei viedä eikä yhdistetä, koska ne
 * kuvaavat tätä laitetta eivätkä kilpailua.
 */
export const useLaiteStore = defineStore(
  'laite',
  () => {
    /** Pysyvä laitetunniste. Käytetään tulosten yhdistämisessä lähteen tunnistamiseen. */
    const laiteId = ref(uusiId())

    /** Käyttäjän antama nimi laitteelle, esim. "Koje 1" tai kirjaajan nimi. */
    const laiteNimi = ref('')

    /** Milloin tulokset on viimeksi viety tiedostoon (ISO). Tyhjä = ei koskaan. */
    const viimeinenVienti = ref('')

    /**
     * Onko tämä laite luovuttanut kisan eteenpäin? Vuorottelussa luovuttava laite
     * siirtyy vain luku -tilaan, jottei sama kisa haaraudu kahdelle laitteelle.
     */
    const luovutettu = ref(false)

    function nimea(nimi: string) {
      laiteNimi.value = nimi.trim()
    }

    function merkitseVienti(aika: string) {
      viimeinenVienti.value = aika
    }

    function merkitseLuovutetuksi() {
      luovutettu.value = true
    }

    /** Käyttäjä haluaa jatkaa kirjaamista luovutuksen jälkeen. */
    function jatkaSilti() {
      luovutettu.value = false
    }

    return {
      laiteId,
      laiteNimi,
      viimeinenVienti,
      luovutettu,
      nimea,
      merkitseVienti,
      merkitseLuovutetuksi,
      jatkaSilti,
    }
  },
  { persist: true },
)
