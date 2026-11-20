<script setup lang="ts">
import { ShieldCheck, Sparkles, Wrench } from 'lucide-vue-next'
import { img } from '@/lib/format'
import { openChat } from '@/lib/chat'
import { scrollToSection } from '@/lib/scroll'

const HIGHLIGHTS = [
  [Sparkles, 'Detailing premium'],
  [Wrench, 'Mecánica especializada'],
  [ShieldCheck, 'Garantía en cada servicio'],
] as const
</script>

<template>
  <section id="top" class="relative isolate overflow-hidden bg-ink text-ink-foreground">
    <img
      :src="img('hero-moto.webp')"
      alt="Moto deportiva con acabado de detailing premium"
      class="absolute inset-0 -z-20 size-full object-cover object-right opacity-70"
    />
    <div class="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/85 to-ink/20" />
    <div class="mx-auto flex min-h-[92svh] max-w-6xl flex-col justify-center px-4 py-24 md:px-6">
      <p
        v-reveal.load
        class="mb-5 w-fit rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-gold uppercase"
      >
        Bajo y alto cilindraje
      </p>
      <h1 v-reveal.load="0.1" class="max-w-2xl text-5xl leading-[1.02] font-bold uppercase md:text-7xl">
        Tu moto merece <span class="text-gold">brillar</span> y rodar perfecta
      </h1>
      <p class="mt-6 max-w-xl text-lg text-ink-foreground/80">
        Detailing premium y mecánica de precisión. Agenda en segundos con Lux, nuestro asistente con inteligencia artificial.
      </p>
      <div class="mt-9 flex flex-col gap-3 sm:flex-row">
        <button class="h-12 rounded-full bg-gold px-7 font-semibold text-ink hover:bg-gold/90" @click="openChat()">
          Agendar con el asistente IA
        </button>
        <a
          href="#servicios"
          class="inline-flex h-12 items-center justify-center rounded-full border border-ink-foreground/30 px-7 hover:border-gold hover:text-gold"
          @click.prevent="scrollToSection('servicios')"
        >Ver servicios</a>
      </div>
      <ul class="mt-14 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-foreground/80">
        <li v-for="[Icon, text] in HIGHLIGHTS" :key="text" class="flex items-center gap-2">
          <component :is="Icon" class="size-4 text-gold" />{{ text }}
        </li>
      </ul>
    </div>
  </section>
</template>
