# MotoLux — Frontend

Sitio de MotoLux (detailing premium y mecánica de motos): home con catálogo, contacto, chat con el asistente de IA "Lux" y panel administrativo.

**Stack:** Vue 3 + TypeScript · Vite · Vue Router (hash) · Tailwind CSS v4 · lucide-vue-next

## Correr en local

```bash
cp .env.example .env   # VITE_API_URL=http://localhost:3001
npm install
npm run dev            # http://localhost:5173
```

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Revisa tipos (`vue-tsc`) y genera `dist/` |
| `npm run preview` | Sirve `dist/` para probar el build |
| `npm run lint` | oxlint + ESLint |

## Rutas

- `#/` — Home
- `#/admin` — Panel administrativo (requiere login contra el backend)

Se usan rutas con hash porque GitHub Pages solo sirve archivos estáticos. Por eso los enlaces internos (`#servicios`, `#contacto`…) hacen scroll con `scrollToSection()` en vez de cambiar la URL.

## Estructura

```
src/
  api.ts            único lugar que habla con el backend (una función por ruta)
  types.ts          contrato de datos con el backend
  business.ts       teléfono, WhatsApp, horario, Instagram
  lib/              format (COP, duración, imágenes), chat (openChat), scroll
  directives/       v-reveal: animación de entrada al hacer scroll
  components/       TheHeader, TheFooter, LuxChat
    home/           Hero, Services, Process, Contact
    admin/          AdminLogin, AdminDashboard, NewServiceForm
  views/            HomeView, AdminView
public/images/      imágenes del sitio
```

## Contrato con el backend

| Método | Ruta | Uso |
|---|---|---|
| GET | `/api/health` | `{ ok: true }` |
| GET | `/api/services` | `{ services: Service[] }` (solo activos) |
| POST | `/api/contact` | `ContactForm` → `{ message }` · errores `{ error, fieldErrors }` |
| POST | `/api/chat` | `{ messages: ChatMessage[] }` → `{ reply, booking }` |
| POST | `/api/admin/login` | `{ email, password }` → `{ token, email }` |
| GET | `/api/admin/data` | `{ appointments, clients, services, messages }` |
| PATCH | `/api/admin/appointments/:id` | `{ status }` |
| DELETE | `/api/admin/appointments/:id` | — |
| POST | `/api/admin/services` | `NewService` → `{ message }` |
| PATCH | `/api/admin/services/:id` | `{ priceFrom?, active? }` |
| PATCH | `/api/admin/messages/:id/read` | — |

Las rutas `/api/admin/*` (menos login) reciben `Authorization: Bearer <token>`; si responden 401 el panel vuelve al login. Los errores siempre vienen como `{ error: string, fieldErrors?: Record<string, string> }`. Los tipos exactos están en `src/types.ts`.


