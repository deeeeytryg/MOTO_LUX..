import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { dropDb, load, resetDb, skipWithoutDb } from './helpers.js'

const ctx = await load()
const { pool, query } = ctx

describe('Base de datos', { skip: skipWithoutDb }, () => {
  before(() => resetDb(ctx))
  after(() => dropDb(ctx))

  it('health reporta la base conectada', async () => {
    const res = await request(ctx.createApp()).get('/api/health').expect(200)
    assert.deepEqual(res.body, { ok: true, db: true })
  })

  it('carga los 9 servicios iniciales una sola vez', async () => {
    const { rows } = await query('SELECT COUNT(*)::int AS n FROM services')
    assert.equal(rows[0].n, 9)
    assert.equal(await ctx.migrate(), 0) // volver a migrar no duplica
  })

  it('devuelve fecha y hora como texto', async () => {
    const { rows } = await query(
      `INSERT INTO appointments (client_name, phone, motorcycle, service_id, date, time, source)
       VALUES ('Ana', '3001234567', 'NS200', 'frenos', '2026-12-01', '09:00', 'web') RETURNING date, time`,
    )
    assert.deepEqual(rows[0], { date: '2026-12-01', time: '09:00' })
  })

  it('no permite dos citas activas en el mismo turno', async () => {
    const insert = () => pool.query(
      `INSERT INTO appointments (client_name, phone, motorcycle, service_id, date, time, source)
       VALUES ('Luis', '3009999999', 'MT-09', 'diagnostico', '2026-12-01', '09:00', 'web')`,
    )
    await assert.rejects(insert, { code: '23505' })
  })
})
