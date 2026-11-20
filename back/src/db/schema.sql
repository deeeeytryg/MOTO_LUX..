-- Esquema de MotoLux. Es idempotente: se puede ejecutar varias veces sin perder datos.

CREATE TABLE IF NOT EXISTS services (
  id           TEXT PRIMARY KEY,               -- slug, ej: 'lavado-premium'
  name         TEXT NOT NULL,
  category     TEXT NOT NULL CHECK (category IN ('detailing', 'mecanica')),
  cilindraje   TEXT NOT NULL CHECK (cilindraje IN ('todas', 'bajo', 'alto')),
  description  TEXT NOT NULL,
  price_from   INTEGER NOT NULL CHECK (price_from >= 0),
  duration_min INTEGER NOT NULL CHECK (duration_min > 0),
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clients (
  phone        TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL DEFAULT '',
  motorcycles  TEXT[] NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name  TEXT NOT NULL,
  phone        TEXT NOT NULL,
  motorcycle   TEXT NOT NULL,
  service_id   TEXT NOT NULL REFERENCES services(id),
  date         DATE NOT NULL,
  time         TIME NOT NULL,
  notes        TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'pendiente'
               CHECK (status IN ('pendiente', 'confirmada', 'completada', 'cancelada')),
  source       TEXT NOT NULL CHECK (source IN ('web', 'chatbot', 'admin')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Un solo turno activo por fecha y hora (las citas canceladas liberan el cupo).
CREATE UNIQUE INDEX IF NOT EXISTS uq_appointments_slot
  ON appointments (date, time) WHERE status <> 'cancelada';

CREATE TABLE IF NOT EXISTS messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT NOT NULL,
  message      TEXT NOT NULL,
  read         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
