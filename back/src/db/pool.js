import pg from 'pg'
import { config } from '../config.js'

// Fechas y horas como texto, igual que las espera el front: DATE → '2026-11-21', TIME → '09:00'.
pg.types.setTypeParser(1082, (v) => v)
pg.types.setTypeParser(1083, (v) => v.slice(0, 5))

const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(config.databaseUrl ?? '')

/** Pool de conexiones a Postgres (Supabase usa SSL; una base local no). */
export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 5,
})

if (!/^[a-z_][a-z0-9_]*$/.test(config.dbSchema)) throw new Error(`DB_SCHEMA inválido: ${config.dbSchema}`)
pool.on('connect', (client) => client.query(`SET search_path TO ${config.dbSchema}`))

export const query = (text, params) => pool.query(text, params)

/** Ejecuta fn(client) dentro de una transacción. */
export async function transaction(fn) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
