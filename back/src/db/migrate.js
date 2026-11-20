// Crea las tablas (si no existen) y carga los servicios iniciales si el catálogo está vacío.
// Uso: npm run db:migrate
import { readFile } from 'node:fs/promises'
import { config } from '../config.js'
import { pool } from './pool.js'
import { SEED_SERVICES } from './seed-services.js'

export async function migrate() {
  const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8')
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${config.dbSchema}`)
  await pool.query(schema)

  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM services')
  if (rows[0].n === 0) {
    for (const s of SEED_SERVICES) {
      await pool.query(
        `INSERT INTO services (id, name, category, cilindraje, description, price_from, duration_min, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [s.id, s.name, s.category, s.cilindraje, s.description, s.priceFrom, s.durationMin, s.active],
      )
    }
    return SEED_SERVICES.length
  }
  return 0
}

// Si se ejecuta como script (no importado desde las pruebas).
if (process.argv[1]?.endsWith('migrate.js')) {
  try {
    const seeded = await migrate()
    console.log(`Esquema aplicado. Servicios iniciales insertados: ${seeded}`)
  } catch (err) {
    console.error('Error al migrar la base de datos:', err.message)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}
