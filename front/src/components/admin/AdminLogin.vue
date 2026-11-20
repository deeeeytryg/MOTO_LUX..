<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { adminLogin, setToken } from '@/api'
import { inputClass } from './styles'

const emit = defineEmits<{ done: [] }>()
const form = reactive({ email: '', password: '' })
const error = ref('')
const busy = ref(false)

async function submit() {
  busy.value = true
  error.value = ''
  try {
    const { token } = await adminLogin(form.email, form.password)
    setToken(token)
    emit('done')
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <main class="grid min-h-svh place-items-center bg-ink px-4">
    <form class="grid w-full max-w-sm gap-4 rounded-2xl bg-card p-8" @submit.prevent="submit">
      <h1 class="text-3xl font-bold uppercase">Admin MotoLux</h1>
      <label class="grid gap-1 text-sm">Correo<input v-model="form.email" type="email" required autocomplete="username" :class="inputClass" /></label>
      <label class="grid gap-1 text-sm">Contraseña<input v-model="form.password" type="password" required autocomplete="current-password" :class="inputClass" /></label>
      <p v-if="error" role="alert" class="text-sm text-destructive">{{ error }}</p>
      <button :disabled="busy" class="h-11 rounded-lg bg-gold font-semibold text-ink disabled:opacity-60">
        {{ busy ? 'Entrando…' : 'Entrar' }}
      </button>
      <RouterLink to="/" class="text-center text-sm text-muted-foreground hover:underline">← Volver al sitio</RouterLink>
    </form>
  </main>
</template>
