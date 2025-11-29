-- Crear tabla banners para MySQL/MariaDB en XAMPP
-- Esta tabla almacena los banners promocionales que se muestran en el carrusel

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

-- Comentarios sobre la tabla:
-- - title: Título del banner (requerido)
-- - description: Descripción del banner (requerido)
-- - cta_text: Texto del botón de llamada a la acción (opcional)
-- - cta_url: URL a la que redirige al hacer clic (opcional)
-- - icon: SVG path para icono personalizado (opcional)
-- - is_active: Si el banner está activo y se muestra en el carrusel
-- - order: Orden de visualización (menor número = aparece primero)
-- - INDEX: Índices para mejorar el rendimiento de las consultas

