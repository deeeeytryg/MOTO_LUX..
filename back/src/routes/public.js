import { Router } from 'express'
import { listServices } from '../models/services.js'
import { addMessage } from '../models/messages.js'
import { limiter } from '../rate-limit.js'
import { parseContact } from '../validators.js'
import { getAvailableSlots } from '../models/appointments.js'
import { chat } from '../ai/lux.js'

/** Rutas públicas (sin login): catálogo, contacto, disponibilidad y chat con Lux. */
export function publicRoutes() {
  const router = Router()

  router.get('/services', async (req, res) => {
    res.json({ services: await listServices({ activeOnly: true }) })
  })

  router.post('/contact', limiter(5, 10), async (req, res) => {
    await addMessage(parseContact(req.body))
    res.status(201).json({ message: '¡Mensaje recibido! Te responderemos en menos de 24 horas.' })
  })

  // Horarios libres de un día: /api/availability?date=2026-11-21
  router.get('/availability', async (req, res) => {
    res.json(await getAvailableSlots(String(req.query.date ?? '')))
  })

  // 20 mensajes por minuto por IP: cada mensaje cuesta una llamada a la IA.
  router.post('/chat', limiter(20, 1), async (req, res) => {
    res.json(await chat(req.body?.messages))
  })

  return router
}
