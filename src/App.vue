<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import TallennusVaroitus from '@/components/TallennusVaroitus.vue'
import PaivitysIlmoitus from '@/components/PaivitysIlmoitus.vue'
import { useLaiteStore } from '@/stores/laite'

const laite = useLaiteStore()

/** Syöttö ja sijoitukset ovat lajikohtaisia: palataan viimeksi käytettyyn lajiin. */
const laji = computed(() => laite.viimeinenLaji || 'RA1')
</script>

<template>
  <a class="ohita" href="#sisalto">Siirry sisältöön</a>

  <header class="ylapalkki">
    <RouterLink to="/" class="tunnus">
      <span class="tunnus-merkki" aria-hidden="true">🎯</span>
      <span class="tunnus-nimi">OsumaOnni</span>
    </RouterLink>

    <!-- Järjestys noudattaa kisan kulkua: syöttö ensin, koska sitä käytetään eniten. -->
    <nav class="valikko" aria-label="Päävalikko">
      <RouterLink :to="`/syota/${laji}`" class="valikko-ensisijainen">Syötä tulokset</RouterLink>
      <RouterLink :to="`/tulokset/${laji}`">Sijoitukset</RouterLink>
      <RouterLink to="/kilpailijat">Kilpailijat</RouterLink>
      <RouterLink to="/yhdistykset">Yhdistykset</RouterLink>
      <RouterLink to="/yhdista">Yhdistä</RouterLink>
      <RouterLink to="/vienti">Vienti</RouterLink>
      <RouterLink to="/kisatiedot">Kisatiedot</RouterLink>
    </nav>
  </header>

  <main id="sisalto" class="sisalto">
    <PaivitysIlmoitus />
    <TallennusVaroitus />
    <RouterView />
  </main>
</template>

<style scoped>
.ohita {
  position: absolute;
  left: -9999px;
}
.ohita:focus {
  left: 0.5rem;
  top: 0.5rem;
  z-index: 10;
  padding: 0.5rem 0.75rem;
  background: var(--vari-korostus);
  color: #fff;
  border-radius: 6px;
}

.ylapalkki {
  position: sticky;
  top: 0;
  z-index: 5;
  background: var(--vari-tausta-korotettu);
  border-bottom: 1px solid var(--vari-reuna);
}

.tunnus {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem 0.5rem;
  font-weight: 700;
  font-size: 1.15rem;
  color: var(--vari-teksti);
  text-decoration: none;
}
.tunnus-merkki {
  font-size: 1.3rem;
}

/* Horizontal scroll rather than wrapping: keeps the bar one row tall on phones */
.valikko {
  display: flex;
  gap: 0.25rem;
  padding: 0 0.5rem;
  overflow-x: auto;
  scrollbar-width: none;
}
.valikko::-webkit-scrollbar {
  display: none;
}

/*
 * Välilehdet ovat omia rajattuja painikkeitaan.
 *
 * Aiemmin ne olivat pelkkää tekstiä, jossa vain valittu sai alleviivauksen: vierekkäisiä
 * kohtia oli vaikea erottaa toisistaan, koska mikään ei kertonut mihin yksi loppuu ja
 * toinen alkaa. Reunus ja tausta tekevät rajat näkyviksi myös kirkkaassa valossa.
 */
.valikko a {
  flex: 0 0 auto;
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--vari-reuna);
  border-radius: 999px;
  background: var(--vari-tausta-korotettu);
  color: var(--vari-teksti);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  /* Riittävä kosketuskohde ilman että palkki kasvaa liian korkeaksi. */
  min-height: 40px;
  display: inline-flex;
  align-items: center;
}
.valikko a:hover {
  border-color: var(--vari-korostus);
}
.valikko a.router-link-active {
  background: var(--vari-korostus);
  border-color: var(--vari-korostus);
  color: #fff;
}

/* Tulosten kirjaaminen on sovelluksen pääasia, joten se erottuu myös valitsematta. */
.valikko-ensisijainen {
  border-color: var(--vari-korostus);
  color: var(--vari-korostus);
}
.valikko-ensisijainen.router-link-active {
  color: #fff;
}

.sisalto {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1rem;
}

@media (min-width: 768px) {
  .ylapalkki {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 0 1rem;
  }
  .tunnus {
    padding: 0.75rem 0;
  }
  .valikko {
    padding: 0;
  }
  .sisalto {
    padding: 1.5rem 1rem 3rem;
  }
}
</style>
