import { after, afterEach, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { dropDb, load, resetDb, skipWithoutDb } from './helpers.js'

const ctx = await load()
const { config } = await import('../src/config.js')

// Simula la API de Anthropic: cada llamada devuelve la siguiente respuesta de la lista.
const realFetch = globalThis.fetch
let calls = []
function fakeAnthropic(...responses) {
  calls = []
  globalThis.fetch = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) })
    const next = responses.shift()
    return new Response(JSON.stringify(next), { status: next.status ?? 200 })
  }
}
const text = (t) => ({ stop_reason: 'end_turn', content: [{ type: 'text', text: t }] })
const tool = (name, input) => ({ stop_reason: 'tool_use', content: [{ type: 'tool_use', id: `tu_${name}`, name, input }] })

const HELLO = { role: 'assistant', content: '¡Hola! Soy Lux.' }
const user = (content) => ({ role: 'user', content })

describe('Chat con Lux', { skip: skipWithoutDb }, () => {
  let app
  before(async () => {
    await resetDb(ctx)
    app = ctx.createApp()
  })
  afterEach(() => (globalThis.fetch = realFetch))
  after(() => dropDb(ctx))

  const chat = (messages) => request(app).post('/api/chat').send({ messages })

  it('responde texto y manda catálogo, herramientas y la conversación sin el saludo', async () => {
    fakeAnthropic(text('El cerámico cuesta desde $350.000.'))
    const res = await chat([HELLO, user('¿Cuánto cuesta el cerámico?')]).expect(200)
    assert.deepEqual(res.body, { reply: 'El cerámico cuesta desde $350.000.', booking: null })
    const sent = calls[0].body
    assert.match(calls[0].url, /\/v1\/messages$/)
    assert.match(sent.system, /\[ceramico\] Recubrimiento Cerámico/)
    assert.deepEqual(sent.tools.map((t) => t.name), ['consultarDisponibilidad', 'agendarCita'])
    assert.deepEqual(sent.messages, [user('¿Cuánto cuesta el cerámico?')])
  })

  it('consulta disponibilidad, agenda la cita y devuelve la tarjeta de reserva', async () => {
    fakeAnthropic(
      tool('consultarDisponibilidad', { fecha: '2099-01-02' }),
      tool('agendarCita', { nombre: 'Carlos Ruiz', telefono: '310 625 8657', moto: 'MT-09', servicioId: 'ceramico', fecha: '2099-01-02', hora: '09:00' }),
      text('¡Listo! Tu cita quedó agendada.'),
    )
    const res = await chat([user('Sí, confirmo la cita')]).expect(200)
    assert.equal(res.body.reply, '¡Listo! Tu cita quedó agendada.')
    assert.deepEqual({ ...res.body.booking, id: 'X' }, {
      ok: true, id: 'X', servicio: 'Recubrimiento Cerámico', fecha: '2099-01-02', hora: '09:00', moto: 'MT-09', nombre: 'Carlos Ruiz',
    })
    assert.match(res.body.booking.id, /^[0-9A-F]{8}$/)
    // El modelo recibió los horarios reales como resultado de la herramienta.
    const toolResult = JSON.parse(calls[1].body.messages.at(-1).content[0].content)
    assert.equal(toolResult.slots.length, 9)
    const { rows } = await ctx.query("SELECT source, phone FROM appointments WHERE date = '2099-01-02'")
    assert.deepEqual(rows, [{ source: 'chatbot', phone: '3106258657' }])
  })

  it('si el turno está ocupado, el modelo recibe el error y el front ok:false', async () => {
    fakeAnthropic(
      tool('agendarCita', { nombre: 'Otra', telefono: '3000000000', moto: 'NKD', servicioId: 'frenos', fecha: '2099-01-02', hora: '09:00' }),
      text('Ese horario se acaba de ocupar, ¿te sirve a las 10:00?'),
    )
    const res = await chat([user('Agéndame')]).expect(200)
    assert.deepEqual(res.body.booking, { ok: false, error: 'Ese horario ya no está disponible' })
  })

  it('valida la conversación', async () => {
    await chat([]).expect(400)
    await chat([HELLO]).expect(400)
    await chat([user('')]).expect(400)
  })

  it('si la IA falla responde 502; sin API key, 503', async () => {
    fakeAnthropic({ status: 500, error: 'boom' })
    const res = await chat([user('hola')]).expect(502)
    assert.equal(res.body.error, 'El asistente no pudo responder en este momento.')
    const key = config.anthropicKey
    config.anthropicKey = ''
    await chat([user('hola')]).expect(503)
    config.anthropicKey = key
  })
})
