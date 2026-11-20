import { Router } from 'express'
import { listServices } from '../models/services.js'
import { addMessage } from '../models/messages.js'
import { limiter } from '../rate-limit.js'
import { parseContact } from '../validators.js'

/** Rutas públicas (sin login): catálogo y formulario de contacto. */
export function publicRoutes() {
  const router = Router()

  router.get('/services', async (req, res) => {
    res.json({ services: await listServices({ activeOnly: true }) })
  })

  router.post('/contact', limiter(5, 10), async (req, res) => {
    await addMessage(parseContact(req.body))
    res.status(201).json({ message: '¡Mensaje recibido! Te responderemos en menos de 24 horas.' })
  })

  return router
}
