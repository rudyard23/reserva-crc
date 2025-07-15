-- Crear tabla de alumnos
CREATE TABLE IF NOT EXISTS alumnos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  clave_acceso TEXT UNIQUE NOT NULL,
  tope_lugares INTEGER DEFAULT 4,
  lugares_usados INTEGER DEFAULT 0
);

-- Crear tabla de funciones
CREATE TABLE IF NOT EXISTS funciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  fecha TEXT NOT NULL
);

-- Crear tabla de asientos
CREATE TABLE IF NOT EXISTS asientos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero TEXT NOT NULL,
  estado TEXT DEFAULT 'libre'
);

-- Crear tabla de reservas
CREATE TABLE IF NOT EXISTS reservas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_alumno INTEGER,
  id_asiento INTEGER,
  id_funcion INTEGER,
  fecha_reserva TEXT,
  FOREIGN KEY(id_alumno) REFERENCES alumnos(id),
  FOREIGN KEY(id_asiento) REFERENCES asientos(id),
  FOREIGN KEY(id_funcion) REFERENCES funciones(id)
);

-- Insertar función
INSERT INTO funciones (nombre, fecha) VALUES ('Obra Principal', '2025-07-20');

-- Insertar algunos alumnos
INSERT INTO alumnos (nombre, clave_acceso, tope_lugares) VALUES
('Ana', 'ana2025', 4),
('Luis', 'luis2025', 2),
('Claudia', 'claudia2025', 3);

-- Insertar asientos de la A1 a A10
INSERT INTO asientos (numero) VALUES
('A1'), ('A2'), ('A3'), ('A4'), ('A5'),
('A6'), ('A7'), ('A8'), ('A9'), ('A10');
