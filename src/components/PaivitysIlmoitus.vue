<script setup lang="ts">
import { ref } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

/**
 * Sovelluksen päivitys.
 *
 * Päivitystä ei asenneta itsestään: kesken kilpailun tapahtuva uudelleenlataus olisi
 * hämmentävää, joten käyttäjä päättää ajankohdan. Tiedot säilyvät kummassakin
 * tapauksessa, koska ne ovat localStoragessa.
 */
const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW()
const piilotettu = ref(false)

function paivita() {
  void updateServiceWorker(true)
}

function ohita() {
  piilotettu.value = true
  needRefresh.value = false
  offlineReady.value = false
}
</script>

<template>
  <aside
    v-if="!piilotettu && (needRefresh || offlineReady)"
    class="ilmoitus"
    role="status"
    aria-live="polite"
  >
    <template v-if="needRefresh">
      <span class="teksti">
        <strong>Uusi versio saatavilla.</strong> Kirjatut tulokset säilyvät päivityksessä.
      </span>
      <button type="button" class="nappi nappi--ensisijainen pieni" @click="paivita">
        Päivitä
      </button>
      <button type="button" class="nappi pieni" @click="ohita">Myöhemmin</button>
    </template>
    <template v-else>
      <span class="teksti">
        <strong>Sovellus toimii nyt myös ilman verkkoyhteyttä.</strong>
      </span>
      <button type="button" class="nappi pieni" @click="ohita">Selvä</button>
    </template>
  </aside>
</template>

<style scoped>
.ilmoitus {
  position: fixed;
  bottom: 0.75rem;
  left: 0.75rem;
  right: 0.75rem;
  z-index: 20;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  max-width: 34rem;
  margin: 0 auto;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--vari-korostus);
  border-radius: var(--reunapyoristys);
  background: var(--vari-tausta-korotettu);
  box-shadow: var(--varjo);
  font-size: 0.88rem;
}
.teksti {
  flex: 1 1 14rem;
}
.pieni {
  min-height: 38px;
  padding: 0.3rem 0.7rem;
  font-size: 0.85rem;
}

@media print {
  .ilmoitus {
    display: none;
  }
}
</style>
