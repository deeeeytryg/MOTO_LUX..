import { createApp } from './app.js'
import { config, missingConfig } from './config.js'

const missing = missingConfig()
if (missing.length) {
  console.error(`Faltan variables de entorno: ${missing.join(', ')}. Revisa .env (copia de .env.example).`)
  process.exit(1)
}

createApp().listen(config.port, () => {
  console.log(`API de MotoLux en http://localhost:${config.port}`)
  console.log(`CORS permitido para: ${config.allowedOrigins.join(', ')}`)
  if (config.generatedAdminPassword) {
    console.log(`Admin (solo desarrollo): ${config.adminEmail} / ${config.generatedAdminPassword}  ← define ADMIN_PASSWORD en .env para fijarla`)
  }
})
