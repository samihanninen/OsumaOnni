<script setup lang="ts">
import { RouterLink } from 'vue-router'

const osiot = [
  {
    polku: '/kisatiedot',
    merkki: '🏆',
    otsikko: 'Kisatiedot',
    kuvaus: 'Kisan nimi, paikka, päivämäärä ja vastuuhenkilöt.',
  },
  {
    polku: '/kilpailijat',
    merkki: '👥',
    otsikko: 'Kilpailijat',
    kuvaus: 'Lisää kilpailijat, yhdistykset ja luokat joihin he osallistuvat.',
  },
  {
    polku: '/yhdistykset',
    merkki: '📊',
    otsikko: 'Yhdistyskilpailu',
    kuvaus: 'Yhdistysten tilanne luokittain ja yhteistuloksena.',
  },
  {
    polku: '/yhdista',
    merkki: '🔗',
    otsikko: 'Yhdistä tulokset',
    kuvaus: 'Kerää usean kirjaajan tulokset yhdelle laitteelle.',
  },
  {
    polku: '/vienti',
    merkki: '💾',
    otsikko: 'Vienti ja tuonti',
    kuvaus: 'Tallenna tulokset Excel-tiedostoon tai lue ne takaisin.',
  },
]
</script>

<template>
  <section class="sivu">
    <h1>Reserviläisammunnan tuloskortti</h1>
    <p>Tulosten kirjaaminen ja laskenta suoraan selaimessa.</p>

    <p class="huomio huomio--varoitus tietosuoja">
      <strong>Tiedot tallentuvat vain tähän laitteeseen.</strong>
      Mitään ei lähetetä verkkoon. Vie tulokset tiedostoon säännöllisesti — selaimen
      tietojen tyhjentäminen poistaa kirjatut tulokset.
    </p>

    <nav class="osiot" aria-label="Sovelluksen osiot">
      <RouterLink v-for="osio in osiot" :key="osio.polku" :to="osio.polku" class="kortti osio">
        <span class="osio-merkki" aria-hidden="true">{{ osio.merkki }}</span>
        <span class="osio-teksti">
          <strong>{{ osio.otsikko }}</strong>
          <small>{{ osio.kuvaus }}</small>
        </span>
      </RouterLink>
    </nav>
  </section>
</template>

<style scoped>
.tietosuoja {
  margin: 1.25rem 0;
}

.osiot {
  display: grid;
  gap: 0.75rem;
}

.osio {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  color: var(--vari-teksti);
  text-decoration: none;
}
.osio:hover {
  border-color: var(--vari-korostus);
}

.osio-merkki {
  font-size: 1.5rem;
  line-height: 1.2;
}

.osio-teksti {
  display: flex;
  flex-direction: column;
}
.osio-teksti small {
  color: var(--vari-teksti-himmea);
}

@media (min-width: 640px) {
  .osiot {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }
}
</style>
