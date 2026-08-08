<script setup lang="ts">
import { computed } from 'vue'
import lahde from '../../KILPAILUOHJE.md?raw'
import { jasennaOhje } from '@/core/ohje'
import OhjeTeksti from '@/components/OhjeTeksti.vue'

/**
 * Kilpailupäivän ohje sovelluksen sisällä.
 *
 * Ohje luetaan `KILPAILUOHJE.md`:stä käännösaikana, joten se päivittyy samalla kun
 * tiedostoa muokataan eikä sisältö voi erota GitHubissa näkyvästä versiosta.
 *
 * Ohje on tarkoituksella osa sovellusta eikä linkki verkkoon: sitä luetaan radalla,
 * jossa yhteyttä ei ole. Service worker tallentaa tämän näkymän muun sovelluksen
 * mukana, joten ohje on luettavissa myös lentotilassa.
 */
const lohkot = computed(() => jasennaOhje(lahde))
</script>

<template>
  <section class="sivu ohje">
    <template v-for="(lohko, i) in lohkot" :key="i">
      <hr v-if="lohko.laji === 'viiva'" />

      <h1 v-else-if="lohko.laji === 'otsikko' && lohko.taso === 1">
        <OhjeTeksti :palat="lohko.palat" />
      </h1>
      <h2 v-else-if="lohko.laji === 'otsikko' && lohko.taso === 2">
        <OhjeTeksti :palat="lohko.palat" />
      </h2>
      <h3 v-else-if="lohko.laji === 'otsikko'">
        <OhjeTeksti :palat="lohko.palat" />
      </h3>

      <p v-else-if="lohko.laji === 'huomio'" class="huomio huomio--varoitus">
        <OhjeTeksti :palat="lohko.palat" />
      </p>

      <ol v-else-if="lohko.laji === 'lista' && lohko.numeroitu">
        <li v-for="(kohta, j) in lohko.kohdat" :key="j"><OhjeTeksti :palat="kohta" /></li>
      </ol>
      <ul v-else-if="lohko.laji === 'lista'">
        <li v-for="(kohta, j) in lohko.kohdat" :key="j"><OhjeTeksti :palat="kohta" /></li>
      </ul>

      <p v-else-if="lohko.laji === 'kappale'"><OhjeTeksti :palat="lohko.palat" /></p>
    </template>
  </section>
</template>

<style scoped>
/*
 * Ohjetta luetaan puhelimella, usein kirkkaassa valossa ja kiireessä. Riviväli ja
 * kohtien väli ovat siksi tavallista väljemmät.
 */
/*
 * Sivupohjan `.sivu > p` himmentää kappaleet, koska muissa näkymissä ne ovat lyhyitä
 * selitteitä. Ohjeessa kappaleet ovat itse asia, joten väri palautetaan — ja huomiot
 * saavat pitää oman varoitusvärinsä.
 */
.ohje > p {
  color: var(--vari-teksti);
}
.ohje > p.huomio--varoitus {
  color: var(--vari-varoitus);
}

.ohje h2 {
  margin-top: 2rem;
}
.ohje h3 {
  margin-top: 1.5rem;
}
.ohje li {
  margin-bottom: 0.5rem;
  line-height: 1.55;
}
.ohje ol,
.ohje ul {
  padding-left: 1.4rem;
}
.ohje hr {
  margin: 1.75rem 0;
  border: 0;
  border-top: 1px solid var(--vari-reuna);
}
.ohje code {
  padding: 0.05em 0.35em;
  border-radius: 4px;
  background: var(--vari-tausta-korotettu);
  border: 1px solid var(--vari-reuna);
  font-size: 0.95em;
}
</style>
