<script setup lang="ts">
import { reactive } from 'vue'
import type { NewService } from '@/types'
import { inputClass } from './styles'

const emit = defineEmits<{ create: [service: NewService] }>()

const empty = (): NewService => ({
  name: '', category: 'detailing', cilindraje: 'todas', priceFrom: 50000, durationMin: 60, description: '',
})
const form = reactive(empty())

function submit() {
  emit('create', { ...form })
  Object.assign(form, empty())
}
</script>

<template>
  <form class="mb-4 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-3" @submit.prevent="submit">
    <input v-model="form.name" required placeholder="Nombre" aria-label="Nombre" :class="inputClass" />
    <select v-model="form.category" aria-label="Categoría" :class="inputClass">
      <option value="detailing">Detailing</option>
      <option value="mecanica">Mecánica</option>
    </select>
    <select v-model="form.cilindraje" aria-label="Cilindraje" :class="inputClass">
      <option value="todas">Todo cilindraje</option>
      <option value="bajo">Bajo</option>
      <option value="alto">Alto</option>
    </select>
    <input v-model.number="form.priceFrom" type="number" min="0" step="1000" aria-label="Precio desde" :class="inputClass" />
    <input v-model.number="form.durationMin" type="number" min="15" step="15" aria-label="Duración en minutos" :class="inputClass" />
    <input v-model="form.description" required placeholder="Descripción (mín. 10 caracteres)" aria-label="Descripción" :class="inputClass" />
    <button class="h-10 rounded-lg bg-gold font-semibold text-ink sm:col-span-3">Agregar servicio</button>
  </form>
</template>
