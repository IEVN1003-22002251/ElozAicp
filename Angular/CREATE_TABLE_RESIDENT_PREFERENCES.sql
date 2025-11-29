-- Crear tabla resident_preferences para MySQL/MariaDB en XAMPP
-- Esta tabla almacena las preferencias de los residentes sobre si aceptan visitas o personal

CREATE TABLE IF NOT EXISTS resident_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    accepts_visitors BOOLEAN DEFAULT FALSE,
    accepts_personnel BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_preference (user_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentarios sobre la tabla:
-- - user_id: Referencia al id de la tabla profiles
-- - accepts_visitors: Si el residente acepta visitas (FALSE por defecto)
-- - accepts_personnel: Si el residente acepta personal (TRUE por defecto)
-- - UNIQUE KEY: Garantiza que cada usuario solo tenga un registro de preferencias
-- - FOREIGN KEY: Mantiene la integridad referencial con la tabla profiles

