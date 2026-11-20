import router from '@/router'

// Con rutas hash (#/admin), un <a href="#servicios"> cambiaría la ruta en vez de bajar a la sección.
// Por eso los enlaces internos hacen scroll a mano; desde otra página primero vuelven al inicio.
export async function scrollToSection(id: string) {
  if (router.currentRoute.value.name !== 'home') await router.push({ name: 'home' })
  requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }))
}
