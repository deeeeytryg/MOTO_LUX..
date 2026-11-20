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
