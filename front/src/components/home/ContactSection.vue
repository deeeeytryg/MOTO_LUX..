<script setup lang="ts">
import { reactive } from 'vue'
import { ApiError, sendContact } from '@/api'
import type { ContactForm } from '@/types'

const FIELDS: { key: keyof ContactForm; label: string; type: string }[] = [
  { key: 'name', label: 'Nombre', type: 'text' },
  { key: 'email', label: 'Correo', type: 'email' },
  { key: 'phone', label: 'Teléfono', type: 'tel' },
  { key: 'message', label: 'Mensaje', type: 'textarea' },
]

const empty = (): ContactForm => ({ name: '', email: '', phone: '', message: '' })
const form = reactive(empty())
const state = reactive({ busy: false, ok: '', error: '', fields: {} as Record<string, string> })

async function submit() {
  Object.assign(state, { busy: true, ok: '', error: '', fields: {} })
  try {
    const d = await sendContact({ ...form })
    state.ok = d.message
    Object.assign(form, empty())
  } catch (e) {
    state.error = (e as Error).message
    state.fields = e instanceof ApiError ? e.fieldErrors : {}
  } finally {
    state.busy = false
  }
}
</script>

<template>
  <section id="contacto" class="scroll-mt-20 bg-secondary/50 py-20">
    <div class="mx-auto max-w-2xl px-4">
      <h2 v-reveal class="text-4xl font-bold uppercase">Contáctanos</h2>
      <form class="mt-8 grid gap-4 rounded-2xl border border-border bg-card p-6" @submit.prevent="submit">
        <div v-for="f in FIELDS" :key="f.key" class="flex flex-col gap-1.5">
          <label :for="f.key" class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{{ f.label }}</label>
          <textarea
            v-if="f.type === 'textarea'"
            :id="f.key"
            v-model="form[f.key]"
            rows="4"
            class="rounded-lg border border-input bg-background px-3 py-2"
          />
          <input v-else :id="f.key" v-model="form[f.key]" :type="f.type" class="h-11 rounded-lg border border-input bg-background px-3" />
          <p v-if="state.fields[f.key]" role="alert" class="text-sm text-destructive">{{ state.fields[f.key] }}</p>
        </div>
        <p v-if="state.error" role="alert" class="text-sm text-destructive">{{ state.error }}</p>
        <p v-if="state.ok" role="status" class="text-sm text-success">{{ state.ok }}</p>
        <button :disabled="state.busy" class="h-11 rounded-lg bg-gold font-semibold text-ink disabled:opacity-60">
          {{ state.busy ? 'Enviando…' : 'Enviar mensaje' }}
        </button>
      </form>
    </div>
  </section>
</template>
