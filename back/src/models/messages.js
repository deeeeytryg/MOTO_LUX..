import { query } from '../db/pool.js'

export async function addMessage({ name, email, phone, message }) {
  await query('INSERT INTO messages (name, email, phone, message) VALUES ($1, $2, $3, $4)', [name, email, phone, message])
}
