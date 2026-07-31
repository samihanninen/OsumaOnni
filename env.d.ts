/// <reference types="vite/client" />

/*
 * Lataa pinia-plugin-persistedstate:n tyyppilaajennus, joka lisää `persist`-asetuksen
 * Pinian storeihin. Sovelluskoodissa laajennus tulisi main.ts:n importin kautta, mutta
 * testiprojekti (tsconfig.vitest.json) sisältää vain testitiedostot ja ylikirjoittaa
 * `types`-asetuksen, joten laajennus on viitattava tässä. env.d.ts kuuluu molempiin
 * projekteihin.
 */
/// <reference types="pinia-plugin-persistedstate" />
