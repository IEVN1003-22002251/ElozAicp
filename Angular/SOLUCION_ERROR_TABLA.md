# Solución al Error de la Tabla pending_registrations

## 🔍 Problema Identificado

El error se debe a que:
1. La consulta SQL estaba **truncada** (cortada a la mitad)
2. `DEFAULT (UUID())` puede no funcionar correctamente en todas las versiones de MySQL/MariaDB
3. La consulta no estaba completa

## ✅ Solución

Usa esta consulta SQL completa y corregida:

```sql
CREATE TABLE IF NOT EXISTS pending_registrations (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'guard', 'resident', 'visitor') DEFAULT 'resident',
    fraccionamiento_id VARCHAR(36),
    street VARCHAR(255),
    house_number VARCHAR(50),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 📝 Cambios Realizados

1. **Eliminado `DEFAULT (UUID())`**: El ID se generará desde la aplicación (Flask), no desde la base de datos
2. **Completada la consulta**: Todos los campos están definidos correctamente
3. **Formato mejorado**: Mejor legibilidad con saltos de línea

## 🚀 Pasos para Ejecutar

1. Abre **phpMyAdmin** en XAMPP (http://localhost/phpmyadmin)
2. Selecciona tu base de datos
3. Ve a la pestaña **SQL**
4. Copia y pega la consulta completa de arriba
5. Haz clic en **Continuar** o presiona **Ctrl+Enter**

## ⚠️ Nota Importante

Si ya existe la tabla y quieres recrearla, primero elimínala:

```sql
DROP TABLE IF EXISTS pending_registrations;
```

Luego ejecuta el CREATE TABLE.

## 🔧 Generación de UUID desde Flask

Ya que removimos `DEFAULT UUID()`, el backend Flask debe generar el UUID al insertar:

```python
import uuid

# En tu código Flask, cuando insertes:
registration_id = str(uuid.uuid4())

query = """
    INSERT INTO pending_registrations (
        id, full_name, user_name, email, password, 
        phone, role, fraccionamiento_id, street, 
        house_number, status
    ) VALUES (
        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
    )
"""

values = (
    registration_id,  # UUID generado en Python
    data.get('full_name'),
    # ... resto de valores
)
```

## ✅ Verificación

Después de crear la tabla, verifica que se creó correctamente:

```sql
-- Ver estructura de la tabla
DESCRIBE pending_registrations;

-- Ver si está vacía (debe estar vacía)
SELECT * FROM pending_registrations;
```

