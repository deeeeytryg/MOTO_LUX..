import { HttpError } from './errors.js'

/* Validaciones de entrada: el servidor nunca confía en lo que envía el navegador. */

export const str = (v) => (typeof v === 'string' ? v.trim() : '')

/** Lanza 400 con errores por campo si hay alguno: { error, fieldErrors: { campo: mensaje } }. */
function check(fieldErrors) {
  if (Object.keys(fieldErrors).length) throw new HttpError(400, 'Revisa los campos marcados.', fieldErrors)
}

export function parseContact(body = {}) {
  const name = str(body.name)
  const email = str(body.email)
  const phone = str(body.phone)
  const message = str(body.message)
  const errors = {}
  if (name.length < 2 || name.length > 80) errors.name = 'Escribe tu nombre'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) errors.email = 'Correo inválido'
  if (!/^[\d\s+()-]{7,20}$/.test(phone)) errors.phone = 'Teléfono inválido'
  if (message.length < 10 || message.length > 1000) errors.message = 'Cuéntanos un poco más (mínimo 10 caracteres)'
  check(errors)
  return { name, email, phone, message }
}

const CATEGORIES = ['detailing', 'mecanica']
const CILINDRAJES = ['todas', 'bajo', 'alto']
const MAX_PRICE = 50_000_000
const isPrice = (n) => Number.isInteger(n) && n >= 0 && n <= MAX_PRICE

export function parseService(body = {}) {
  const name = str(body.name)
  const description = str(body.description)
  const priceFrom = Number(body.priceFrom)
  const durationMin = Number(body.durationMin)
  const errors = {}
  if (name.length < 3 || name.length > 80) errors.name = 'El nombre debe tener entre 3 y 80 caracteres'
  if (!CATEGORIES.includes(body.category)) errors.category = 'Categoría inválida'
  if (!CILINDRAJES.includes(body.cilindraje)) errors.cilindraje = 'Cilindraje inválido'
  if (description.length < 10 || description.length > 400) errors.description = 'Describe el servicio (10 a 400 caracteres)'
  if (!isPrice(priceFrom)) errors.priceFrom = 'Precio inválido'
  if (!Number.isInteger(durationMin) || durationMin < 15 || durationMin > 1440) errors.durationMin = 'Duración inválida (15 a 1440 min)'
  check(errors)
  return { name, category: body.category, cilindraje: body.cilindraje, description, priceFrom, durationMin }
}

/** Cambios permitidos a un servicio existente: precio y/o visibilidad. */
export function parseServicePatch(body = {}) {
  const patch = {}
  if (body.priceFrom !== undefined) {
    const price = Number(body.priceFrom)
    if (!isPrice(price)) throw new HttpError(400, 'Precio inválido')
    patch.priceFrom = price
  }
  if (body.active !== undefined) {
    if (typeof body.active !== 'boolean') throw new HttpError(400, 'Valor inválido para "active"')
    patch.active = body.active
  }
  if (!Object.keys(patch).length) throw new HttpError(400, 'No hay cambios para guardar')
  return patch
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isUuid = (v) => UUID.test(v)
