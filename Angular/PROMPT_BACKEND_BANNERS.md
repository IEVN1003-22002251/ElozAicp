# Prompt para Backend Flask - Sistema de Banners

## 📋 Descripción

Necesito que implementes endpoints en Flask para manejar un sistema de banners promocionales. Los banners se mostrarán en un carrusel en la pantalla de inicio de los residentes, y solo los administradores podrán crear, editar y gestionar estos banners.

## 🗄️ Estructura de Tabla en Base de Datos

Crea una tabla llamada `banners` con la siguiente estructura (MySQL/MariaDB en XAMPP):

```sql
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
```

**Nota:** `order` es una palabra reservada en MySQL, por eso se usa con backticks.

## 🔧 Endpoints a Implementar

### 1. GET - Obtener Banners Activos (Público)

**Ruta**: `/api/banners/active`  
**Método**: GET  
**Autenticación**: No requerida (para mostrar en el carrusel)

**Respuesta exitosa (200 OK):**
```json
{
    "exito": true,
    "success": true,
    "data": [
        {
            "id": 1,
            "title": "¿Tienes una empresa?",
            "description": "¿Quieres poner acceso privado o conoces alguna empresa que lo necesite? ¡Contáctanos!",
            "cta_text": "Toca para contactar",
            "cta_url": "https://ejemplo.com/contacto",
            "icon": null,
            "is_active": true,
            "order": 1,
            "created_at": "2024-01-15T10:00:00",
            "updated_at": "2024-01-15T10:00:00"
        },
        {
            "id": 2,
            "title": "Nuevo servicio disponible",
            "description": "Ahora puedes gestionar tus visitas desde la app móvil",
            "cta_text": "Ver más",
            "cta_url": null,
            "icon": null,
            "is_active": true,
            "order": 2,
            "created_at": "2024-01-16T10:00:00",
            "updated_at": "2024-01-16T10:00:00"
        }
    ]
}
```

**Lógica:**
- Solo devolver banners con `is_active = TRUE`
- Ordenar por el campo `order` (ascendente)
- Si no hay banners activos, devolver array vacío

### 2. GET - Obtener Todos los Banners (Admin)

**Ruta**: `/api/banners`  
**Método**: GET  
**Autenticación**: Requerida (solo admin)

**Respuesta exitosa (200 OK):**
```json
{
    "exito": true,
    "success": true,
    "data": [
        {
            "id": 1,
            "title": "¿Tienes una empresa?",
            "description": "¿Quieres poner acceso privado o conoces alguna empresa que lo necesite? ¡Contáctanos!",
            "cta_text": "Toca para contactar",
            "cta_url": "https://ejemplo.com/contacto",
            "icon": null,
            "is_active": true,
            "order": 1,
            "created_at": "2024-01-15T10:00:00",
            "updated_at": "2024-01-15T10:00:00"
        },
        {
            "id": 2,
            "title": "Banner inactivo",
            "description": "Este banner está desactivado",
            "cta_text": null,
            "cta_url": null,
            "icon": null,
            "is_active": false,
            "order": 0,
            "created_at": "2024-01-16T10:00:00",
            "updated_at": "2024-01-16T10:00:00"
        }
    ]
}
```

**Lógica:**
- Devolver TODOS los banners (activos e inactivos)
- Ordenar por `order` (ascendente)
- Verificar que el usuario sea admin

### 3. GET - Obtener un Banner por ID (Admin)

**Ruta**: `/api/banners/<id>`  
**Método**: GET  
**Autenticación**: Requerida (solo admin)

**Respuesta exitosa (200 OK):**
```json
{
    "exito": true,
    "success": true,
    "data": {
        "id": 1,
        "title": "¿Tienes una empresa?",
        "description": "¿Quieres poner acceso privado o conoces alguna empresa que lo necesite? ¡Contáctanos!",
        "cta_text": "Toca para contactar",
        "cta_url": "https://ejemplo.com/contacto",
        "icon": null,
        "is_active": true,
        "order": 1,
        "created_at": "2024-01-15T10:00:00",
        "updated_at": "2024-01-15T10:00:00"
    }
}
```

**Respuesta si no existe (404 Not Found):**
```json
{
    "exito": false,
    "success": false,
    "mensaje": "Banner no encontrado",
    "message": "Banner not found"
}
```

### 4. POST - Crear Nuevo Banner (Admin)

**Ruta**: `/api/banners`  
**Método**: POST  
**Autenticación**: Requerida (solo admin)  
**Content-Type**: application/json

**Datos que recibirá (JSON):**
```json
{
    "title": "Nuevo banner promocional",
    "description": "Descripción del banner promocional",
    "cta_text": "Haz clic aquí",
    "cta_url": "https://ejemplo.com",
    "icon": null,
    "is_active": true,
    "order": 1
}
```

**Campos requeridos:**
- `title` (string, requerido)
- `description` (string, requerido)

**Campos opcionales:**
- `cta_text` (string)
- `cta_url` (string, debe ser URL válida si se proporciona)
- `icon` (string, SVG path)
- `is_active` (boolean, default: true)
- `order` (integer, default: 0)

**Respuesta exitosa (201 Created):**
```json
{
    "exito": true,
    "success": true,
    "mensaje": "Banner creado correctamente",
    "message": "Banner created successfully",
    "data": {
        "id": 3,
        "title": "Nuevo banner promocional",
        "description": "Descripción del banner promocional",
        "cta_text": "Haz clic aquí",
        "cta_url": "https://ejemplo.com",
        "icon": null,
        "is_active": true,
        "order": 1,
        "created_at": "2024-01-17T10:00:00",
        "updated_at": "2024-01-17T10:00:00"
    }
}
```

### 5. PUT - Actualizar Banner (Admin)

**Ruta**: `/api/banners/<id>`  
**Método**: PUT  
**Autenticación**: Requerida (solo admin)  
**Content-Type**: application/json

**Datos que recibirá (JSON):**
```json
{
    "title": "Banner actualizado",
    "description": "Nueva descripción",
    "cta_text": "Nuevo texto",
    "cta_url": "https://nuevo-ejemplo.com",
    "is_active": false,
    "order": 2
}
```

**Respuesta exitosa (200 OK):**
```json
{
    "exito": true,
    "success": true,
    "mensaje": "Banner actualizado correctamente",
    "message": "Banner updated successfully",
    "data": {
        "id": 1,
        "title": "Banner actualizado",
        "description": "Nueva descripción",
        "cta_text": "Nuevo texto",
        "cta_url": "https://nuevo-ejemplo.com",
        "icon": null,
        "is_active": false,
        "order": 2,
        "created_at": "2024-01-15T10:00:00",
        "updated_at": "2024-01-17T11:00:00"
    }
}
```

### 6. PUT - Activar/Desactivar Banner (Admin)

**Ruta**: `/api/banners/<id>/status`  
**Método**: PUT  
**Autenticación**: Requerida (solo admin)  
**Content-Type**: application/json

**Datos que recibirá (JSON):**
```json
{
    "is_active": false
}
```

**Respuesta exitosa (200 OK):**
```json
{
    "exito": true,
    "success": true,
    "mensaje": "Estado del banner actualizado",
    "message": "Banner status updated",
    "data": {
        "id": 1,
        "is_active": false,
        "updated_at": "2024-01-17T11:00:00"
    }
}
```

### 7. DELETE - Eliminar Banner (Admin)

**Ruta**: `/api/banners/<id>`  
**Método**: DELETE  
**Autenticación**: Requerida (solo admin)

**Respuesta exitosa (200 OK):**
```json
{
    "exito": true,
    "success": true,
    "mensaje": "Banner eliminado correctamente",
    "message": "Banner deleted successfully"
}
```

## 🔐 Autenticación y Autorización

### Endpoints Públicos (sin autenticación):
- `GET /api/banners/active` - Para mostrar en el carrusel

### Endpoints Admin (requieren autenticación y rol admin):
- `GET /api/banners` - Listar todos
- `GET /api/banners/<id>` - Obtener uno
- `POST /api/banners` - Crear
- `PUT /api/banners/<id>` - Actualizar
- `PUT /api/banners/<id>/status` - Cambiar estado
- `DELETE /api/banners/<id>` - Eliminar

**Verificación de Admin:**
```python
# Pseudocódigo
if user.role != 'admin':
    return jsonify({
        "exito": false,
        "mensaje": "No autorizado. Se requiere rol de administrador"
    }), 403
```

## 📝 Validaciones

1. **Al crear/actualizar:**
   - `title`: Requerido, máximo 255 caracteres
   - `description`: Requerido, texto no vacío
   - `cta_url`: Si se proporciona, debe ser una URL válida
   - `order`: Debe ser un número entero >= 0
   - `is_active`: Debe ser boolean

2. **Al eliminar:**
   - Verificar que el banner existe
   - No hay validaciones adicionales (se puede eliminar cualquier banner)

## 🎯 Casos de Uso

1. **Admin crea un nuevo banner:**
   - POST `/api/banners` con los datos del banner
   - El banner se crea con `is_active = true` por defecto

2. **Admin desactiva un banner temporalmente:**
   - PUT `/api/banners/<id>/status` con `is_active = false`
   - El banner deja de aparecer en el carrusel

3. **Residente abre la app:**
   - GET `/api/banners/active` se llama automáticamente
   - Solo se muestran banners activos, ordenados por `order`

4. **Admin reordena banners:**
   - PUT `/api/banners/<id>` actualizando el campo `order`
   - Los banners se muestran en el orden especificado

## 📊 Consultas Útiles

### Obtener banners activos ordenados:
```sql
SELECT * FROM banners 
WHERE is_active = TRUE 
ORDER BY `order` ASC;
```

### Contar banners activos:
```sql
SELECT COUNT(*) FROM banners WHERE is_active = TRUE;
```

### Obtener el siguiente número de orden:
```sql
SELECT COALESCE(MAX(`order`), 0) + 1 AS next_order FROM banners;
```

## ⚠️ Notas Importantes

1. **Campo `order`:**
   - Se usa para ordenar los banners en el carrusel
   - Banners con `order` menor aparecen primero
   - Puede haber múltiples banners con el mismo `order` (se ordenarán por `id`)

2. **Campo `is_active`:**
   - Solo banners con `is_active = TRUE` aparecen en el carrusel público
   - Los admins pueden ver todos los banners (activos e inactivos)

3. **Campo `cta_url`:**
   - Si se proporciona, al hacer clic en el banner se abre esta URL
   - Si es `null`, el banner no tiene acción al hacer clic

4. **Campo `icon`:**
   - Puede almacenar un SVG path para un icono personalizado
   - Si es `null`, se usa un icono por defecto (casa)

5. **Formato de respuesta:**
   - Usar tanto `exito`/`success` como `mensaje`/`message` para compatibilidad
   - Incluir siempre el campo `data` con la información


