import rateLimit from 'express-rate-limit'
import { HttpError } from './errors.js'

/** Limita a `limit` peticiones por IP cada `minutes`; al pasarse responde 429 en el formato { error }. */
export const limiter = (limit, minutes) =>
  rateLimit({
    windowMs: minutes * 60_000,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res, next) => next(new HttpError(429, 'Demasiadas solicitudes. Intenta de nuevo en un momento.')),
  })
