import { after, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { load } from './helpers.js'

// El login no toca la base de datos: estas pruebas corren siempre.
const { createApp, pool } = await load()
after(() => pool.end())

const login = (app, body) => request(app).post('/api/admin/login').send(body)

describe('Login del administrador', () => {
  const app = createApp()

  it('rechaza credenciales incorrectas con 401', async () => {
    const res = await login(app, { email: 'admin@test.co', password: 'mala' }).expect(401)
    assert.equal(res.body.error, 'Credenciales incorrectas.')
  })

  it('pide correo y contraseña', async () => {
    const res = await login(app, { email: 'admin@test.co' }).expect(400)
    assert.equal(res.body.error, 'Ingresa tu correo y contraseña.')
  })

  it('con credenciales correctas devuelve un token que abre las rutas de admin', async () => {
    const res = await login(createApp(), { email: '  ADMIN@test.co ', password: 'clave-de-prueba' }).expect(200)
    assert.equal(res.body.email, 'admin@test.co')
    const me = await request(app).get('/api/admin/me').set('Authorization', `Bearer ${res.body.token}`).expect(200)
    assert.deepEqual(me.body, { email: 'admin@test.co' })
  })

  it('sin token, con token falso o vencido responde 401', async () => {
    await request(app).get('/api/admin/me').expect(401)
    await request(app).get('/api/admin/me').set('Authorization', 'Bearer inventado').expect(401)
    const otro = jwt.sign({ sub: 'admin@test.co' }, 'otro-secreto')
    await request(app).get('/api/admin/me').set('Authorization', `Bearer ${otro}`).expect(401)
    const vencido = jwt.sign({ sub: 'admin@test.co', exp: Math.floor(Date.now() / 1000) - 60 }, 'secreto-de-prueba')
    const res = await request(app).get('/api/admin/me').set('Authorization', `Bearer ${vencido}`).expect(401)
    assert.equal(res.body.error, 'No autorizado')
  })

  it('bloquea después de 5 intentos por minuto', async () => {
    const fresh = createApp()
    for (let i = 0; i < 5; i++) await login(fresh, { email: 'x@x.co', password: 'x' })
    await login(fresh, { email: 'admin@test.co', password: 'clave-de-prueba' }).expect(429)
  })
})
