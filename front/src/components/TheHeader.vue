<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Menu, X } from 'lucide-vue-next'
import { img } from '@/lib/format'
import { openChat } from '@/lib/chat'
import { scrollToSection } from '@/lib/scroll'

const NAV = [
  ['servicios', 'Servicios'],
  ['proceso', 'Proceso'],
  ['asistente', 'Asistente IA'],
  ['contacto', 'Contacto'],
] as const

// Barra fija: transparente sobre el hero y oscura al hacer scroll. En celular se abre como menú.
const open = ref(false)
const scrolled = ref(false)
const onScroll = () => (scrolled.value = window.scrollY > 24)
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

function go(id: string) {
  open.value = false
  scrollToSection(id)
}
function book() {
  open.value = false
  openChat()
}
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-40 transition-colors duration-300"
    :class="scrolled || open ? 'bg-ink/95 shadow-lg backdrop-blur' : 'bg-transparent'"
  >
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:h-20 md:px-6">
      <a href="#top" class="flex items-center gap-3" aria-label="MotoLux, ir al inicio" @click.prevent="go('top')">
        <img :src="img('logo-full.webp')" alt="" class="size-10 rounded-full object-cover ring-2 ring-gold/60 md:size-12" />
        <span class="font-display text-xl font-semibold tracking-wide text-ink-foreground md:text-2xl">
          MOTO<span class="text-gold">LUX</span>
        </span>
      </a>
      <nav aria-label="Principal" class="hidden items-center gap-8 md:flex">
        <a
          v-for="[id, label] in NAV"
          :key="id"
          :href="`#${id}`"
          class="text-sm font-medium text-ink-foreground/80 transition-colors hover:text-gold"
          @click.prevent="go(id)"
        >{{ label }}</a>
        <button
          class="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
          @click="book"
        >
          Agendar cita
        </button>
      </nav>
      <button
        class="rounded-md p-2 text-ink-foreground md:hidden"
        :aria-expanded="open"
        aria-controls="mobile-nav"
        :aria-label="open ? 'Cerrar menú' : 'Abrir menú'"
        @click="open = !open"
      >
        <X v-if="open" class="size-6" />
        <Menu v-else class="size-6" />
      </button>
    </div>
    <nav v-if="open" id="mobile-nav" aria-label="Móvil" class="border-t border-white/10 px-4 pb-6 md:hidden">
      <ul class="flex flex-col gap-1 pt-3">
        <li v-for="[id, label] in NAV" :key="id">
          <a
            :href="`#${id}`"
            class="block rounded-md px-3 py-3 text-base font-medium text-ink-foreground hover:bg-white/5"
            @click.prevent="go(id)"
          >{{ label }}</a>
        </li>
      </ul>
      <button class="mt-3 w-full rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink" @click="book">
        Agendar cita con IA
      </button>
    </nav>
  </header>
</template>
