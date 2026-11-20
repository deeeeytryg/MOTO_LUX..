import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { createApp } from '../src/app.js'

const app = createApp()

describe('API base', () => {
  it('GET /api/health responde ok', async () => {
    const res = await request(app).get('/api/health').expect(200)
    assert.deepEqual(res.body, { ok: true })
  })

  it('ruta inexistente responde 404 en formato { error }', async () => {
    const res = await request(app).get('/api/no-existe').expect(404)
    assert.equal(res.body.error, 'Ruta no encontrada')
  })

  it('JSON mal formado responde 400', async () => {
    const res = await request(app).post('/api/health').set('Content-Type', 'application/json').send('{mal').expect(400)
    assert.equal(res.body.error, 'JSON inválido')
  })

  it('CORS permite el front configurado y no otros orígenes', async () => {
    const ok = await request(app).get('/api/health').set('Origin', 'http://localhost:5173')
    assert.equal(ok.headers['access-control-allow-origin'], 'http://localhost:5173')
    const bad = await request(app).get('/api/health').set('Origin', 'https://otro-sitio.com')
    assert.equal(bad.headers['access-control-allow-origin'], undefined)
  })
})
