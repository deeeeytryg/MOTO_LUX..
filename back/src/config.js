// Configuración leída de variables de entorno: único lugar donde se lee process.env.
import { randomBytes } from 'node:crypto'

const env = process.env
const isProduction = env.NODE_ENV === 'production'

// En desarrollo, si no defines ADMIN_PASSWORD se genera una al azar y se muestra en la consola.
// Nunca hay una contraseña escrita en el código (el repositorio es público).
const devPassword = randomBytes(9).toString('base64url')

const list = (value) => (value ?? '').split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean)

export const config = {
  isProduction,
  port: Number(env.PORT || 3001),
  allowedOrigins: list(env.ALLOWED_ORIGINS || 'http://localhost:5173'),
  databaseUrl: env.DATABASE_URL,
  // Esquema de Postgres donde viven las tablas. Las pruebas usan uno aparte para no tocar los datos reales.
  dbSchema: env.DB_SCHEMA || 'public',

  // Administrador: un solo usuario, definido por variables de entorno.
  adminEmail: (env.ADMIN_EMAIL || 'admin@motolux.co').trim().toLowerCase(),
  adminPassword: env.ADMIN_PASSWORD || (isProduction ? '' : devPassword),
  generatedAdminPassword: env.ADMIN_PASSWORD ? null : devPassword,
  // Secreto para firmar los tokens (JWT). Si cambia, todas las sesiones se cierran.
  jwtSecret: env.JWT_SECRET || randomBytes(32).toString('hex'),
  sessionHours: 8,

  // Asistente de IA (Anthropic). Sin API key el chat responde 503 y el resto de la API funciona igual.
  anthropicKey: env.ANTHROPIC_API_KEY || '',
  anthropicUrl: (env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/$/, ''),
  aiModel: env.AI_MODEL || 'claude-haiku-5-5',
}

/** Variables sin las que el servidor no debe arrancar (en producción no hay valores por defecto). */
export function missingConfig() {
  const required = ['DATABASE_URL']
  if (isProduction) required.push('ALLOWED_ORIGINS', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'JWT_SECRET')
  return required.filter((key) => !env[key])
}
