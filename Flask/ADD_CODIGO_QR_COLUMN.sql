-- Agregar columna codigo_qr a la tabla visitors
-- Ejecutar este script en phpMyAdmin o MySQL

USE aicp_db;

ALTER TABLE visitors 
ADD COLUMN codigo_qr TEXT NULL AFTER status;

-- La columna codigo_qr almacenará el código QR generado como texto (URL o datos del QR)


