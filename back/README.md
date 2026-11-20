# MotoLux — Backend

API de MotoLux: catálogo de servicios, formulario de contacto, chat con el asistente de IA "Lux" (agenda citas de verdad) y panel administrativo.

**Stack:** Node.js 22+ · Express 5 · PostgreSQL (Supabase) con `pg` y SQL directo · JWT · API de Anthropic (tool use)

## Correr en local

```bash
cp .env.example .env     # y completa DATABASE_URL, ADMIN_PASSWORD, JWT_SECRET, ANTHROPIC_API_KEY
npm install
npm run db:migrate       # crea las tablas y carga los 9 servicios
npm run db:seed-demo     # (opcional) citas, clientes y un mensaje de ejemplo
npm run dev              # http://localhost:3001/api/health → { ok: true, db: true }
```

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor con recarga automática, lee `.env` |
| `npm start` | Servidor (las variables vienen del entorno) |
| `npm run start:prod` | Migra y arranca (lo usa Render) |
| `npm run db:migrate` | Crea tablas e índices si no existen y carga el catálogo inicial |
| `npm run db:seed-demo` | Datos de demostración (solo si no hay citas) |
| `npm test` | Pruebas (`node:test` + `supertest`) |

## Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | Sí | Postgres. En Supabase: **Connect → Session pooler** (IPv4, puerto 5432) |
| `ALLOWED_ORIGINS` | En producción | URLs del front separadas por coma, sin `/` final. Por defecto `http://localhost:5173` |
| `ADMIN_EMAIL` | En producción | Correo del administrador. Por defecto `admin@motolux.co` |
| `ADMIN_PASSWORD` | En producción | Contraseña del administrador. En desarrollo, si falta, se genera una y se muestra en la consola |
| `JWT_SECRET` | En producción | Secreto para firmar los tokens de sesión (8 h) |
| `ANTHROPIC_API_KEY` | No | Sin ella el chat responde 503 y el resto funciona |
| `AI_MODEL` | No | Modelo de Anthropic. Por defecto `claude-haiku-5-5` |
| `PORT` | No | Por defecto 3001 (Render lo define solo) |

En producción (`NODE_ENV=production`) el servidor **no arranca** si falta una variable obligatoria.

## Estructura

```
src/
  server.js          arranque (valida la configuración)
  app.js             createApp(): CORS, JSON, rutas, errores
  config.js          único lugar que lee process.env
  errors.js          HttpError y manejador → { error, fieldErrors? }
  auth.js            login y middleware requireAdmin (JWT)
  rate-limit.js      límites por IP (contacto, login, chat)
  validators.js      validación de todo lo que entra
  business.js        datos del negocio, horario y zona horaria
  routes/public.js   /api/services, /contact, /availability, /chat
  routes/admin.js    /api/admin/*
  models/            SQL por tabla: services, appointments, clients, messages
  ai/                Lux: prompt, herramientas y ciclo con la API de Anthropic
  db/                pool, schema.sql, migrate, seed-services, seed-demo
test/                pruebas (usan el esquema motolux_test, no tocan los datos reales)
```

## API

| Método | Ruta | Auth | Respuesta |
|---|---|---|---|
| GET | `/api/health` | — | `{ ok, db }` |
| GET | `/api/services` | — | `{ services }` (solo activos) |
| POST | `/api/contact` | — | `201 { message }` · 5 cada 10 min por IP |
| GET | `/api/availability?date=AAAA-MM-DD` | — | `{ open, slots, reason }` |
| POST | `/api/chat` | — | `{ reply, booking }` · 20 por min por IP |
| POST | `/api/admin/login` | — | `{ token, email }` · 5 por min por IP |
| GET | `/api/admin/me` | Bearer | `{ email }` |
| GET | `/api/admin/data` | Bearer | `{ appointments, clients, services, messages }` |
| PATCH | `/api/admin/appointments/:id` | Bearer | `{ status }` → 204 |
| DELETE | `/api/admin/appointments/:id` | Bearer | 204 |
| POST | `/api/admin/services` | Bearer | `201 { message, service }` |
| PATCH | `/api/admin/services/:id` | Bearer | `{ priceFrom?, active? }` → 204 |
| PATCH | `/api/admin/messages/:id/read` | Bearer | 204 |

Errores siempre como `{ error: string, fieldErrors?: { campo: mensaje } }`.

## Desplegar en Render (gratis)

El archivo `render.yaml` de la raíz del repo define el servicio.

1. Render → **New → Blueprint** → conecta este repositorio.
2. Completa las variables que pide: `DATABASE_URL` (Session pooler de Supabase), `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ANTHROPIC_API_KEY`. `JWT_SECRET` se genera solo.
3. Al terminar, verifica `https://<tu-servicio>.onrender.com/api/health` → `{"ok":true,"db":true}`.
4. En GitHub → Settings → Secrets and variables → Actions → Variables, pon `VITE_API_URL` con esa URL (sin `/` final) y vuelve a ejecutar el workflow **Deploy front**.

El plan gratis apaga el servicio tras 15 minutos sin tráfico; la primera petición después tarda cerca de un minuto en despertarlo.
