import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { adminToken, dropDb, load, resetDb, skipWithoutDb } from './helpers.js'

const ctx = await load()

describe('Rutas del panel administrativo', { skip: skipWithoutDb }, () => {
  let app, auth
  const get = (url) => request(app).get(url).set('Authorization', auth)
  const send = (method, url, body) => request(app)[method](url).set('Authorization', auth).send(body)

  before(async () => {
    await resetDb(ctx)
    assert.equal(await ctx.seedDemo(), 4)
    app = ctx.createApp()
    auth = await adminToken(app)
  })
  after(() => dropDb(ctx))

  it('todas las rutas exigen token', async () => {
    await request(app).get('/api/admin/data').expect(401)
    await request(app).patch('/api/admin/services/frenos').send({ active: false }).expect(401)
  })

  it('GET /data trae citas, clientes, servicios (también ocultos) y mensajes', async () => {
    await ctx.query("UPDATE services SET active = false WHERE id = 'frenos'")
    const { body } = await get('/api/admin/data').expect(200)
    assert.equal(body.appointments.length, 4)
    assert.equal(body.clients.length, 4)
    assert.equal(body.services.length, 9)
    assert.equal(body.messages.length, 1)
    assert.match(body.appointments[0].date, /^\d{4}-\d{2}-\d{2}$/)
    assert.equal(body.clients.find((c) => c.phone === '3104567890').appointments, 1)
    assert.deepEqual(body.clients.find((c) => c.phone === '3104567890').motorcycles, ['Yamaha MT-09 2023'])
  })

  it('cambia el estado de una cita y valida el estado', async () => {
    const { body } = await get('/api/admin/data')
    const id = body.appointments.find((a) => a.status === 'pendiente').id
    await send('patch', `/api/admin/appointments/${id}`, { status: 'confirmada' }).expect(204)
    await send('patch', `/api/admin/appointments/${id}`, { status: 'inventado' }).expect(400)
    await send('patch', '/api/admin/appointments/no-es-uuid', { status: 'confirmada' }).expect(404)
    const { rows } = await ctx.query('SELECT status FROM appointments WHERE id = $1', [id])
    assert.equal(rows[0].status, 'confirmada')
  })

  it('elimina una cita', async () => {
    const { body } = await get('/api/admin/data')
    const id = body.appointments[0].id
    await send('delete', `/api/admin/appointments/${id}`).expect(204)
    await send('delete', `/api/admin/appointments/${id}`).expect(404)
  })

  it('crea un servicio con id legible y valida los campos', async () => {
    const nuevo = { name: 'Lavado de Motor', category: 'detailing', cilindraje: 'todas', priceFrom: 50000, durationMin: 60, description: 'Desengrase completo del motor.' }
    const res = await send('post', '/api/admin/services', nuevo).expect(201)
    assert.equal(res.body.service.id, 'lavado-de-motor')
    const otro = await send('post', '/api/admin/services', nuevo).expect(201)
    assert.equal(otro.body.service.id, 'lavado-de-motor-2')
    const bad = await send('post', '/api/admin/services', { name: 'X', category: 'otra' }).expect(400)
    assert.ok(bad.body.fieldErrors.name && bad.body.fieldErrors.category)
  })

  it('edita precio y visibilidad de un servicio', async () => {
    await send('patch', '/api/admin/services/ceramico', { priceFrom: 400000 }).expect(204)
    await send('patch', '/api/admin/services/ceramico', { active: false }).expect(204)
    await send('patch', '/api/admin/services/ceramico', { priceFrom: -5 }).expect(400)
    await send('patch', '/api/admin/services/no-existe', { active: true }).expect(404)
    const { rows } = await ctx.query("SELECT price_from, active FROM services WHERE id = 'ceramico'")
    assert.deepEqual(rows[0], { price_from: 400000, active: false })
    const pub = await request(app).get('/api/services')
    assert.ok(!pub.body.services.some((s) => s.id === 'ceramico'), 'oculto no sale en el catálogo público')
  })

  it('marca un mensaje como leído', async () => {
    const { body } = await get('/api/admin/data')
    await send('patch', `/api/admin/messages/${body.messages[0].id}/read`).expect(204)
    const after = await get('/api/admin/data')
    assert.equal(after.body.messages[0].read, true)
  })
})
