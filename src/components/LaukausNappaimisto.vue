<script setup lang="ts">
import type { Laukaus } from '@/types/kisa'
import { NAPPAIMISTON_ARVOT, naytaLaukaus } from '@/core/laukaus'

/**
 * Iso kosketusnäppäimistö laukausten syöttöön. Näppäinten järjestys noudattaa
 * puhelimen numeronäppäimistöä, jotta suuret arvot ovat ylhäällä.
 */
defineProps<{
  /** Estä syöttö, esim. kun laite on luovuttanut kisan eteenpäin. */
  lukittu?: boolean
}>()

const emit = defineEmits<{
  syota: [arvo: Laukaus]
  peruuta: []
  seuraava: []
  edellinen: []
}>()

function nimi(arvo: Laukaus): string {
  if (arvo === '*') return 'napakymppi'
  if (arvo === '-') return 'ohilaukaus'
  return `${arvo} pistettä`
}
</script>

<template>
  <div class="nappaimisto" role="group" aria-label="Laukausten syöttö">
    <button
      v-for="arvo in NAPPAIMISTON_ARVOT"
      :key="String(arvo)"
      type="button"
      class="nappain"
      :class="{
        'nappain--napa': arvo === '*',
        'nappain--ohi': arvo === '-',
      }"
      :disabled="lukittu"
      :aria-label="nimi(arvo)"
      @click="emit('syota', arvo)"
    >
      {{ naytaLaukaus(arvo) }}
    </button>

    <button
      type="button"
      class="nappain nappain--toiminto"
      :disabled="lukittu"
      aria-label="Poista viimeinen"
      @click="emit('peruuta')"
    >
      ⌫
    </button>

    <button
      type="button"
      class="nappain nappain--toiminto nappain--leveä"
      aria-label="Edellinen kilpailija"
      @click="emit('edellinen')"
    >
      ‹ Edellinen
    </button>

    <button
      type="button"
      class="nappain nappain--toiminto nappain--leveä"
      aria-label="Seuraava kilpailija"
      @click="emit('seuraava')"
    >
      Seuraava ›
    </button>
  </div>
</template>

<style scoped>
.nappaimisto {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  max-width: 26rem;
  margin: 0 auto;
}

.nappain {
  /* Iso kosketuskohde: kirjaaminen tapahtuu ampumaradalla, usein hanskat kädessä. */
  min-height: 56px;
  font: inherit;
  font-size: 1.25rem;
  font-weight: 700;
  border: 1px solid var(--vari-reuna);
  border-radius: var(--reunapyoristys);
  background: var(--vari-tausta-korotettu);
  color: var(--vari-teksti);
  cursor: pointer;
  /* Estä tuplanapautuksen zoom ja tekstin valinta nopeassa syötössä */
  touch-action: manipulation;
  user-select: none;
}
.nappain:active {
  background: var(--vari-korostus-himmea);
  border-color: var(--vari-korostus);
}
.nappain:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.nappain--napa {
  color: var(--vari-korostus);
  border-color: var(--vari-korostus);
}
.nappain--ohi {
  color: var(--vari-teksti-himmea);
}
.nappain--toiminto {
  font-size: 1rem;
  font-weight: 600;
}
.nappain--leveä {
  grid-column: span 2;
  min-height: 48px;
}
</style>
