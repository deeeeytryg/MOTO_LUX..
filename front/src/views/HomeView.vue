<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getHealth } from '@/api'

// Provisional: comprueba que el front alcanza al backend configurado en VITE_API_URL.
const api = ref<'revisando' | 'conectada' | 'sin conexión'>('revisando')
onMounted(() => {
  getHealth()
    .then(() => (api.value = 'conectada'))
    .catch(() => (api.value = 'sin conexión'))
})
</script>

<template>
  <main class="grid min-h-svh place-items-center bg-ink px-4 text-ink-foreground">
    <div class="text-center">
      <h1 class="text-5xl font-bold uppercase md:text-7xl">MOTO<span class="text-gold">LUX</span></h1>
      <p class="mt-4 text-ink-foreground/70">Home en construcción.</p>
      <p class="mt-2 text-sm">
        API: <span :class="api === 'conectada' ? 'text-success' : 'text-gold'">{{ api }}</span>
      </p>
    </div>
  </main>
</template>
