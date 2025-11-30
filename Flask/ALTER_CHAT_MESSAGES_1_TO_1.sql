-- Script para agregar soporte de conversaciones 1 a 1 a chat_messages
-- Ejecutar este script en phpMyAdmin o MySQL

USE aicp_db;

-- Agregar columnas sender_id y receiver_id si no existen
-- Verificar primero si existen antes de agregarlas

-- Agregar sender_id después de id
ALTER TABLE chat_messages 
ADD COLUMN sender_id INT NULL AFTER id;

-- Agregar receiver_id después de sender_id
ALTER TABLE chat_messages 
ADD COLUMN receiver_id INT NULL AFTER sender_id;

-- Agregar índices para mejorar las consultas
ALTER TABLE chat_messages 
ADD INDEX idx_sender (sender_id),
ADD INDEX idx_receiver (receiver_id),
ADD INDEX idx_conversation (sender_id, receiver_id, created_at);

-- Agregar foreign keys
ALTER TABLE chat_messages 
ADD CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_receiver FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Nota: Las columnas sender_id y receiver_id son NULL para mantener compatibilidad
-- con los mensajes existentes que usan la estructura antigua (chat_type, user_id)

