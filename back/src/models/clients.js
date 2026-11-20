import { query } from '../db/pool.js'

/** Clientes con sus motos y cuántas citas han pedido. */
export async function listClients() {
  const { rows } = await query(`
    SELECT c.*, COUNT(a.id)::int AS appointments
    FROM clients c
    LEFT JOIN appointments a ON a.phone = c.phone
    GROUP BY c.phone
    ORDER BY c.created_at DESC`)
  return rows.map((c) => ({
    phone: c.phone,
    name: c.name,
    email: c.email,
    motorcycles: c.motorcycles,
    createdAt: c.created_at,
    appointments: c.appointments,
  }))
}
