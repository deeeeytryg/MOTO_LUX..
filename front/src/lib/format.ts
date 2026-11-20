// Formatos de presentación compartidos.

/** Pesos colombianos sin decimales: 120000 → "$ 120.000" */
export const cop = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)

/** Duración en minutos legible: 90 → "1 h 30 min" */
export const dur = (m: number) => {
  const h = Math.floor(m / 60)
  const r = m % 60
  return h === 0 ? `${r} min` : r === 0 ? `${h} h` : `${h} h ${r} min`
}

/** Ruta a una imagen de public/images respetando el base de Vite (GitHub Pages). */
export const img = (name: string) => `${import.meta.env.BASE_URL}images/${name}`
