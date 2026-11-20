import { createApp } from './app.js'
import { config } from './config.js'

if (!config.databaseUrl) {
  console.error('Falta DATABASE_URL. Copia .env.example como .env y pon la cadena de conexión de Supabase.')
  process.exit(1)
}

createApp().listen(config.port, () => {
  console.log(`API de MotoLux en http://localhost:${config.port}`)
  console.log(`CORS permitido para: ${config.allowedOrigins.join(', ')}`)
})
