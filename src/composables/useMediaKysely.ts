import { onScopeDispose, ref, type Ref } from 'vue'

/**
 * Seuraa CSS-mediakyselyä reaktiivisesti.
 *
 * Käytetään valitsemaan syöttötapa: puhelimessa kortti + näppäimistö, työpöydällä
 * taulukko. Vain toinen renderöidään — 50 kilpailijaa × 20 laukausta olisi turhaa
 * DOM-kuormaa kahtena kopiona, ja kaksi näkymää sotkisi kohdistuksen ja id-tunnukset.
 */
export function useMediaKysely(kysely: string): Ref<boolean> {
  const osuu = ref(false)

  // Palvelinrenderöinnissä tai testiympäristössä matchMedia voi puuttua.
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return osuu
  }

  const lista = window.matchMedia(kysely)
  osuu.value = lista.matches

  const kuuntelija = (e: MediaQueryListEvent) => {
    osuu.value = e.matches
  }
  lista.addEventListener('change', kuuntelija)
  onScopeDispose(() => lista.removeEventListener('change', kuuntelija))

  return osuu
}

/**
 * Milloin taulukkosyöttö on oletuksena käytössä.
 *
 * Pelkkä leveys ei riitä: tabletti on leveä mutta kosketuskäyttöinen, ja taulukon
 * tekstikentät avaisivat siinä laitteen oman näppäimistön. iOS:n numeronäppäimistössä
 * ei ole `*`- eikä `-`-näppäintä, joten napakymppiä ja ohilaukausta ei voisi syöttää
 * lainkaan. `pointer: fine` tarkoittaa hiirtä tai ohjauslevyä eli oikeaa näppäimistöä.
 */
export const TYOPOYTA_KYSELY = '(min-width: 768px) and (pointer: fine)'

export function useTyopoyta(): Ref<boolean> {
  return useMediaKysely(TYOPOYTA_KYSELY)
}
