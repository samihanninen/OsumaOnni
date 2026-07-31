<script setup lang="ts">
import { computed, onScopeDispose, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useKisaStore } from '@/stores/kisa'
import { useLaiteStore } from '@/stores/laite'

/**
 * Muistuttaa, että tiedot ovat vain tässä laitteessa ja kertoo, kuinka kauan edellisestä
 * viennistä on. Selaimen sivustotietojen tyhjentäminen poistaa kirjatut tulokset, joten
 * pelkkä vientipainike ei riitä — käyttäjän on tiedettävä milloin viedä.
 */
const store = useKisaStore()
const laite = useLaiteStore()

/** Kello päivittyy minuutin välein, jotta "aikaa sitten" pysyy ajan tasalla. */
const nyt = ref(Date.now())
const ajastin = setInterval(() => (nyt.value = Date.now()), 60_000)
onScopeDispose(() => clearInterval(ajastin))

/** Näytetään vasta kun on jotain menetettävää. */
const onSisaltoa = computed(() => store.kilpailijoita > 0)

const minuutteja = computed(() => {
  if (!laite.viimeinenVienti) return null
  const aika = new Date(laite.viimeinenVienti).getTime()
  if (Number.isNaN(aika)) return null
  return Math.max(0, Math.floor((nyt.value - aika) / 60_000))
})

/** Muistutusraja: vientiä ei ole tehty lainkaan tai siitä on yli 30 minuuttia. */
const MUISTUTUS_MINUUTTIA = 30

const taso = computed<'piilossa' | 'muistutus' | 'kiireellinen'>(() => {
  if (!onSisaltoa.value) return 'piilossa'
  const m = minuutteja.value
  if (m === null) return 'kiireellinen'
  if (m >= MUISTUTUS_MINUUTTIA) return 'muistutus'
  return 'piilossa'
})

const kuluneetTeksti = computed(() => {
  const m = minuutteja.value
  if (m === null) return ''
  if (m < 60) return `${m} min sitten`
  const tunnit = Math.floor(m / 60)
  if (tunnit < 24) return `${tunnit} h ${m % 60} min sitten`
  return `${Math.floor(tunnit / 24)} vrk sitten`
})
</script>

<template>
  <aside
    v-if="taso !== 'piilossa'"
    class="varoitus"
    :class="`varoitus--${taso}`"
    role="status"
    aria-live="polite"
  >
    <span class="merkki" aria-hidden="true">{{ taso === 'kiireellinen' ? '⚠️' : '💾' }}</span>
    <span class="teksti">
      <template v-if="taso === 'kiireellinen'">
        <strong>Tuloksia ei ole viety tiedostoon.</strong>
        Tiedot ovat vain tässä laitteessa — selaimen tietojen tyhjentäminen poistaisi ne.
      </template>
      <template v-else>
        <strong>Edellinen vienti {{ kuluneetTeksti }}.</strong>
        Vie tulokset uudelleen, niin ne ovat turvassa myös laitteen ulkopuolella.
      </template>
    </span>
    <RouterLink to="/vienti" class="nappi vientinappi">Vie tulokset</RouterLink>
  </aside>
</template>

<style scoped>
.varoitus {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  padding: 0.6rem 0.85rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: var(--reunapyoristys);
  font-size: 0.88rem;
}
.varoitus--muistutus {
  background: var(--vari-varoitus-tausta);
  border-color: var(--vari-varoitus);
  color: var(--vari-varoitus);
}
.varoitus--kiireellinen {
  background: var(--vari-virhe-tausta);
  border-color: var(--vari-virhe);
  color: var(--vari-virhe);
}
.merkki {
  font-size: 1.1rem;
  flex: 0 0 auto;
}
.teksti {
  flex: 1 1 16rem;
  min-width: 0;
}
.vientinappi {
  flex: 0 0 auto;
  min-height: 38px;
  padding: 0.3rem 0.7rem;
  font-size: 0.85rem;
  background: transparent;
  border-color: currentcolor;
  color: inherit;
}

@media print {
  .varoitus {
    display: none;
  }
}
</style>
