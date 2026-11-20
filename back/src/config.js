// Configuración leída de variables de entorno: único lugar donde se lee process.env.
const env = process.env

const list = (value) => (value ?? '').split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean)

export const config = {
  isProduction: env.NODE_ENV === 'production',
  port: Number(env.PORT ?? 3001),
  allowedOrigins: list(env.ALLOWED_ORIGINS ?? 'http://localhost:5173'),
  databaseUrl: env.DATABASE_URL,
  // Esquema de Postgres donde viven las tablas. Las pruebas usan uno aparte para no tocar los datos reales.
  dbSchema: env.DB_SCHEMA ?? 'public',
}
