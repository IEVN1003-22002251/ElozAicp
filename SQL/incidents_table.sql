-- Tabla para almacenar incidentes
CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(36) PRIMARY KEY,
    incident_type VARCHAR(100) NOT NULL COMMENT 'Tipo de incidente (robo, vandalismo, accidente, etc.)',
    description TEXT COMMENT 'Descripción detallada del incidente',
    location VARCHAR(255) COMMENT 'Ubicación donde ocurrió el incidente',
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium' COMMENT 'Severidad del incidente',
    status ENUM('reported', 'in_progress', 'resolved', 'closed') DEFAULT 'reported' COMMENT 'Estado del incidente',
    reported_by INT COMMENT 'ID del usuario que reportó el incidente',
    reported_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora del reporte',
    resolved_at DATETIME NULL COMMENT 'Fecha y hora de resolución',
    resolution_notes TEXT COMMENT 'Notas sobre la resolución',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
    fraccionamiento_id INT COMMENT 'ID del fraccionamiento relacionado',
    INDEX idx_incident_type (incident_type),
    INDEX idx_status (status),
    INDEX idx_reported_at (reported_at),
    INDEX idx_fraccionamiento_id (fraccionamiento_id),
    INDEX idx_reported_by (reported_by),
    FOREIGN KEY (reported_by) REFERENCES profiles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla de incidentes reportados';

-- Insertar algunos tipos de incidentes comunes (opcional, para referencia)
-- Estos son ejemplos de tipos de incidentes que se pueden usar:
-- 'robo', 'vandalismo', 'accidente_vehicular', 'accidente_personal', 
-- 'intrusion', 'ruido_excesivo', 'agua_fuga', 'electricidad_falla',
-- 'seguridad_brecha', 'otro'

