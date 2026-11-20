import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { errorHandler, notFound } from './errors.js'
import { query } from './db/pool.js'
import { publicRoutes } from './routes/public.js'
import { adminRoutes } from './routes/admin.js'

/** Crea la app de Express (sin escuchar puerto, así las pruebas la usan directamente). */
export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', 1) // Render pone un proxy delante: así req.ip es la IP real del cliente.

  // Solo el front autorizado puede llamar a la API desde el navegador.
  app.use(cors({ origin: config.allowedOrigins }))
  app.use(express.json({ limit: '100kb' }))

  // ok: la API responde · db: la base de datos responde
  app.get('/api/health', async (req, res) => {
    const db = await query('SELECT 1').then(() => true, () => false)
    res.json({ ok: true, db })
  })

  app.use('/api', publicRoutes())
  app.use('/api/admin', adminRoutes())

  app.use(notFound)
  app.use(errorHandler)
  return app
}
