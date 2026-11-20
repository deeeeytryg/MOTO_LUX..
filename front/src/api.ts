// Cliente de la API: único lugar del frontend que habla con el backend. Cada función es una ruta que el backend Express debe implementar.
import type {
  AdminData, AppointmentStatus, ChatMessage, ChatReply, ContactForm, NewService, Service,
} from './types'

const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:3001').replace(/\/$/, '')
const TOKEN_KEY = 'motolux_token'

export const getToken = () => sessionStorage.getItem(TOKEN_KEY)
export const setToken = (t: string | null) =>
  t ? sessionStorage.setItem(TOKEN_KEY, t) : sessionStorage.removeItem(TOKEN_KEY)

/** Error de la API con el código HTTP y los errores por campo (validación del servidor). */
export class ApiError extends Error {
  constructor(
    message: string,
    public status = 0,
    public fieldErrors: Record<string, string> = {},
  ) {
    super(message)
  }
}

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE'

export async function request<T = unknown>(path: string, method: Method = 'GET', body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  let res: Response
  try {
    res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined })
  } catch {
    throw new ApiError('No hay conexión con el servidor. Intenta de nuevo.')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.error ?? 'Error inesperado', res.status, data.fieldErrors)
  return data as T
}

/* ---------- Públicas ---------- */

export const getHealth = () => request<{ ok: boolean }>('/api/health')
export const getServices = () => request<{ services: Service[] }>('/api/services').then((d) => d.services)
export const sendContact = (form: ContactForm) => request<{ message: string }>('/api/contact', 'POST', form)
export const sendChat = (messages: ChatMessage[]) => request<ChatReply>('/api/chat', 'POST', { messages })

/* ---------- Administrador (requieren token) ---------- */

export const adminLogin = (email: string, password: string) =>
  request<{ token: string; email: string }>('/api/admin/login', 'POST', { email, password })
export const getAdminData = () => request<AdminData>('/api/admin/data')
export const updateAppointmentStatus = (id: string, status: AppointmentStatus) =>
  request(`/api/admin/appointments/${id}`, 'PATCH', { status })
export const deleteAppointment = (id: string) => request(`/api/admin/appointments/${id}`, 'DELETE')
export const createService = (s: NewService) => request<{ message: string }>('/api/admin/services', 'POST', s)
export const updateService = (id: string, patch: Partial<Pick<Service, 'active' | 'priceFrom'>>) =>
  request(`/api/admin/services/${id}`, 'PATCH', patch)
export const markMessageRead = (id: string) => request(`/api/admin/messages/${id}/read`, 'PATCH')
