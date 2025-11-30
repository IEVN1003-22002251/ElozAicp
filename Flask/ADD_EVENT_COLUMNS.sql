-- Agregar columnas para eventos en la tabla visitors
-- Ejecutar este script en phpMyAdmin o MySQL
-- Nota: Si las columnas ya existen, este script mostrará un error pero no afectará la base de datos

USE aicp_db;

-- Agregar columna eventDate si no existe
ALTER TABLE visitors 
ADD COLUMN eventDate DATE NULL;

-- Agregar columna eventTime si no existe
ALTER TABLE visitors 
ADD COLUMN eventTime TIME NULL;

-- Agregar columna numberOfGuests si no existe
ALTER TABLE visitors 
ADD COLUMN numberOfGuests INT NULL;

-- Agregar columna eventLocation si no existe
ALTER TABLE visitors 
ADD COLUMN eventLocation VARCHAR(50) NULL;

