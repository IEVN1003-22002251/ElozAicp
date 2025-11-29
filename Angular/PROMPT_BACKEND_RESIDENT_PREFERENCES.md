# Prompt para Backend Flask - Preferencias de Residentes

## 📋 Descripción

Necesito que implementes endpoints en Flask para manejar las preferencias de los residentes sobre si aceptan visitas o personal. Cuando un residente cambia estas preferencias desde la aplicación móvil, se debe guardar en la base de datos.

## 🗄️ Estructura de Tabla en Base de Datos

Crea una tabla llamada `resident_preferences` con la siguiente estructura (MySQL/MariaDB en XAMPP):

```sql
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
```

**Nota sobre la tabla `profiles`:**
- La tabla `profiles` tiene la siguiente estructura relevante:
  - `id` (INT): Identificador único del usuario
  - `name`: Nombre completo del usuario
  - `user_name`: Nombre de usuario
  - `email`: Correo electrónico
  - `role`: Rol del usuario ('admin', 'resident', 'guard', 'visitor')
  - `fraccionamiento_id`: ID del fraccionamiento al que pertenece
  - `created_at`, `updated_at`: Timestamps de creación y actualización

**Relación:**
- `resident_preferences.user_id` → `profiles.id`
- Solo los usuarios con `role = 'resident'` deberían tener preferencias

## 🔧 Endpoints a Implementar

### 1. GET - Obtener Preferencias del Resident

**Ruta**: `/api/resident-preferences`  
**Método**: GET  
**Query Parameters**: `user_id` (integer, requerido)

**Ejemplo de solicitud:**
```
GET /api/resident-preferences?user_id=2
```

**Respuesta exitosa (200 OK):**
```json
{
    "exito": true,
    "success": true,
    "data": {
        "id": 1,
        "user_id": 2,
        "accepts_visitors": false,
        "accepts_personnel": true,
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    }
}
```

**Respuesta si no existe (200 OK con valores por defecto):**
```json
{
    "exito": true,
    "success": true,
    "data": {
        "user_id": 2,
        "accepts_visitors": false,
        "accepts_personnel": true
    }
}
```

### 2. POST - Crear o Actualizar Preferencias

**Ruta**: `/api/resident-preferences`  
**Método**: POST  
**Content-Type**: application/json

**Datos que recibirá (JSON):**
```json
{
    "user_id": 2,
    "accepts_visitors": true,
    "accepts_personnel": false
}
```

**Respuesta exitosa (200 OK o 201 Created):**
```json
{
    "exito": true,
    "success": true,
    "mensaje": "Preferencias actualizadas correctamente",
    "message": "Preferences updated successfully",
    "data": {
        "id": 1,
        "user_id": 2,
        "accepts_visitors": true,
        "accepts_personnel": false,
        "updated_at": "2024-01-01T00:00:00"
    }
}
```

**Lógica:**
- Si el `user_id` ya existe en la tabla, actualiza los valores
- Si no existe, crea un nuevo registro
- Usa `INSERT ... ON DUPLICATE KEY UPDATE` o lógica equivalente

### 3. PUT - Actualizar Preferencia de Visitas

**Ruta**: `/api/resident-preferences/visitors`  
**Método**: PUT  
**Content-Type**: application/json

**Datos que recibirá (JSON):**
```json
{
    "user_id": 2,
    "accepts_visitors": true
}
```

**Respuesta exitosa (200 OK):**
```json
{
    "exito": true,
    "success": true,
    "mensaje": "Preferencia de visitas actualizada",
    "message": "Visitor preference updated",
    "data": {
        "user_id": 2,
        "accepts_visitors": true,
        "updated_at": "2024-01-01T00:00:00"
    }
}
```

### 4. PUT - Actualizar Preferencia de Personal

**Ruta**: `/api/resident-preferences/personnel`  
**Método**: PUT  
**Content-Type**: application/json

**Datos que recibirá (JSON):**
```json
{
    "user_id": 2,
    "accepts_personnel": false
}
```

**Respuesta exitosa (200 OK):**
```json
{
    "exito": true,
    "success": true,
    "mensaje": "Preferencia de personal actualizada",
    "message": "Personnel preference updated",
    "data": {
        "user_id": 2,
        "accepts_personnel": false,
        "updated_at": "2024-01-01T00:00:00"
    }
}
```

## 🔐 Autenticación

Todos los endpoints deben verificar que el usuario esté autenticado. El token se enviará en el header `Authorization: Bearer <token>`.

## 📝 Notas Importantes

1. **Valores por defecto:**
   - `accepts_visitors`: `false` (no acepta visitas por defecto)
   - `accepts_personnel`: `true` (acepta personal por defecto)

2. **Validaciones:**
   - Verificar que `user_id` existe en la tabla `profiles`
   - Verificar que el usuario en `profiles` tiene `role = 'resident'` (solo residentes pueden tener preferencias)
   - Verificar que el usuario autenticado solo puede modificar sus propias preferencias (o ser admin)
   - Validar que `accepts_visitors` y `accepts_personnel` sean valores booleanos
   - Validar que `user_id` sea un número entero válido

3. **Manejo de errores:**
   - Si el `user_id` no existe: 404 Not Found
   - Si falta el `user_id` en la petición: 400 Bad Request
   - Si hay error de base de datos: 500 Internal Server Error

4. **Formato de respuesta:**
   - Usar tanto `exito`/`success` como `mensaje`/`message` para compatibilidad
   - Incluir siempre el campo `data` con la información actualizada

## 🎯 Casos de Uso

1. **Residente activa/desactiva visitas:** Se llama al endpoint PUT `/visitors` cada vez que cambia el botón
2. **Residente activa/desactiva personal:** Se llama al endpoint PUT `/personnel` cada vez que cambia el botón
3. **Cargar estado inicial:** Al abrir la app, se llama GET para obtener las preferencias actuales

## 📊 Consultas Útiles

Para consultar qué residentes aceptan visitas:
```sql
SELECT user_id, accepts_visitors, accepts_personnel 
FROM resident_preferences 
WHERE accepts_visitors = TRUE;
```

Para consultar qué residentes aceptan personal:
```sql
SELECT user_id, accepts_visitors, accepts_personnel 
FROM resident_preferences 
WHERE accepts_personnel = TRUE;
```

