# Estructura del Chat - Residencia y Administración

## 📋 Análisis de la Tabla Actual

Tu tabla `chat_messages` actual tiene:
- ✅ `id` - Identificador único
- ✅ `fraccionamiento_id` - Para filtrar por fraccionamiento (opcional)
- ✅ `user_id` - Quien envía el mensaje
- ✅ `message` - Contenido del mensaje
- ✅ `created_at` - Fecha de creación
- ❌ **Falta: Campo para distinguir entre "Administración" y "Seguridad"**

## 🔧 Solución Propuesta

**NO necesitas crear una tabla nueva**, solo necesitas **modificar la tabla existente** agregando un campo.

### Campo a Agregar:

```sql
chat_type ENUM('administration', 'security') DEFAULT 'administration'
```

Este campo distinguirá entre:
- **`administration`**: Mensajes del chat de Administración
- **`security`**: Mensajes del chat de Seguridad

## 📝 Script SQL a Ejecutar

He creado el archivo `ALTER_TABLE_CHAT_MESSAGES.sql` que:

1. ✅ Agrega el campo `chat_type` a la tabla
2. ✅ Crea índices para optimizar las consultas
3. ✅ Mantiene compatibilidad con datos existentes (usa DEFAULT)

**Pasos:**
1. Abre phpMyAdmin
2. Selecciona la base de datos `aicp_db`
3. Ve a la pestaña "SQL"
4. Copia y pega el contenido de `ALTER_TABLE_CHAT_MESSAGES.sql`
5. Ejecuta el script

## 🎯 Funcionamiento del Chat

### Flujo del Chat:

1. **Residente o Administrador abre el chat**
   - Puede elegir entre pestaña "Administración" o "Seguridad"

2. **Al seleccionar una pestaña:**
   - Frontend solicita: `GET /api/chat/messages?chat_type=administration&user_id=62`
   - Backend devuelve mensajes filtrados por `chat_type`

3. **Al enviar un mensaje:**
   - Frontend envía: `POST /api/chat/messages` con `chat_type`, `user_id`, `message`
   - Backend guarda el mensaje con el tipo correspondiente

4. **Visualización:**
   - Mensajes enviados por el usuario actual se muestran a la derecha (azul)
   - Mensajes recibidos de otros se muestran a la izquierda (gris)

## 📊 Estructura Final de la Tabla

```sql
chat_messages
├── id (INT) - Auto increment
├── fraccionamiento_id (INT, NULL) - Opcional, para filtrar por fraccionamiento
├── chat_type (ENUM) - 'administration' o 'security' ⭐ NUEVO
├── user_id (INT) - Quien envía el mensaje
├── message (TEXT) - Contenido del mensaje
└── created_at (TIMESTAMP) - Fecha de creación
```

## 🚀 Próximos Pasos

Después de ejecutar el script SQL:

1. ✅ Crear los endpoints en Flask:
   - `GET /api/chat/messages?chat_type=administration&user_id=X`
   - `POST /api/chat/messages` (crear nuevo mensaje)

2. ✅ Crear el servicio en Angular:
   - `ChatService` para comunicarse con el backend

3. ✅ Conectar el componente:
   - Implementar `loadMessages()` y `sendMessage()` con el servicio

¿Quieres que implemente los endpoints y el servicio ahora?

