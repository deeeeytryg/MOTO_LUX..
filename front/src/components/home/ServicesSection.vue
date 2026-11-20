<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Clock, Loader2 } from 'lucide-vue-next'
import { getServices } from '@/api'
import { cop, dur, img } from '@/lib/format'
import { openChat } from '@/lib/chat'
import type { Category, Cilindraje, Service } from '@/types'

type Filter = 'todos' | Category

const CAT: Record<Category, string> = { detailing: 'Detailing', mecanica: 'Mecánica' }
const CC: Record<Cilindraje, string> = { todas: 'Todo cilindraje', bajo: 'Bajo cilindraje', alto: 'Alto cilindraje' }
const FILTERS: [Filter, string][] = [['todos', 'Todos'], ['detailing', 'Detailing'], ['mecanica', 'Mecánica']]
const BANNERS: { key: Category; file: string; title: string; text: string }[] = [
  { key: 'detailing', file: 'detailing.webp', title: 'Detailing premium', text: 'Productos profesionales y protección duradera para pintura, cromados y plásticos.' },
  { key: 'mecanica', file: 'mecanica.webp', title: 'Mecánica de precisión', text: 'Mantenimiento, frenos, transmisión y diagnóstico electrónico.' },
]

const services = ref<Service[] | null>(null)
const error = ref('')
const filter = ref<Filter>('todos')

onMounted(() => {
  getServices()
    .then((s) => (services.value = s))
    .catch((e: Error) => (error.value = e.message))
})

const visible = computed(() => (services.value ?? []).filter((s) => filter.value === 'todos' || s.category === filter.value))
const book = (s: Service) => openChat(`Quiero agendar el servicio "${s.name}"`)
const banners = computed(() => BANNERS.filter((b) => filter.value === 'todos' || filter.value === b.key))
</script>

<template>
  <section id="servicios" class="scroll-mt-20 py-20 md:py-28">
    <div class="mx-auto max-w-6xl px-4 md:px-6">
      <div v-reveal class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div class="max-w-xl">
          <p class="text-sm font-semibold tracking-[0.2em] text-accent uppercase">Catálogo</p>
          <h2 class="mt-2 text-4xl font-bold uppercase md:text-5xl">Servicios para tu nave</h2>
          <p class="mt-4 text-muted-foreground">
            Precios de referencia en pesos colombianos. El valor final depende del modelo y estado de la moto.
          </p>
        </div>
        <div role="tablist" class="flex gap-1 rounded-full bg-secondary p-1">
          <button
            v-for="[value, label] in FILTERS"
            :key="value"
            role="tab"
            :aria-selected="filter === value"
            class="rounded-full px-5 py-2 text-sm font-medium"
            :class="filter === value ? 'bg-primary text-primary-foreground' : 'text-foreground/70'"
            @click="filter = value"
          >
            {{ label }}
          </button>
        </div>
      </div>

      <div class="mt-12 grid gap-6 md:grid-cols-2">
        <article
          v-for="b in banners"
          :key="b.key"
          v-reveal
          class="relative isolate flex min-h-64 items-end overflow-hidden rounded-2xl p-6 text-ink-foreground"
          :class="{ 'md:col-span-2': filter !== 'todos' }"
        >
          <img :src="img(b.file)" :alt="b.title" loading="lazy" class="absolute inset-0 -z-20 size-full object-cover" />
          <div class="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
          <div>
            <h3 class="text-2xl font-semibold uppercase">{{ b.title }}</h3>
            <p class="mt-2 max-w-md text-sm">{{ b.text }}</p>
          </div>
        </article>
      </div>

      <p v-if="!services && !error" class="mt-10 flex items-center gap-2 text-muted-foreground">
        <Loader2 class="size-4 animate-spin" /> Cargando servicios… (si el servidor estaba dormido puede tardar unos segundos)
      </p>
      <p v-if="error" role="alert" class="mt-10 text-destructive">{{ error }}</p>

      <ul class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="s in visible"
          :key="s.id"
          v-reveal
          class="flex flex-col rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-accent hover:shadow-xl"
        >
          <div class="flex items-center justify-between text-xs">
            <span class="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">{{ CAT[s.category] }}</span>
            <span class="text-muted-foreground">{{ CC[s.cilindraje] }}</span>
          </div>
          <h3 class="mt-4 text-xl leading-tight font-semibold uppercase">{{ s.name }}</h3>
          <p class="mt-2 flex-1 text-sm text-muted-foreground">{{ s.description }}</p>
          <div class="mt-6 flex items-end justify-between border-t border-border pt-4">
            <div>
              <p class="text-xs text-muted-foreground">Desde</p>
              <p class="font-display text-2xl font-semibold text-primary">{{ cop(s.priceFrom) }}</p>
              <p class="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock class="size-3.5" />{{ dur(s.durationMin) }}
              </p>
            </div>
            <button
              class="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-ink"
              @click="book(s)"
            >
              Agendar
            </button>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
