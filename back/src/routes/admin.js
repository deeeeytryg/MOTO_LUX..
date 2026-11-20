import { Router } from 'express'
import { createToken, requireAdmin, verifyCredentials } from '../auth.js'
import { config } from '../config.js'
import { HttpError } from '../errors.js'
import { limiter } from '../rate-limit.js'
import { isUuid, parseService, parseServicePatch, str } from '../validators.js'
import * as appointments from '../models/appointments.js'
import * as services from '../models/services.js'
import { listClients } from '../models/clients.js'
import { listMessages, markMessageRead } from '../models/messages.js'

const notFound = (what) => new HttpError(404, `${what} no encontrado`)

/** Rutas del panel administrativo. Todas, menos el login, exigen token. */
export function adminRoutes() {
  const router = Router()

  // 5 intentos por minuto por IP: frena ataques de fuerza bruta a la contraseña.
  router.post('/login', limiter(5, 1), (req, res) => {
    const email = str(req.body?.email)
    const password = typeof req.body?.password === 'string' ? req.body.password : ''
    if (!email || !password) throw new HttpError(400, 'Ingresa tu correo y contraseña.')
    if (!verifyCredentials(email, password)) throw new HttpError(401, 'Credenciales incorrectas.')
    res.json({ token: createToken(), email: config.adminEmail })
  })

  router.use(requireAdmin)

  router.get('/me', (req, res) => res.json(req.admin))

  // Todo lo que muestra el panel en una sola petición.
  router.get('/data', async (req, res) => {
    const [a, c, s, m] = await Promise.all([
      appointments.listAppointments(),
      listClients(),
      services.listServices(),
      listMessages(),
    ])
    res.json({ appointments: a, clients: c, services: s, messages: m })
  })

  /* ---------- Citas ---------- */

  router.patch('/appointments/:id', async (req, res) => {
    const { status } = req.body ?? {}
    if (!appointments.APPOINTMENT_STATUSES.includes(status)) throw new HttpError(400, 'Estado inválido')
    if (!isUuid(req.params.id) || !(await appointments.updateAppointmentStatus(req.params.id, status))) {
      throw new HttpError(404, 'Cita no encontrada')
    }
    res.status(204).end()
  })

  router.delete('/appointments/:id', async (req, res) => {
    if (!isUuid(req.params.id) || !(await appointments.deleteAppointment(req.params.id))) {
      throw new HttpError(404, 'Cita no encontrada')
    }
    res.status(204).end()
  })

  /* ---------- Servicios ---------- */

  router.post('/services', async (req, res) => {
    const service = await services.createService(parseService(req.body))
    res.status(201).json({ message: 'Servicio agregado al catálogo.', service })
  })

  router.patch('/services/:id', async (req, res) => {
    if (!(await services.updateService(req.params.id, parseServicePatch(req.body)))) throw notFound('Servicio')
    res.status(204).end()
  })

  /* ---------- Mensajes ---------- */

  router.patch('/messages/:id/read', async (req, res) => {
    if (!isUuid(req.params.id) || !(await markMessageRead(req.params.id))) throw notFound('Mensaje')
    res.status(204).end()
  })

  return router
}
