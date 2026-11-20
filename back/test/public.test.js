import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { dropDb, load, resetDb, skipWithoutDb } from './helpers.js'

const ctx = await load()

describe('Rutas públicas', { skip: skipWithoutDb }, () => {
  let app
  before(async () => {
    await resetDb(ctx)
    app = ctx.createApp()
  })
  after(() => dropDb(ctx))

  it('GET /api/services lista solo los activos, en camelCase', async () => {
    await ctx.query("UPDATE services SET active = false WHERE id = 'frenos'")
    const res = await request(app).get('/api/services').expect(200)
    assert.equal(res.body.services.length, 8)
    assert.ok(!res.body.services.some((s) => s.id === 'frenos'))
    const s = res.body.services.find((x) => x.id === 'lavado-premium')
    assert.deepEqual(Object.keys(s).sort(), ['active', 'category', 'cilindraje', 'description', 'durationMin', 'id', 'name', 'priceFrom'])
    assert.equal(s.priceFrom, 45000)
  })

  it('POST /api/contact valida y devuelve errores por campo', async () => {
    const res = await request(app).post('/api/contact').send({ name: 'A', email: 'no-es-correo', phone: '12', message: 'hola' }).expect(400)
    assert.equal(res.body.error, 'Revisa los campos marcados.')
    assert.deepEqual(Object.keys(res.body.fieldErrors).sort(), ['email', 'message', 'name', 'phone'])
  })

  it('POST /api/contact guarda el mensaje', async () => {
    const body = { name: 'Carlos', email: 'carlos@correo.co', phone: '310 625 8657', message: '¿Hacen recubrimiento cerámico a domicilio?' }
    const res = await request(app).post('/api/contact').send(body).expect(201)
    assert.match(res.body.message, /Mensaje recibido/)
    const { rows } = await ctx.query('SELECT name, email, read FROM messages')
    assert.deepEqual(rows, [{ name: 'Carlos', email: 'carlos@correo.co', read: false }])
  })

  it('POST /api/contact limita a 5 envíos cada 10 minutos por IP', async () => {
    const fresh = ctx.createApp()
    for (let i = 0; i < 5; i++) await request(fresh).post('/api/contact').send({})
    const res = await request(fresh).post('/api/contact').send({}).expect(429)
    assert.match(res.body.error, /Demasiadas solicitudes/)
  })
})
