import { config } from '../config.js'
import { HttpError } from '../errors.js'
import { listServices } from '../models/services.js'
import { buildSystemPrompt } from './prompt.js'
import { buildTools, runTool } from './tools.js'

/*
 * Chatbot "Lux" con la API de Anthropic y herramientas (tool use):
 * el modelo puede pedir consultarDisponibilidad o agendarCita; el servidor las ejecuta y le
 * devuelve el resultado, y se repite hasta que el modelo responde con texto (máx. 5 vueltas).
 */

const MAX_STEPS = 5

/** Limpia el historial que manda el navegador: solo texto, con límites de tamaño y cantidad. */
export function sanitizeMessages(raw) {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 30) throw new HttpError(400, 'Conversación inválida')
  const messages = raw.map((m) => ({
    role: m?.role === 'assistant' ? 'assistant' : 'user',
    content: typeof m?.content === 'string' ? m.content.trim().slice(0, 1000) : '',
  }))
  if (messages.some((m) => !m.content) || messages.at(-1).role !== 'user') throw new HttpError(400, 'Conversación inválida')
  // La API exige que la conversación empiece con el usuario: se omite el saludo inicial del asistente.
  while (messages[0].role === 'assistant') messages.shift()
  return messages
}

async function callModel(body) {
  let response
  try {
    response = await fetch(`${config.anthropicUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': config.anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25_000),
    })
  } catch {
    throw new HttpError(502, 'No pudimos conectar con el asistente.')
  }
  if (!response.ok) {
    console.error('Error de la API de IA:', response.status, await response.text().catch(() => ''))
    throw new HttpError(502, 'El asistente no pudo responder en este momento.')
  }
  return response.json()
}

/** Recibe el historial del chat y devuelve { reply, booking }. */
export async function chat(rawMessages) {
  if (!config.anthropicKey) throw new HttpError(503, 'El asistente no está configurado todavía.')
  const messages = sanitizeMessages(rawMessages)
  const services = await listServices({ activeOnly: true })
  const system = buildSystemPrompt(services)
  const tools = buildTools(services.map((s) => s.id))
  let booking = null

  for (let step = 0; step < MAX_STEPS; step++) {
    const data = await callModel({ model: config.aiModel, max_tokens: 700, system, tools, messages })
    const toolCalls = data.content.filter((b) => b.type === 'tool_use')

    if (data.stop_reason !== 'tool_use' || toolCalls.length === 0) {
      const reply = data.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim()
      return { reply: reply || 'Listo.', booking }
    }

    // El modelo pidió herramientas: se ejecutan y se le devuelven los resultados.
    messages.push({ role: 'assistant', content: data.content })
    const results = []
    for (const call of toolCalls) {
      const out = await runTool(call.name, call.input)
      if (out.booking) booking = out.booking
      results.push({ type: 'tool_result', tool_use_id: call.id, content: JSON.stringify(out.result) })
    }
    messages.push({ role: 'user', content: results })
  }
  return { reply: 'Necesito un momento más para ayudarte. ¿Puedes repetirme tu solicitud?', booking }
}
