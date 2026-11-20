import { query } from '../db/pool.js'

export async function addMessage({ name, email, phone, message }) {
  await query('INSERT INTO messages (name, email, phone, message) VALUES ($1, $2, $3, $4)', [name, email, phone, message])
}

export async function listMessages() {
  const { rows } = await query('SELECT * FROM messages ORDER BY created_at DESC')
  return rows.map((m) => ({
    id: m.id, name: m.name, email: m.email, phone: m.phone, message: m.message, read: m.read, createdAt: m.created_at,
  }))
}

export async function markMessageRead(id) {
  const { rowCount } = await query('UPDATE messages SET read = TRUE WHERE id = $1', [id])
  return rowCount > 0
}
