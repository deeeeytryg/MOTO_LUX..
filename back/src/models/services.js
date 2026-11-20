import { query } from '../db/pool.js'

// Fila de la base (snake_case) → objeto del contrato con el front (camelCase).
export const toService = (r) => ({
  id: r.id,
  name: r.name,
  category: r.category,
  cilindraje: r.cilindraje,
  description: r.description,
  priceFrom: r.price_from,
  durationMin: r.duration_min,
  active: r.active,
})

export async function listServices({ activeOnly = false } = {}) {
  const { rows } = await query(
    `SELECT * FROM services ${activeOnly ? 'WHERE active' : ''} ORDER BY category, price_from, created_at`,
  )
  return rows.map(toService)
}
