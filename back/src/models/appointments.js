import { query } from '../db/pool.js'

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
