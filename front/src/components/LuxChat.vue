<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { CheckCircle2, Loader2, MessageCircle, Send, X } from 'lucide-vue-next'
import { sendChat } from '@/api'
import { CHAT_EVENT } from '@/lib/chat'
import type { Booking, ChatMessage } from '@/types'

type Msg = ChatMessage & { booking?: Booking | null }

const HELLO =
  '¡Hola! Soy Lux, el asistente de MotoLux 🏍️ Te cuento de nuestros servicios o agendamos tu cita. ¿Qué necesita tu moto?'

const open = ref(false)
const msgs = ref<Msg[]>([{ role: 'assistant', content: HELLO }])
const text = ref('')
const busy = ref(false)
const error = ref('')
const end = ref<HTMLElement | null>(null)

async function send(content: string) {
  if (!content.trim() || busy.value) return
  const next: Msg[] = [...msgs.value, { role: 'user', content: content.trim() }]
  msgs.value = next
  text.value = ''
  busy.value = true
  error.value = ''
  try {
    // Al backend solo viaja el historial (rol + texto), sin las tarjetas de cita.
    const { reply, booking } = await sendChat(next.map(({ role, content }) => ({ role, content })))
    msgs.value = [...next, { role: 'assistant', content: reply, booking }]
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}

// Cualquier botón del sitio puede abrir el chat (y opcionalmente enviar un mensaje) con openChat().
function onOpen(e: Event) {
  open.value = true
  const message = (e as CustomEvent<string | undefined>).detail
  if (message) send(message)
}
onMounted(() => window.addEventListener(CHAT_EVENT, onOpen))
onBeforeUnmount(() => window.removeEventListener(CHAT_EVENT, onOpen))

watch([() => msgs.value.length, busy, open], async () => {
  await nextTick()
  end.value?.scrollIntoView({ behavior: 'smooth' })
})
</script>

<template>
  <button
    v-if="!open"
    aria-label="Abrir asistente"
    class="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full bg-gold px-5 py-3 font-semibold text-ink shadow-xl transition hover:scale-105"
    @click="open = true"
  >
    <MessageCircle class="size-5" /> Lux IA
  </button>

  <Transition
    enter-active-class="transition duration-300 ease-out"
    leave-active-class="transition duration-200 ease-in"
    enter-from-class="translate-y-8 opacity-0"
    leave-to-class="translate-y-8 opacity-0"
  >
    <section
      v-if="open"
      aria-label="Asistente Lux"
      class="fixed inset-x-2 bottom-2 z-50 flex h-[34rem] max-h-[85svh] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:right-4 sm:left-auto sm:w-96"
    >
      <header class="flex items-center justify-between bg-ink px-4 py-3 text-ink-foreground">
        <p class="font-display text-lg font-semibold">Lux · Asistente MotoLux</p>
        <button aria-label="Cerrar" class="rounded p-1 hover:bg-white/10" @click="open = false"><X class="size-5" /></button>
      </header>

      <div class="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        <div
          v-for="(m, i) in msgs"
          :key="i"
          :class="m.role === 'user' ? 'flex justify-end' : 'flex flex-col items-start gap-2'"
        >
          <p
            class="max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap"
            :class="m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'"
          >{{ m.content }}</p>
          <div v-if="m.booking?.ok" class="flex gap-2 rounded-xl border border-success/40 bg-success/10 p-3 text-sm">
            <CheckCircle2 class="size-5 text-success" />
            <div>
              <p class="font-semibold">Cita registrada #{{ m.booking.id }}</p>
              <p>{{ m.booking.servicio }} · {{ m.booking.fecha }} {{ m.booking.hora }}</p>
            </div>
          </div>
        </div>
        <p v-if="busy" class="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 class="size-4 animate-spin" /> Lux está escribiendo…
        </p>
        <p v-if="error" role="alert" class="text-sm text-destructive">{{ error }}</p>
        <div ref="end" />
      </div>

      <form class="flex gap-2 border-t border-border p-3" @submit.prevent="send(text)">
        <label for="chat-input" class="sr-only">Mensaje</label>
        <input
          id="chat-input"
          v-model="text"
          maxlength="500"
          placeholder="Escribe tu mensaje…"
          class="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
        />
        <button
          :disabled="busy || !text.trim()"
          aria-label="Enviar"
          class="grid size-10 place-items-center rounded-lg bg-gold text-ink disabled:opacity-50"
        >
          <Send class="size-4" />
        </button>
      </form>
    </section>
  </Transition>
</template>
