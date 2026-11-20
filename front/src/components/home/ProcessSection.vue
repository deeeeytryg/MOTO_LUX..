<script setup lang="ts">
import { Bot, CalendarCheck, KeyRound, Sparkles } from 'lucide-vue-next'
import { openChat } from '@/lib/chat'

const STEPS = [
  [Bot, 'Habla con Lux', 'Cuéntale qué moto tienes y qué necesita. Te recomienda el servicio ideal.'],
  [CalendarCheck, 'Elige día y hora', 'Lux consulta la agenda del taller en tiempo real y reserva tu cupo.'],
  [KeyRound, 'Entrega tu moto', 'Te recibimos con inspección visual y registro fotográfico del estado.'],
  [Sparkles, 'Recógela impecable', 'Entregamos tu moto lista para rodar, con recomendaciones de cuidado.'],
] as const
const SUGGESTIONS = [
  '¿Qué servicio me recomiendas para una Pulsar NS200?',
  '¿Cuánto cuesta el recubrimiento cerámico?',
  'Quiero agendar un mantenimiento para mañana',
]
</script>

<!-- "Cómo funciona" + presentación del asistente de IA (con preguntas de ejemplo que abren el chat). -->
<template>
  <section id="proceso" class="scroll-mt-20 bg-secondary/60 py-20 md:py-28">
    <div class="mx-auto max-w-6xl px-4 md:px-6">
      <p class="text-sm font-semibold tracking-[0.2em] text-accent uppercase">Cómo funciona</p>
      <h2 class="mt-2 max-w-xl text-4xl font-bold uppercase md:text-5xl">De la cita a la entrega</h2>
      <ol class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="([Icon, title, text], i) in STEPS" :key="title" v-reveal="i * 0.08" class="rounded-2xl bg-card p-6">
          <span class="font-display text-5xl font-bold text-accent/30" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
          <component :is="Icon" class="mt-2 size-7 text-primary" aria-hidden="true" />
          <h3 class="mt-4 text-lg font-semibold uppercase">{{ title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ text }}</p>
        </li>
      </ol>
    </div>
  </section>

  <section id="asistente" class="scroll-mt-20 bg-primary py-20 text-primary-foreground md:py-24">
    <div class="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2 md:px-6">
      <div v-reveal>
        <p class="text-sm font-semibold tracking-[0.2em] text-gold uppercase">Asistente con IA</p>
        <h2 class="mt-2 text-4xl font-bold uppercase md:text-5xl">Conoce a Lux</h2>
        <p class="mt-4 max-w-lg leading-relaxed text-primary-foreground/80">
          Lux conoce todo nuestro catálogo, precios y horarios. Resuelve tus dudas al instante, te recomienda el servicio
          adecuado según tu moto y agenda tu cita directamente en la agenda del taller, las 24 horas.
        </p>
        <button class="mt-8 h-12 rounded-full bg-gold px-7 font-semibold text-ink hover:bg-gold/90" @click="openChat()">
          Iniciar conversación
        </button>
      </div>
      <div v-reveal class="rounded-2xl border border-white/10 bg-ink/40 p-6">
        <p class="text-sm font-medium text-primary-foreground/70">Prueba preguntando:</p>
        <ul class="mt-4 flex flex-col gap-3">
          <li v-for="s in SUGGESTIONS" :key="s">
            <button
              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm hover:bg-white/10"
              @click="openChat(s)"
            >
              {{ s }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
