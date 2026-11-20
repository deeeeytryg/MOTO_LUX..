// Datos de demostración para el panel (clientes y citas de ejemplo). Solo si aún no hay citas.
// Uso: npm run db:seed-demo
import { pool, transaction } from './pool.js'

// Fecha local de Colombia desplazada `days` días: '2026-11-21'.
const day = (days) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date(Date.now() + days * 86_400_000))

const DEMO = [
  ['Andrés Gómez', '3104567890', 'andres@correo.co', 'Yamaha MT-09 2023', 'ceramico', 1, '09:00', 'Quiere protección para viaje largo.', 'confirmada', 'chatbot'],
  ['Laura Martínez', '3159876543', '', 'Honda CB190R', 'mantenimiento-bajo', 1, '11:00', '', 'pendiente', 'web'],
  ['Camilo Rojas', '3001112233', '', 'BMW R 1250 GS', 'mantenimiento-alto', 2, '08:00', 'Revisar ruido en suspensión trasera.', 'pendiente', 'chatbot'],
  ['Valentina Ríos', '3207654321', 'vale@correo.co', 'Bajaj Pulsar NS200', 'detailing-completo', -2, '14:00', '', 'completada', 'admin'],
]

export async function seedDemo() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM appointments')
  if (rows[0].n > 0) return 0
  await transaction(async (db) => {
    for (const [name, phone, email, moto, serviceId, offset, time, notes, status, source] of DEMO) {
      await db.query(
        `INSERT INTO clients (phone, name, email, motorcycles) VALUES ($1, $2, $3, ARRAY[$4])
         ON CONFLICT (phone) DO NOTHING`,
        [phone, name, email, moto],
      )
      await db.query(
        `INSERT INTO appointments (client_name, phone, motorcycle, service_id, date, time, notes, status, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [name, phone, moto, serviceId, day(offset), time, notes, status, source],
      )
    }
    await db.query(
      `INSERT INTO messages (name, email, phone, message)
       VALUES ('Pedro Salazar', 'pedro@correo.co', '3012345678', '¿Hacen recubrimiento cerámico a domicilio en Villavicencio?')`,
    )
  })
  return DEMO.length
}

if (process.argv[1]?.endsWith('seed-demo.js')) {
  try {
    const n = await seedDemo()
    console.log(n ? `Datos de demostración cargados: ${n} citas.` : 'Ya hay citas en la base: no se cargó nada.')
  } catch (err) {
    console.error('Error al cargar los datos de demostración:', err.message)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}
