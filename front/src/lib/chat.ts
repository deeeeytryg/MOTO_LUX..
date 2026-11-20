// Abre el chat de Lux desde cualquier botón (header, servicios, etc.) con un evento global.
// El componente LuxChat escucha este evento; si recibe un mensaje, lo envía de una vez.
export const CHAT_EVENT = 'motolux:chat'

export const openChat = (message?: string) =>
  window.dispatchEvent(new CustomEvent<string | undefined>(CHAT_EVENT, { detail: message }))
