// Las pruebas usan el esquema "motolux_test": se crea limpio al empezar y se borra al terminar,
// así se pueden correr contra la misma base de Supabase sin tocar los datos reales.
process.env.DB_SCHEMA = 'motolux_test'
// Credenciales fijas solo para las pruebas.
process.env.ADMIN_EMAIL = 'admin@test.co'
process.env.ADMIN_PASSWORD = 'clave-de-prueba'
process.env.JWT_SECRET = 'secreto-de-prueba'
// La IA se simula en las pruebas: nunca se llama a la API real.
process.env.ANTHROPIC_API_KEY = 'clave-falsa'

export const hasDb = Boolean(process.env.DATABASE_URL)
export const skipWithoutDb = hasDb ? false : 'sin DATABASE_URL (configúrala en .env para probar la base de datos)'

/** Carga los módulos después de fijar DB_SCHEMA (los import estáticos se evaluarían antes). */
export async function load() {
  const [{ createApp }, db, { migrate }, { seedDemo }] = await Promise.all([
    import('../src/app.js'),
    import('../src/db/pool.js'),
    import('../src/db/migrate.js'),
    import('../src/db/seed-demo.js'),
  ])
  return { createApp, ...db, migrate, seedDemo }
}

/** Esquema de pruebas limpio, con las tablas y los servicios iniciales. */
export async function resetDb({ pool, migrate }) {
  await pool.query('DROP SCHEMA IF EXISTS motolux_test CASCADE')
  await migrate()
}

export async function dropDb({ pool }) {
  await pool.query('DROP SCHEMA IF EXISTS motolux_test CASCADE')
  await pool.end()
}

/** Token de admin válido para las pruebas. */
export async function adminToken(app) {
  const { default: request } = await import('supertest')
  const res = await request(app).post('/api/admin/login').send({ email: 'admin@test.co', password: 'clave-de-prueba' })
  return `Bearer ${res.body.token}`
}
