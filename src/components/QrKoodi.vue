<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

/**
 * Näyttää yhden QR-koodin.
 *
 * Kirjasto ladataan vasta tarvittaessa, jottei se paina sovelluksen käynnistystä.
 *
 * Virheenkorjaustaso on M eikä L: hyötykuorma on jaettu pieniin paloihin, joten
 * kapasiteetista ei ole pulaa, ja M sietää selvästi paremmin ruudun heijastuksia ja
 * puutteellista tarkennusta — juuri niitä, jotka haittaavat lukemista puhelimesta
 * toiseen.
 */
const props = withDefaults(
  defineProps<{
    teksti: string
    koko?: number
  }>(),
  // Iso koodi ruudulla = isot moduulit = helpompi tarkennus.
  { koko: 420 },
)

const kangas = ref<HTMLCanvasElement | null>(null)
const virhe = ref('')

async function piirra() {
  virhe.value = ''
  const el = kangas.value
  if (!el || !props.teksti) return

  try {
    const QR = await import('qrcode')
    await QR.toCanvas(el, props.teksti, {
      errorCorrectionLevel: 'M',
      // Hiljainen reunus on osa standardia; ilman sitä lukija ei löydä koodin rajoja.
      margin: 3,
      width: props.koko,
      color: { dark: '#000000ff', light: '#ffffffff' },
    })
  } catch (e) {
    virhe.value = e instanceof Error ? e.message : 'QR-koodin luonti epäonnistui.'
  }
}

onMounted(piirra)
watch(() => [props.teksti, props.koko], piirra)
</script>

<template>
  <div class="qr">
    <!--
      Koodi piirretään aina vaalealle pohjalle myös tummassa teemassa: lukija tarvitsee
      mustan kuvion vaalealla taustalla.
    -->
    <canvas ref="kangas" class="kangas" :aria-label="'QR-koodi tulosten siirtoon'" />
    <p v-if="virhe" class="huomio huomio--virhe">{{ virhe }}</p>
  </div>
</template>

<style scoped>
.qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.kangas {
  /* Käytetään koko käytettävissä oleva leveys: mitä isommat moduulit, sitä varmempi luku. */
  width: 100%;
  max-width: 26rem;
  height: auto;
  background: #fff;
  padding: 0.5rem;
  border-radius: var(--reunapyoristys);
  border: 1px solid var(--vari-reuna);
  /* Terävät reunat skaalatessa: sumentunut koodi on lukijalle vaikeampi. */
  image-rendering: pixelated;
}
</style>
