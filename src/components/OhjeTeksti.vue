<script setup lang="ts">
import type { Pala } from '@/core/ohje'

/**
 * Ohjeen rivin korostukset. Oma komponentti, koska sama rakenne toistuu otsikoissa,
 * kappaleissa, listakohdissa ja huomioissa.
 *
 * Sisältöä ei renderöidä `v-html`:llä vaikka lähde onkin omaa käännösaikaista tekstiä:
 * jäsennetty rakenne pitää merkinnän tarkasti siinä osajoukossa, jonka jäsennin tuntee,
 * eikä ohjeeseen voi vahingossa päätyä mitään suoritettavaa.
 */
defineProps<{ palat: Pala[] }>()
</script>

<template>
  <template v-for="(pala, i) in palat" :key="i">
    <strong v-if="pala.laji === 'vahva'">{{ pala.sisalto }}</strong>
    <code v-else-if="pala.laji === 'koodi'">{{ pala.sisalto }}</code>
    <template v-else>{{ pala.sisalto }}</template>
  </template>
</template>
