import type { Directive } from 'vue'

// v-reveal: el elemento aparece subiendo y desvaneciéndose cuando entra en pantalla (una sola vez).
// Equivale al `whileInView` de Framer Motion del sitio original, sin dependencias.
//   v-reveal            → al hacer scroll, 0.6 s
//   v-reveal="0.16"     → con retraso en segundos (para escalonar listas)
//   v-reveal.load       → al cargar la página, sin esperar el scroll (hero)
//   v-reveal.load="0.1" → al cargar, con retraso
type RevealEl = HTMLElement & { _reveal?: IntersectionObserver }

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function show(el: HTMLElement) {
  el.style.opacity = '1'
  el.style.transform = 'none'
}

export const vReveal: Directive<RevealEl, number | undefined> = {
  mounted(el, { value = 0, modifiers }) {
    if (reduced()) return
    const distance = modifiers.load ? 20 : 24
    el.style.opacity = '0'
    el.style.transform = `translateY(${distance}px)`
    el.style.transition = `opacity 0.6s ease-out ${value}s, transform 0.6s ease-out ${value}s`
    if (modifiers.load) {
      requestAnimationFrame(() => requestAnimationFrame(() => show(el)))
      return
    }
    el._reveal = new IntersectionObserver((entries, obs) => {
      if (entries.some((e) => e.isIntersecting)) {
        show(el)
        obs.disconnect()
      }
    })
    el._reveal.observe(el)
  },
  unmounted(el) {
    el._reveal?.disconnect()
  },
}
