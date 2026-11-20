import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { errorHandler, notFound } from './errors.js'

/** Crea la app de Express (sin escuchar puerto, así las pruebas la usan directamente). */
export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', 1) // Render pone un proxy delante: así req.ip es la IP real del cliente.

  // Solo el front autorizado puede llamar a la API desde el navegador.
  app.use(cors({ origin: config.allowedOrigins }))
  app.use(express.json({ limit: '100kb' }))

  app.get('/api/health', (req, res) => res.json({ ok: true }))

  app.use(notFound)
  app.use(errorHandler)
  return app
}
