<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue'
import TheFooter from '@/components/TheFooter.vue'

// Provisional: las secciones reales (hero, servicios, proceso, contacto) llegan en el paso 5.
const SECTIONS = [
  ['servicios', 'Servicios'],
  ['proceso', 'Proceso'],
  ['asistente', 'Asistente IA'],
  ['contacto', 'Contacto'],
] as const
</script>

<template>
  <TheHeader />
  <main>
    <section id="top" class="grid min-h-[92svh] place-items-center bg-ink text-ink-foreground">
      <h1 class="text-5xl font-bold uppercase md:text-7xl">MOTO<span class="text-gold">LUX</span></h1>
    </section>
    <section
      v-for="([id, title], i) in SECTIONS"
      :id="id"
      :key="id"
      class="grid min-h-[60svh] scroll-mt-20 place-items-center"
      :class="i % 2 ? 'bg-secondary/60' : ''"
    >
      <h2 class="text-4xl font-bold uppercase">{{ title }}</h2>
    </section>
  </main>
  <TheFooter />
</template>
