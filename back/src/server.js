import { createApp } from './app.js'
import { config } from './config.js'

createApp().listen(config.port, () => {
  console.log(`API de MotoLux en http://localhost:${config.port}`)
  console.log(`CORS permitido para: ${config.allowedOrigins.join(', ')}`)
})
