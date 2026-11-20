/**
 * Error con código HTTP. El manejador de errores lo convierte en
 * { error: string, fieldErrors?: Record<string, string> }, que es el formato que espera el front.
 */
export class HttpError extends Error {
  constructor(status, message, fieldErrors) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export function notFound(req, res) {
  res.status(404).json({ error: 'Ruta no encontrada' })
}

// Express 5 envía aquí también los errores de funciones async.
export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, ...(err.fieldErrors && { fieldErrors: err.fieldErrors }) })
  }
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' })
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'La solicitud es demasiado grande' })
  console.error(err)
  res.status(500).json({ error: 'Error interno del servidor' })
}
