-- Script para actualizar la tabla banners según las especificaciones
-- Ejecutar este script en phpMyAdmin o MySQL

USE aicp_db;

-- Eliminar la tabla banners existente si tiene estructura diferente
DROP TABLE IF EXISTS banners;

-- Crear la tabla banners con la estructura correcta
CREATE TABLE IF NOT EXISTS banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    cta_text VARCHAR(255),
    cta_url VARCHAR(500),
    icon TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    `order` INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_is_active (is_active),
    INDEX idx_order (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

