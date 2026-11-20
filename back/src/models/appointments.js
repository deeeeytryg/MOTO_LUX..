import { query, transaction } from '../db/pool.js'
import { CLOSING_HOUR, OPENING_HOUR, nowInShop } from '../business.js'
import { HttpError } from '../errors.js'

export const APPOINTMENT_STATUSES = ['pendiente', 'confirmada', 'completada', 'cancelada']

const toAppointment = (r) => ({
  id: r.id,
  clientName: r.client_name,
  phone: r.phone,
  motorcycle: r.motorcycle,
  serviceId: r.service_id,
  date: r.date,
  time: r.time,
  notes: r.notes,
  status: r.status,
  source: r.source,
  createdAt: r.created_at,
})

export async function listAppointments() {
  const { rows } = await query('SELECT * FROM appointments ORDER BY date, time')
  return rows.map(toAppointment)
}

/** Devuelve false si la cita no existe. */
export async function updateAppointmentStatus(id, status) {
  const { rowCount } = await query('UPDATE appointments SET status = $1 WHERE id = $2', [status, id])
  return rowCount > 0
}

export async function deleteAppointment(id) {
  const { rowCount } = await query('DELETE FROM appointments WHERE id = $1', [id])
  return rowCount > 0
}

/* ---------- Agenda ---------- */

/** Horarios libres de un día: { open, slots: ['08:00', …], reason }. */
export async function getAvailableSlots(date, now = new Date()) {
  const day = new Date(`${date}T12:00:00Z`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(day.getTime())) {
    return { open: false, slots: [], reason: 'Fecha inválida' }
  }
  if (day.getUTCDay() === 0) return { open: false, slots: [], reason: 'Los domingos el taller está cerrado' }

  const today = nowInShop(now)
  if (date < today.date) return { open: false, slots: [], reason: 'La fecha ya pasó' }

  const { rows } = await query("SELECT time FROM appointments WHERE date = $1 AND status <> 'cancelada'", [date])
  const taken = new Set(rows.map((r) => r.time))
  const slots = []
  for (let h = OPENING_HOUR; h < CLOSING_HOUR; h++) {
    const time = `${String(h).padStart(2, '0')}:00`
    if (date === today.date && h <= today.hour) continue // horas que ya pasaron hoy
    if (!taken.has(time)) slots.push(time)
  }
  return { open: true, slots, reason: slots.length ? '' : 'No quedan horarios libres ese día' }
}

/**
 * Agenda una cita y registra (o actualiza) al cliente, todo en una transacción.
 * Lanza HttpError 409 con un mensaje claro si no se puede agendar.
 */
export async function createAppointment(input) {
  const { rows: found } = await query('SELECT id, name, active FROM services WHERE id = $1', [input.serviceId])
  const service = found[0]
  if (!service?.active) throw new HttpError(409, 'El servicio seleccionado no está disponible')

  const { slots, reason } = await getAvailableSlots(input.date)
  if (!slots.includes(input.time)) throw new HttpError(409, reason || 'Ese horario ya no está disponible')

  try {
    const row = await transaction(async (db) => {
      const { rows } = await db.query(
        `INSERT INTO appointments (client_name, phone, motorcycle, service_id, date, time, notes, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [input.clientName, input.phone, input.motorcycle, service.id, input.date, input.time, input.notes ?? '', input.source],
      )
      // Si el cliente ya existe (mismo teléfono) se actualiza su nombre y se agrega la moto si es nueva.
      await db.query(
        `INSERT INTO clients (phone, name, email, motorcycles) VALUES ($1, $2, $3, ARRAY[$4])
         ON CONFLICT (phone) DO UPDATE SET
           name = EXCLUDED.name,
           email = COALESCE(NULLIF(EXCLUDED.email, ''), clients.email),
           motorcycles = CASE WHEN $4 = ANY(clients.motorcycles) THEN clients.motorcycles
                              ELSE array_append(clients.motorcycles, $4) END`,
        [input.phone, input.clientName, input.email ?? '', input.motorcycle],
      )
      return rows[0]
    })
    return { ...toAppointment(row), serviceName: service.name }
  } catch (err) {
    // Dos personas reservando el mismo turno a la vez: el índice único rechaza la segunda.
    if (err.code === '23505') throw new HttpError(409, 'Ese horario ya no está disponible')
    throw err
  }
}
