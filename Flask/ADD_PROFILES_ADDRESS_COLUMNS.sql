-- Script para agregar columnas de dirección y teléfono a la tabla profiles
-- Ejecutar este script en phpMyAdmin o MySQL

USE aicp_db;

-- Agregar columna phone si no existe
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL AFTER email;

-- Agregar columna street si no existe
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS street VARCHAR(255) NULL AFTER fraccionamiento_id;

-- Agregar columna house_number si no existe
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS house_number VARCHAR(50) NULL AFTER street;

-- Nota: Si la columna 'address' ya existe y quieres mantenerla, puedes construirla
-- a partir de street y house_number, o viceversa. Hola buenas tardes. Que tal estan? Modificacion


