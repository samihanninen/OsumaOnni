import { createRouter, createWebHashHistory } from 'vue-router'

/**
 * Hash history on purpose: GitHub Pages has no server-side rewrite, so a real
 * history router would 404 on deep links unless we ship a 404.html redirect
 * hack. Hash routing sidesteps that entirely and deep links still work.
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'etusivu',
      component: () => import('@/views/EtusivuView.vue'),
      meta: { otsikko: 'Etusivu' },
    },
    {
      path: '/kisatiedot',
      name: 'kisatiedot',
      component: () => import('@/views/KisatiedotView.vue'),
      meta: { otsikko: 'Kisatiedot' },
    },
    {
      path: '/kilpailijat',
      name: 'kilpailijat',
      component: () => import('@/views/KilpailijatView.vue'),
      meta: { otsikko: 'Kilpailijat' },
    },
    {
      path: '/syota/:laji',
      name: 'syotto',
      component: () => import('@/views/SyottoView.vue'),
      meta: { otsikko: 'Tulosten syöttö' },
    },
    {
      path: '/tulokset/:laji',
      name: 'sijoitukset',
      component: () => import('@/views/SijoituksetView.vue'),
      meta: { otsikko: 'Sijoitukset' },
    },
    {
      path: '/yhdistykset',
      name: 'yhdistykset',
      component: () => import('@/views/YhdistyksetView.vue'),
      meta: { otsikko: 'Yhdistyskilpailu' },
    },
    {
      path: '/yhdista',
      name: 'yhdista',
      component: () => import('@/views/YhdistaView.vue'),
      meta: { otsikko: 'Yhdistä tulokset' },
    },
    {
      path: '/vienti',
      name: 'vienti',
      component: () => import('@/views/VientiView.vue'),
      meta: { otsikko: 'Vienti ja tuonti' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'ei-loytynyt',
      component: () => import('@/views/EiLoytynytView.vue'),
      meta: { otsikko: 'Sivua ei löytynyt' },
    },
  ],
})

export default router
