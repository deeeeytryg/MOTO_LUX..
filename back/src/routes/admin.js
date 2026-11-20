import { Router } from 'express'
import { createToken, requireAdmin, verifyCredentials } from '../auth.js'
import { config } from '../config.js'
import { HttpError } from '../errors.js'
import { limiter } from '../rate-limit.js'
import { str } from '../validators.js'

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

  return router
}
