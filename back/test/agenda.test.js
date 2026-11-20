import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { dropDb, load, resetDb, skipWithoutDb } from './helpers.js'

const ctx = await load()
const { getAvailableSlots, createAppointment } = await import('../src/models/appointments.js')

// Fechas fijas: "ahora" es el viernes 20 de noviembre de 2026 a las 10:30 en Colombia.
const NOW = new Date('2026-11-20T15:30:00Z')
const cita = (over = {}) => ({
  clientName: 'Ana Pérez', phone: '3001234567', motorcycle: 'Pulsar NS200', serviceId: 'frenos',
  date: '2099-01-02', time: '09:00', notes: '', source: 'chatbot', ...over,
})

describe('Agenda', { skip: skipWithoutDb }, () => {
  before(() => resetDb(ctx))
  after(() => dropDb(ctx))

  it('domingo cerrado, fecha pasada y fecha inválida', async () => {
    assert.equal((await getAvailableSlots('2026-11-22', NOW)).reason, 'Los domingos el taller está cerrado')
    assert.equal((await getAvailableSlots('2026-11-19', NOW)).reason, 'La fecha ya pasó')
    assert.equal((await getAvailableSlots('mañana', NOW)).reason, 'Fecha inválida')
  })

  it('hoy solo ofrece las horas que no han pasado; otro día, de 8 a 16', async () => {
    assert.deepEqual((await getAvailableSlots('2026-11-20', NOW)).slots, ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00'])
    assert.equal((await getAvailableSlots('2026-11-21', NOW)).slots.length, 9)
  })

  it('agendar ocupa el turno y registra al cliente', async () => {
    const a = await createAppointment(cita())
    assert.equal(a.serviceName, 'Servicio de Frenos')
    assert.ok(!(await getAvailableSlots('2099-01-02')).slots.includes('09:00'))
    await assert.rejects(createAppointment(cita({ phone: '3110000000' })), { status: 409, message: 'Ese horario ya no está disponible' })
    const { rows } = await ctx.query('SELECT name, motorcycles FROM clients')
    assert.deepEqual(rows, [{ name: 'Ana Pérez', motorcycles: ['Pulsar NS200'] }])
  })

  it('el mismo cliente con otra moto se agrega a su ficha', async () => {
    await createAppointment(cita({ time: '10:00', motorcycle: 'MT-03' }))
    await createAppointment(cita({ time: '11:00', motorcycle: 'MT-03' }))
    const { rows } = await ctx.query('SELECT motorcycles FROM clients WHERE phone = $1', ['3001234567'])
    assert.deepEqual(rows[0].motorcycles, ['Pulsar NS200', 'MT-03'])
  })

  it('una cita cancelada libera el turno', async () => {
    await ctx.query("UPDATE appointments SET status = 'cancelada' WHERE time = '09:00'")
    assert.ok((await getAvailableSlots('2099-01-02')).slots.includes('09:00'))
  })

  it('no agenda servicios ocultos', async () => {
    await ctx.query("UPDATE services SET active = false WHERE id = 'diagnostico'")
    await assert.rejects(createAppointment(cita({ serviceId: 'diagnostico', time: '15:00' })), { status: 409 })
  })

  it('GET /api/availability responde los horarios', async () => {
    const res = await request(ctx.createApp()).get('/api/availability?date=2099-01-03').expect(200)
    assert.equal(res.body.open, true)
    assert.equal(res.body.slots[0], '08:00')
  })
})
