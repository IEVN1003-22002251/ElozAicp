-- Script para modificar la tabla chat_messages y agregar el campo chat_type
-- Ejecutar este script en phpMyAdmin o MySQL

USE aicp_db;

-- Agregar columna chat_type para distinguir entre administration y security
ALTER TABLE chat_messages 
ADD COLUMN chat_type ENUM('administration', 'security') DEFAULT 'administration' AFTER fraccionamiento_id;

-- Crear índice para mejorar las consultas por tipo de chat
ALTER TABLE chat_messages 
ADD INDEX idx_chat_type (chat_type);

-- Crear índice compuesto para consultas más eficientes (chat_type + fraccionamiento_id + created_at)
ALTER TABLE chat_messages 
ADD INDEX idx_chat_type_fraccionamiento (chat_type, fraccionamiento_id, created_at);

-- Comentarios sobre la estructura actualizada:
-- id: Identificador único del mensaje
-- fraccionamiento_id: ID del fraccionamiento (puede ser NULL para chats globales)
-- chat_type: Tipo de chat ('administration' o 'security')
-- user_id: ID del usuario que envía el mensaje (referencia a profiles.id)
-- message: Contenido del mensaje
-- created_at: Fecha y hora de creación del mensaje

