<script setup lang="ts">
import { onBeforeUnmount, ref, useTemplateRef } from 'vue'

/**
 * QR-koodien lukeminen kameralla.
 *
 * Käytetään selaimen omaa `BarcodeDetector`ia silloin kun se on olemassa (Android ja
 * Chrome). iOS-Safarista se puuttuu, joten varalla on jsQR, joka tutkii videokuvasta
 * napattuja ruutuja. Ilman varamenetelmää QR-lukeminen ei toimisi lainkaan iPhonella —
 * eli juuri sillä laitteella, jolla tuloksia todennäköisimmin kirjataan.
 *
 * Kamera vaatii https-yhteyden (GitHub Pages tarjoaa sen) ja käyttäjän eleen.
 */

const emit = defineEmits<{ luettu: [teksti: string] }>()

const video = useTemplateRef<HTMLVideoElement>('video')
const tila = ref<'suljettu' | 'kaynnistyy' | 'lukee' | 'virhe'>('suljettu')
const virhe = ref('')
const tapa = ref<'natiivi' | 'jsqr' | ''>('')

let virta: MediaStream | null = null
let animaatio = 0
let piilokangas: HTMLCanvasElement | null = null
/** Viimeksi luettu teksti: estää saman koodin ilmoittamisen kymmeniä kertoja sekunnissa. */
let edellinen = ''

interface Tunnistin {
  detect: (lahde: CanvasImageSource) => Promise<{ rawValue: string }[]>
}

function haeNatiiviTunnistin(): Tunnistin | null {
  const G = globalThis as unknown as {
    BarcodeDetector?: new (asetukset?: { formats?: string[] }) => Tunnistin
  }
  if (typeof G.BarcodeDetector !== 'function') return null
  try {
    return new G.BarcodeDetector({ formats: ['qr_code'] })
  } catch {
    return null
  }
}

async function kaynnista() {
  virhe.value = ''
  tila.value = 'kaynnistyy'

  if (!navigator.mediaDevices?.getUserMedia) {
    virhe.value =
      'Selain ei tarjoa kameraa käyttöön. Voit liittää koodin tekstinä tai käyttää tiedostoa.'
    tila.value = 'virhe'
    return
  }

  try {
    virta = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false,
    })
  } catch (e) {
    virhe.value =
      e instanceof DOMException && e.name === 'NotAllowedError'
        ? 'Kameran käyttö estettiin. Salli kamera selaimen asetuksista tai käytä tekstiliittämistä.'
        : 'Kameraa ei voitu avata. Voit liittää koodin tekstinä tai käyttää tiedostoa.'
    tila.value = 'virhe'
    return
  }

  const el = video.value
  if (!el) return
  el.srcObject = virta
  el.setAttribute('playsinline', 'true') // iOS ei muuten näytä videota sivun sisällä
  await el.play()

  tila.value = 'lukee'
  void lueSilmukka()
}

async function lueSilmukka() {
  const natiivi = haeNatiiviTunnistin()
  tapa.value = natiivi ? 'natiivi' : 'jsqr'

  const jsQR = natiivi ? null : (await import('jsqr')).default

  const askel = async () => {
    if (tila.value !== 'lukee') return
    const el = video.value
    if (el && el.readyState >= 2) {
      try {
        let teksti: string | null = null

        if (natiivi) {
          const osumat = await natiivi.detect(el)
          teksti = osumat[0]?.rawValue ?? null
        } else if (jsQR) {
          piilokangas ??= document.createElement('canvas')
          const leveys = el.videoWidth
          const korkeus = el.videoHeight
          if (leveys > 0 && korkeus > 0) {
            piilokangas.width = leveys
            piilokangas.height = korkeus
            const ctx = piilokangas.getContext('2d', { willReadFrequently: true })
            if (ctx) {
              ctx.drawImage(el, 0, 0, leveys, korkeus)
              const kuva = ctx.getImageData(0, 0, leveys, korkeus)
              teksti = jsQR(kuva.data, leveys, korkeus)?.data ?? null
            }
          }
        }

        if (teksti && teksti !== edellinen) {
          edellinen = teksti
          emit('luettu', teksti)
        }
      } catch {
        // Yksittäinen epäonnistunut ruutu ei ole virhe; jatketaan seuraavaan.
      }
    }
    animaatio = requestAnimationFrame(() => void askel())
  }

  await askel()
}

function pysayta() {
  tila.value = 'suljettu'
  edellinen = ''
  if (animaatio) cancelAnimationFrame(animaatio)
  animaatio = 0
  virta?.getTracks().forEach((t) => t.stop())
  virta = null
  if (video.value) video.value.srcObject = null
}

/** Sallii saman koodin lukemisen uudelleen, esim. kun odotetaan seuraavaa osaa. */
function nollaaViimeisin() {
  edellinen = ''
}

defineExpose({ pysayta, nollaaViimeisin })
onBeforeUnmount(pysayta)
</script>

<template>
  <div class="lukija">
    <div v-show="tila === 'lukee'" class="kuva">
      <video ref="video" class="video" muted playsinline></video>
      <div class="tahtain" aria-hidden="true"></div>
    </div>

    <p v-if="virhe" class="huomio huomio--virhe">{{ virhe }}</p>

    <div class="napit">
      <button
        v-if="tila !== 'lukee'"
        type="button"
        class="nappi nappi--ensisijainen"
        :disabled="tila === 'kaynnistyy'"
        @click="kaynnista"
      >
        {{ tila === 'kaynnistyy' ? 'Avataan kameraa…' : 'Avaa kamera' }}
      </button>
      <button v-else type="button" class="nappi" @click="pysayta">Sulje kamera</button>
    </div>

    <p v-if="tila === 'lukee'" class="vihje">
      Kohdista QR-koodi ruudun keskelle.
      <span v-if="tapa === 'jsqr'">Luku voi kestää hetken tällä laitteella.</span>
    </p>
  </div>
</template>

<style scoped>
.lukija {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.kuva {
  position: relative;
  align-self: center;
  width: 100%;
  max-width: 24rem;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: var(--reunapyoristys);
  background: #000;
}
.video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.tahtain {
  position: absolute;
  inset: 15%;
  border: 3px solid var(--vari-korostus);
  border-radius: 12px;
  pointer-events: none;
}
.napit {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.vihje {
  font-size: 0.85rem;
  color: var(--vari-teksti-himmea);
}
</style>
