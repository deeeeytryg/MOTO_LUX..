<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Loader2, LogOut, Trash2 } from 'lucide-vue-next'
import {
  ApiError, createService, deleteAppointment, getAdminData, markMessageRead, updateAppointmentStatus, updateService,
} from '@/api'
import { cop } from '@/lib/format'
import type { AdminData, AppointmentStatus, NewService, Service } from '@/types'
import NewServiceForm from './NewServiceForm.vue'
import { inputClass } from './styles'

const emit = defineEmits<{ logout: [] }>()

const STATUS: AppointmentStatus[] = ['pendiente', 'confirmada', 'completada', 'cancelada']
const TABS = ['citas', 'clientes', 'servicios', 'mensajes'] as const
type Tab = (typeof TABS)[number]

const data = ref<AdminData | null>(null)
const tab = ref<Tab>('citas')
const error = ref('')

// Si la sesión expiró (401) se vuelve al login; cualquier otro error se muestra arriba.
function handle(e: unknown) {
  if (e instanceof ApiError && e.status === 401) emit('logout')
  else error.value = (e as Error).message
}
const load = () => getAdminData().then((d) => (data.value = d)).catch(handle)
/** Ejecuta una acción del panel y recarga los datos. */
const act = (action: Promise<unknown>) => action.then(load).catch(handle)
onMounted(load)

const stats = computed(() => {
  const a = data.value?.appointments ?? []
  return [
    ['Citas', a.length],
    ['Pendientes', a.filter((x) => x.status === 'pendiente').length],
    ['Agendadas por IA', a.filter((x) => x.source === 'chatbot').length],
    ['Clientes', data.value?.clients.length ?? 0],
  ] as const
})
const unread = computed(() => data.value?.messages.filter((m) => !m.read).length ?? 0)
const serviceName = (id: string) => data.value?.services.find((s) => s.id === id)?.name ?? id

function onStatus(id: string, e: Event) {
  act(updateAppointmentStatus(id, (e.target as HTMLSelectElement).value as AppointmentStatus))
}
function onDelete(id: string) {
  if (confirm('¿Eliminar esta cita?')) act(deleteAppointment(id))
}
function onPrice(s: Service, e: Event) {
  const price = Number((e.target as HTMLInputElement).value)
  if (price !== s.priceFrom) act(updateService(s.id, { priceFrom: price }))
}
const onCreate = (s: NewService) => act(createService(s))
</script>

<template>
  <p v-if="!data" class="grid min-h-svh place-items-center">
    <span v-if="error">{{ error }}</span>
    <Loader2 v-else class="animate-spin" />
  </p>

  <div v-else class="min-h-svh bg-background">
    <header class="flex items-center justify-between bg-ink px-4 py-4 text-ink-foreground md:px-8">
      <p class="font-display text-xl font-semibold">MOTO<span class="text-gold">LUX</span> Admin</p>
      <div class="flex gap-3 text-sm">
        <RouterLink to="/" class="hover:text-gold">Ver sitio</RouterLink>
        <button class="flex items-center gap-1 hover:text-gold" @click="emit('logout')"><LogOut class="size-4" /> Salir</button>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-8">
      <dl class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div v-for="[label, value] in stats" :key="label" class="rounded-2xl border border-border bg-card p-5">
          <dt class="text-sm text-muted-foreground">{{ label }}</dt>
          <dd class="font-display text-4xl font-semibold text-primary">{{ value }}</dd>
        </div>
      </dl>
      <p v-if="error" role="alert" class="mt-4 text-destructive">{{ error }}</p>

      <div role="tablist" class="mt-8 flex gap-1 overflow-x-auto rounded-full bg-secondary p-1">
        <button
          v-for="t in TABS"
          :key="t"
          role="tab"
          :aria-selected="tab === t"
          class="flex-1 rounded-full px-4 py-2.5 text-sm font-medium capitalize"
          :class="tab === t ? 'bg-primary text-primary-foreground' : 'text-foreground/70'"
          @click="tab = t"
        >
          {{ t }}{{ t === 'mensajes' && unread ? ` (${unread})` : '' }}
        </button>
      </div>

      <div class="mt-6">
        <!-- Citas -->
        <div v-if="tab === 'citas'" class="overflow-x-auto rounded-2xl border border-border bg-card">
          <table class="w-full min-w-[720px] text-left text-sm">
            <thead class="bg-secondary/70 text-xs text-muted-foreground uppercase">
              <tr><th v-for="h in ['Fecha', 'Cliente', 'Servicio', 'Origen', 'Estado', '']" :key="h" class="px-4 py-3">{{ h }}</th></tr>
            </thead>
            <tbody>
              <tr v-for="a in data.appointments" :key="a.id" class="border-t border-border align-top">
                <td class="px-4 py-3">{{ a.date }}<br />{{ a.time }}</td>
                <td class="px-4 py-3 font-medium">
                  {{ a.clientName }}<br />
                  <span class="font-normal text-muted-foreground">{{ a.phone }} · {{ a.motorcycle }}</span>
                </td>
                <td class="px-4 py-3">{{ serviceName(a.serviceId) }}</td>
                <td class="px-4 py-3">{{ a.source }}</td>
                <td class="px-4 py-3">
                  <select
                    aria-label="Estado"
                    :value="a.status"
                    class="rounded-full bg-secondary px-3 py-1 text-xs font-semibold"
                    @change="onStatus(a.id, $event)"
                  >
                    <option v-for="s in STATUS" :key="s">{{ s }}</option>
                  </select>
                </td>
                <td class="px-4 py-3">
                  <button aria-label="Eliminar cita" @click="onDelete(a.id)"><Trash2 class="size-4 text-destructive" /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Clientes -->
        <ul v-else-if="tab === 'clientes'" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="c in data.clients" :key="c.phone" class="rounded-2xl border border-border bg-card p-5">
            <p class="font-semibold">{{ c.name }}</p>
            <p class="text-sm text-muted-foreground">{{ c.phone }}</p>
            <p class="mt-2 text-sm">{{ c.motorcycles.join(', ') }}</p>
            <p class="mt-1 text-xs">{{ c.appointments }} cita(s)</p>
          </li>
        </ul>

        <!-- Servicios -->
        <template v-else-if="tab === 'servicios'">
          <NewServiceForm @create="onCreate" />
          <ul class="grid gap-4 md:grid-cols-2">
            <li
              v-for="s in data.services"
              :key="s.id"
              class="rounded-2xl border border-border bg-card p-5"
              :class="{ 'opacity-60': !s.active }"
            >
              <p class="font-semibold uppercase">{{ s.name }}</p>
              <p class="text-sm text-muted-foreground">{{ cop(s.priceFrom) }}</p>
              <div class="mt-3 flex items-center gap-2">
                <input
                  type="number"
                  step="1000"
                  min="0"
                  :value="s.priceFrom"
                  aria-label="Precio"
                  :class="[inputClass, 'w-32']"
                  @blur="onPrice(s, $event)"
                />
                <button
                  class="rounded-lg border border-border px-3 py-2 text-xs"
                  @click="act(updateService(s.id, { active: !s.active }))"
                >
                  {{ s.active ? 'Ocultar' : 'Activar' }}
                </button>
              </div>
            </li>
          </ul>
        </template>

        <!-- Mensajes -->
        <ul v-else class="grid gap-3">
          <p v-if="data.messages.length === 0" class="text-muted-foreground">Aún no hay mensajes.</p>
          <li
            v-for="m in data.messages"
            :key="m.id"
            class="rounded-2xl border bg-card p-5"
            :class="m.read ? 'border-border' : 'border-l-4 border-gold'"
          >
            <p class="font-semibold">
              {{ m.name }} <span class="font-normal text-muted-foreground">· {{ m.email }} · {{ m.phone }}</span>
            </p>
            <p class="mt-2 text-sm">{{ m.message }}</p>
            <button
              v-if="!m.read"
              class="mt-3 rounded-lg border border-border px-3 py-1.5 text-xs"
              @click="act(markMessageRead(m.id))"
            >
              Marcar como leído
            </button>
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>
