<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'

/**
 * Näyttää yhden QR-koodin.
 *
 * Koko määräytyy käytettävissä olevasta tilasta, ei kiinteästä pikselimäärästä.
 * `qrcode` kirjoittaa canvasille inline-tyylit `style.width` ja `style.height`, jotka
 * jyräävät tyylitiedoston säännöt — kiinteä leveys valui siksi kapealla puhelimella
 * ruudun reunojen yli. Nyt kuva piirretään mitatun leveyden ja näytön pikselitiheyden
 * tulona ja skaalataan takaisin CSS-pikseleihin, jolloin se sekä mahtuu ruudulle että
 * on täsmälleen niin tarkka kuin näyttö sallii.
 *
 * Virheenkorjaustaso on M eikä L: hyötykuorma on jaettu pieniin paloihin, joten
 * kapasiteetista ei ole pulaa, ja M sietää selvästi paremmin heijastuksia ja
 * puutteellista tarkennusta — juuri niitä, jotka haittaavat lukemista puhelimesta
 * toiseen.
 */
const props = defineProps<{ teksti: string }>()

/** Suurin näyttökoko. Tätä isompi ei enää paranna luettavuutta. */
const SUURIN_LEVEYS = 420

const kangas = useTemplateRef<HTMLCanvasElement>('kangas')
const kehys = useTemplateRef<HTMLDivElement>('kehys')
const virhe = ref('')

let tarkkailija: ResizeObserver | null = null

async function piirra() {
  virhe.value = ''
  const el = kangas.value
  const alue = kehys.value
  if (!el || !alue || !props.teksti) return

  // Mitattu leveys, rajattuna järkevään maksimiin.
  const leveys = Math.max(120, Math.min(Math.floor(alue.clientWidth), SUURIN_LEVEYS))
  // Piirretään laitteen pikselitiheydellä, jotta moduulien reunat pysyvät terävinä.
  const tiheys = Math.min(window.devicePixelRatio || 1, 3)

  try {
    const QR = await import('qrcode')
    await QR.toCanvas(el, props.teksti, {
      errorCorrectionLevel: 'M',
      // Hiljainen reunus on osa standardia; ilman sitä lukija ei löydä koodin rajoja.
      margin: 3,
      width: Math.round(leveys * tiheys),
      color: { dark: '#000000ff', light: '#ffffffff' },
    })

    // Kirjaston asettamat inline-tyylit korvataan, jotta kuva mahtuu ruudulle.
    el.style.width = `${leveys}px`
    el.style.height = `${leveys}px`
  } catch (e) {
    virhe.value = e instanceof Error ? e.message : 'QR-koodin luonti epäonnistui.'
  }
}

onMounted(() => {
  void piirra()
  if (typeof ResizeObserver === 'function' && kehys.value) {
    // Näytön kääntäminen tai ikkunan koon muutos piirtää koodin uudelleen.
    tarkkailija = new ResizeObserver(() => void piirra())
    tarkkailija.observe(kehys.value)
  }
})

onBeforeUnmount(() => tarkkailija?.disconnect())

watch(() => props.teksti, piirra)
</script>

<template>
  <div ref="kehys" class="qr">
    <!--
      Koodi piirretään aina vaalealle pohjalle myös tummassa teemassa: lukija tarvitsee
      mustan kuvion vaalealla taustalla.
    -->
    <canvas ref="kangas" class="kangas" aria-label="QR-koodi tulosten siirtoon" />
    <p v-if="virhe" class="huomio huomio--virhe">{{ virhe }}</p>
  </div>
</template>

<style scoped>
.qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  /* Kehys mittaa käytettävissä olevan tilan; min-width estää flexiä leviämästä. */
  width: 100%;
  min-width: 0;
}
.kangas {
  /* Varmuuden vuoksi myös tyylissä: kuva ei koskaan saa ylittää kehystään. */
  max-width: 100%;
  height: auto;
  background: #fff;
  border-radius: var(--reunapyoristys);
  border: 1px solid var(--vari-reuna);
}
</style>
