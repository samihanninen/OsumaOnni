<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

/**
 * Näyttää yhden QR-koodin.
 *
 * Kirjasto ladataan vasta tarvittaessa, jottei se paina sovelluksen käynnistystä.
 * Virheenkorjaustaso on tarkoituksella matalin mahdollinen (L): se jättää eniten tilaa
 * datalle, ja koodi luetaan tyypillisesti hyvissä oloissa ruudulta ruudulle.
 */
const props = withDefaults(
  defineProps<{
    teksti: string
    koko?: number
  }>(),
  { koko: 320 },
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
      errorCorrectionLevel: 'L',
      margin: 2,
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
  max-width: 100%;
  height: auto;
  background: #fff;
  padding: 0.5rem;
  border-radius: var(--reunapyoristys);
  border: 1px solid var(--vari-reuna);
}
</style>
