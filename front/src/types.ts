// Contrato de la API: tipos de los datos que intercambian el frontend y el backend (Express). camelCase.

export type Category = 'detailing' | 'mecanica'
export type Cilindraje = 'todas' | 'bajo' | 'alto'
export type AppointmentStatus = 'pendiente' | 'confirmada' | 'completada' | 'cancelada'
export type AppointmentSource = 'web' | 'chatbot' | 'admin'

export interface Service {
  id: string
  name: string
  category: Category
  cilindraje: Cilindraje
  description: string
  priceFrom: number
  durationMin: number
  active: boolean
}

export type NewService = Omit<Service, 'id' | 'active'>

export interface Appointment {
  id: string
  clientName: string
  phone: string
  motorcycle: string
  serviceId: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  notes: string
  status: AppointmentStatus
  source: AppointmentSource
  createdAt: string
}

export interface Client {
  phone: string
  name: string
  email: string
  motorcycles: string[]
  createdAt: string
  appointments: number
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string
  message: string
  read: boolean
  createdAt: string
}

export interface ContactForm {
  name: string
  email: string
  phone: string
  message: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/** Resultado de agendar desde el chat (lo devuelve la herramienta de la IA). */
export type Booking =
  | { ok: true; id: string; servicio: string; fecha: string; hora: string; moto: string; nombre: string }
  | { ok: false; error: string }

export interface ChatReply {
  reply: string
  booking: Booking | null
}

export interface AdminData {
  appointments: Appointment[]
  clients: Client[]
  services: Service[]
  messages: ContactMessage[]
}
