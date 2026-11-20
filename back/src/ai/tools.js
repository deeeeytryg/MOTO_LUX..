import { HttpError } from '../errors.js'
import { createAppointment, getAvailableSlots } from '../models/appointments.js'
import { parseAppointment } from '../validators.js'

/** Herramientas que el modelo puede pedir; el servidor las ejecuta contra la base de datos real. */
export function buildTools(serviceIds) {
  return [
    {
      name: 'consultarDisponibilidad',
      description: 'Consulta los horarios libres del taller para una fecha específica.',
      input_schema: {
        type: 'object',
        properties: { fecha: { type: 'string', description: 'Fecha en formato AAAA-MM-DD' } },
        required: ['fecha'],
      },
    },
    {
      name: 'agendarCita',
      description: 'Agenda una cita en el taller. Úsala solo después de que el cliente confirme todos los datos.',
      input_schema: {
        type: 'object',
        properties: {
          nombre: { type: 'string', description: 'Nombre completo del cliente' },
          telefono: { type: 'string', description: 'Teléfono celular del cliente' },
          moto: { type: 'string', description: 'Marca y modelo de la moto' },
          servicioId: { type: 'string', enum: serviceIds, description: 'ID del servicio del catálogo' },
          fecha: { type: 'string', description: 'Fecha en formato AAAA-MM-DD' },
          hora: { type: 'string', description: 'Hora en formato HH:00' },
          notas: { type: 'string', description: 'Detalles adicionales del cliente' },
        },
        required: ['nombre', 'telefono', 'moto', 'servicioId', 'fecha', 'hora'],
      },
    },
  ]
}

/** Ejecuta una herramienta. Devuelve { result } para el modelo y, si agendó, { booking } para el front. */
export async function runTool(name, input = {}) {
  if (name === 'consultarDisponibilidad') {
    return { result: await getAvailableSlots(String(input.fecha ?? '')) }
  }

  if (name === 'agendarCita') {
    try {
      const a = await createAppointment({
        ...parseAppointment({
          clientName: input.nombre, phone: input.telefono, motorcycle: input.moto,
          serviceId: input.servicioId, date: input.fecha, time: input.hora, notes: input.notas,
        }),
        source: 'chatbot',
      })
      const booking = {
        ok: true,
        id: a.id.slice(0, 8).toUpperCase(),
        servicio: a.serviceName,
        fecha: a.date,
        hora: a.time,
        moto: a.motorcycle,
        nombre: a.clientName,
      }
      return { result: booking, booking }
    } catch (err) {
      if (!(err instanceof HttpError)) throw err
      const detail = err.fieldErrors ? Object.values(err.fieldErrors).join('. ') : err.message
      const failure = { ok: false, error: detail }
      return { result: failure, booking: failure }
    }
  }

  return { result: { error: 'Herramienta desconocida' } }
}
