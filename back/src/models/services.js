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

/** 'Cambio de Kit de Arrastre' → 'cambio-de-kit-de-arrastre' (si ya existe: '-2', '-3'…). */
async function uniqueSlug(name) {
  const base = name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'servicio'
  const { rows } = await query('SELECT id FROM services WHERE id = $1 OR id LIKE $2', [base, `${base}-%`])
  const taken = new Set(rows.map((r) => r.id))
  let slug = base
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`
  return slug
}

export async function createService(s) {
  const id = await uniqueSlug(s.name)
  const { rows } = await query(
    `INSERT INTO services (id, name, category, cilindraje, description, price_from, duration_min)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [id, s.name, s.category, s.cilindraje, s.description, s.priceFrom, s.durationMin],
  )
  return toService(rows[0])
}

/** Actualiza precio y/o visibilidad. Devuelve false si el servicio no existe. */
export async function updateService(id, { priceFrom, active }) {
  const { rowCount } = await query(
    `UPDATE services SET price_from = COALESCE($2, price_from), active = COALESCE($3, active) WHERE id = $1`,
    [id, priceFrom ?? null, active ?? null],
  )
  return rowCount > 0
}
