// Datos del negocio que usa el back (el asistente de IA y la agenda).

export const BUSINESS = {
  name: 'MotoLux',
  phone: '+57 310 625 8657',
  hours: 'Lunes a sábado, 8:00 a.m. – 5:00 p.m.',
  timezone: 'America/Bogota',
}

// Turnos de una hora: la primera cita empieza a las 8:00 y la última a las 16:00. Domingo cerrado.
export const OPENING_HOUR = 8
export const CLOSING_HOUR = 17

export const CATEGORY_LABEL = { detailing: 'Detailing', mecanica: 'Mecánica' }
export const CILINDRAJE_LABEL = { todas: 'Todo cilindraje', bajo: 'Bajo cilindraje', alto: 'Alto cilindraje' }

export const formatCOP = (value) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

/**
 * Fecha y hora actuales en Colombia. El servidor en la nube corre en UTC, por eso se fija la zona.
 * Devuelve { date: '2026-11-21', hour: 14 }.
 */
export function nowInShop(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS.timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(now)
  const get = (type) => parts.find((p) => p.type === type)?.value ?? ''
  return { date: `${get('year')}-${get('month')}-${get('day')}`, hour: Number(get('hour')) }
}
