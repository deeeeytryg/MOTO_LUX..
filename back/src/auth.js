import { createHash, timingSafeEqual } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { config } from './config.js'
import { HttpError } from './errors.js'

/*
 * Sesión del administrador con JWT.
 * El front vive en otro dominio (GitHub Pages), así que el token viaja en el encabezado
 * Authorization: Bearer <token> y el servidor valida firma y expiración en cada petición.
 */

// Compara hashes de igual longitud para que el tiempo de respuesta no revele cuántos caracteres coinciden.
function safeEqual(a, b) {
  const ha = createHash('sha256').update(String(a)).digest()
  const hb = createHash('sha256').update(String(b)).digest()
  return timingSafeEqual(ha, hb)
}

export function verifyCredentials(email, password) {
  if (!config.adminPassword) return false
  const emailOk = safeEqual(String(email).trim().toLowerCase(), config.adminEmail)
  const passwordOk = safeEqual(password, config.adminPassword)
  return emailOk && passwordOk
}

export const createToken = () =>
  jwt.sign({ sub: config.adminEmail, role: 'admin' }, config.jwtSecret, { expiresIn: `${config.sessionHours}h` })

/** Middleware: deja pasar solo con un token válido; pone req.admin = { email }. Si no, 401. */
export function requireAdmin(req, res, next) {
  const header = req.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  try {
    const payload = jwt.verify(token, config.jwtSecret)
    req.admin = { email: payload.sub }
    next()
  } catch {
    next(new HttpError(401, 'No autorizado'))
  }
}
