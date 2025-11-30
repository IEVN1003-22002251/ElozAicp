-- Script para modificar la tabla chat_messages para soportar conversaciones 1 a 1
-- Ejecutar este script en phpMyAdmin o MySQL
-- Este script actualiza la tabla para permitir chats directos entre admin y residentes

USE aicp_db;

-- Si la tabla no existe, crearla
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_conversation (sender_id, receiver_id, created_at),
    FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Si la tabla ya existe, verificar si necesita modificaciones
-- Nota: Si ya tienes datos y estructura diferente, ajusta este script según tus necesidades

-- Verificar si existen las columnas sender_id y receiver_id
-- Si no existen, agregarlas (comentar si la tabla ya tiene otra estructura)

-- ALTER TABLE chat_messages 
-- ADD COLUMN sender_id INT AFTER id,
-- ADD COLUMN receiver_id INT AFTER sender_id;

-- Crear índices para mejorar las consultas
-- ALTER TABLE chat_messages 
-- ADD INDEX idx_sender (sender_id),
-- ADD INDEX idx_receiver (receiver_id),
-- ADD INDEX idx_conversation (sender_id, receiver_id, created_at);

-- Agregar foreign keys si no existen
-- ALTER TABLE chat_messages 
-- ADD CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE,
-- ADD CONSTRAINT fk_receiver FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Comentarios sobre la nueva estructura:
-- id: Identificador único del mensaje
-- sender_id: ID del usuario que envía el mensaje (referencia a profiles.id)
-- receiver_id: ID del usuario que recibe el mensaje (referencia a profiles.id)
-- message: Contenido del mensaje
-- created_at: Fecha y hora de creación del mensaje
-- updated_at: Fecha y hora de última actualización

-- Notas:
-- - Para chats 1 a 1 entre admin y residente: sender_id será admin, receiver_id será residente
-- - Para responder, se invierten los IDs (sender_id=residente, receiver_id=admin)
-- - Los índices permiten buscar conversaciones eficientemente

