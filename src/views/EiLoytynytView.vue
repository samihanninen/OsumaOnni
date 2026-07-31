<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="sivu">
    <h1>Sivua ei löytynyt</h1>
    <p>Etsimääsi sivua ei ole. Kirjatut tulokset ovat tallessa.</p>
    <p class="paluu">
      <RouterLink to="/" class="nappi nappi--ensisijainen">Takaisin etusivulle</RouterLink>
    </p>
  </section>
</template>

<style scoped>
.paluu {
  margin-top: 1rem;
}
</style>
