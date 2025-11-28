# Aprobar Registro y Crear Usuario en Profiles

## 📋 Descripción

Cuando se aprueba un registro pendiente en `pending_registrations`, se debe:
1. Cambiar el `status` a `'approved'` en `pending_registrations`
2. Crear un nuevo registro en la tabla `profiles` (y posiblemente `users` si existe separada)

## 🗄️ Estructura de Tablas

### Tabla `pending_registrations`
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabla `profiles` (según tu estructura)
```sql
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    user_name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'guard', 'resident', 'visitor') DEFAULT 'resident',
    fraccionamiento_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**NOTA:** Si tu tabla `profiles` incluye `phone` y `address`, agrégalos también.

## 🔧 Cambios en Flask - Endpoint Aprobar Registro

Aquí está el código completo del endpoint actualizado:

```python
@app.route('/api/registrations/<id>/approve', methods=['PUT'])
def approve_registration(id):
    """Aprueba un registro pendiente y crea un usuario en profiles"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # 1. Obtener el registro pendiente
        cursor.execute(
            "SELECT * FROM pending_registrations WHERE id = %s AND status = 'pending'",
            (id,)
        )
        registration = cursor.fetchone()
        
        if not registration:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Registro no encontrado o ya procesado'
            }), 404
        
        # 2. Verificar que el email no exista ya en profiles
        cursor.execute(
            "SELECT id FROM profiles WHERE email = %s",
            (registration['email'],)
        )
        existing_profile = cursor.fetchone()
        
        if existing_profile:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Ya existe un usuario con este email'
            }), 400
        
        # 3. Generar IDs para el nuevo usuario
        import uuid
        profile_id = str(uuid.uuid4())
        
        # 4. Preparar datos para profiles
        # Si el password ya está hasheado, usarlo; si no, hashearlo
        password = registration['password']
        
        # Verificar si el password está hasheado (los hashes de werkzeug empiezan con pbkdf2: o $2b$)
        if not password.startswith('pbkdf2:') and not password.startswith('$2b$') and not password.startswith('$2a$'):
            from werkzeug.security import generate_password_hash
            password = generate_password_hash(password)
        
        # Construir dirección completa si existe street y house_number
        address = None
        if registration.get('street') or registration.get('house_number'):
            address_parts = []
            if registration.get('street'):
                address_parts.append(registration['street'])
            if registration.get('house_number'):
                address_parts.append(registration['house_number'])
            address = ', '.join(address_parts)
        
        # 5. Insertar en profiles
        insert_profile_query = """
            INSERT INTO profiles (
                id, name, user_name, email, password, role, 
                fraccionamiento_id, created_at, updated_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
        """
        
        profile_values = (
            profile_id,
            registration['full_name'],  # name en profiles = full_name en pending
            registration.get('user_name'),
            registration['email'],
            password,  # Password hasheado
            registration.get('role', 'resident'),
            registration.get('fraccionamiento_id')
        )
        
        cursor.execute(insert_profile_query, profile_values)
        
        # 6. Actualizar status en pending_registrations
        cursor.execute(
            "UPDATE pending_registrations SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = %s",
            (id,)
        )
        
        # Confirmar todas las operaciones
        connection.commit()
        
        # 7. Obtener el registro actualizado de pending_registrations
        cursor.execute(
            "SELECT * FROM pending_registrations WHERE id = %s",
            (id,)
        )
        updated_registration = cursor.fetchone()
        
        # 8. Obtener el nuevo perfil creado
        cursor.execute(
            "SELECT * FROM profiles WHERE id = %s",
            (profile_id,)
        )
        new_profile = cursor.fetchone()
        
        # Convertir datetime a string para JSON
        if updated_registration:
            if updated_registration.get('created_at'):
                updated_registration['created_at'] = updated_registration['created_at'].isoformat()
            if updated_registration.get('updated_at'):
                updated_registration['updated_at'] = updated_registration['updated_at'].isoformat()
            if 'password' in updated_registration:
                del updated_registration['password']
        
        if new_profile:
            if new_profile.get('created_at'):
                new_profile['created_at'] = new_profile['created_at'].isoformat()
            if new_profile.get('updated_at'):
                new_profile['updated_at'] = new_profile['updated_at'].isoformat()
            if 'password' in new_profile:
                del new_profile['password']
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'exito': True,
            'mensaje': 'Registro aprobado y usuario creado exitosamente',
            'data': {
                'registration': updated_registration,
                'profile': new_profile
            }
        }), 200
        
    except Error as e:
        if connection:
            connection.rollback()
            connection.close()
        return jsonify({
            'success': False,
            'exito': False,
            'mensaje': f'Error en la base de datos: {str(e)}'
        }), 500
    except Exception as e:
        if connection:
            connection.rollback()
            connection.close()
        return jsonify({
            'success': False,
            'exito': False,
            'mensaje': f'Error al procesar la solicitud: {str(e)}'
        }), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
```

## 📝 Si tu tabla `profiles` tiene campos adicionales

Si tu tabla `profiles` incluye `phone` y `address`, actualiza el INSERT:

```python
# Si profiles tiene phone y address
insert_profile_query = """
    INSERT INTO profiles (
        id, name, user_name, email, password, phone, 
        address, role, fraccionamiento_id, 
        created_at, updated_at
    ) VALUES (
        %s, %s, %s, %s, %s, %s, %s, %s, %s, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
"""

profile_values = (
    profile_id,
    registration['full_name'],
    registration.get('user_name'),
    registration['email'],
    password,
    registration.get('phone'),  # Agregar phone
    address,  # Agregar address (construida arriba)
    registration.get('role', 'resident'),
    registration.get('fraccionamiento_id')
)
```

## 🔐 Cambios en SQL (si es necesario)

Si necesitas agregar campos a `profiles`, puedes ejecutar:

```sql
-- Agregar phone si no existe
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Agregar address si no existe
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS address TEXT;
```

## ✅ Verificación

Después de aprobar un registro, verifica:

1. **En `pending_registrations`:**
```sql
SELECT * FROM pending_registrations WHERE id = '<id_del_registro>';
-- status debe ser 'approved'
```

2. **En `profiles`:**
```sql
SELECT * FROM profiles WHERE email = '<email_del_registro>';
-- Debe existir un nuevo registro con los datos del registro aprobado
```

## 🚨 Notas Importantes

1. **Password**: El password debe estar hasheado antes de insertarlo en `profiles`
2. **Email único**: Verifica que no exista otro usuario con el mismo email
3. **Transacciones**: Usa commit/rollback para asegurar que ambas operaciones se ejecuten juntas
4. **Validación**: Valida que el registro esté pendiente antes de procesarlo
5. **Datos completos**: Asegúrate de mapear todos los campos correctamente entre las tablas

## 📋 Mapeo de Campos

| pending_registrations | profiles |
|----------------------|----------|
| full_name            | name     |
| user_name            | user_name|
| email                | email    |
| password             | password (hasheado) |
| phone                | phone (si existe) |
| street + house_number| address (si existe) |
| role                 | role     |
| fraccionamiento_id   | fraccionamiento_id |

## 🧪 Prueba del Endpoint

```bash
curl -X PUT http://localhost:5000/api/registrations/<id>/approve
```

Respuesta esperada:
```json
{
    "success": true,
    "exito": true,
    "mensaje": "Registro aprobado y usuario creado exitosamente",
    "data": {
        "registration": { ... },
        "profile": { ... }
    }
}
```

