# Cambios Necesarios en Flask para Registros Pendientes

## 📋 Endpoints Requeridos

### 1. GET `/api/registrations` - Obtener Registros Pendientes

Este endpoint debe devolver **solo los registros con status = 'pending'**.

**Código Flask:**
```python
@app.route('/api/registrations', methods=['GET'])
def get_registrations():
    """Obtiene todos los registros pendientes (status = 'pending')"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # IMPORTANTE: Filtrar solo registros con status = 'pending'
        cursor.execute(
            "SELECT * FROM pending_registrations WHERE status = 'pending' ORDER BY created_at DESC"
        )
        registrations = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        # Convertir datetime a string para JSON
        for reg in registrations:
            if reg.get('created_at'):
                reg['created_at'] = reg['created_at'].isoformat()
            if reg.get('updated_at'):
                reg['updated_at'] = reg['updated_at'].isoformat()
            # No devolver la contraseña
            if 'password' in reg:
                del reg['password']
        
        return jsonify({
            'success': True,
            'exito': True,
            'data': registrations
        }), 200
        
    except Error as e:
        return jsonify({
            'success': False,
            'exito': False,
            'mensaje': f'Error en la base de datos: {str(e)}'
        }), 500
```

### 2. PUT `/api/registrations/<id>/approve` - Aprobar Registro y Crear Usuario

**IMPORTANTE:** Este endpoint ahora también crea un nuevo registro en la tabla `profiles`.

**Código Flask:**
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
        
        # 3. Generar ID para el nuevo usuario
        import uuid
        profile_id = str(uuid.uuid4())
        
        # 4. Hashear password si no está hasheado
        password = registration['password']
        if not password.startswith('pbkdf2:') and not password.startswith('$2b$') and not password.startswith('$2a$'):
            from werkzeug.security import generate_password_hash
            password = generate_password_hash(password)
        
        # 5. Construir dirección completa si existe
        address = None
        if registration.get('street') or registration.get('house_number'):
            address_parts = []
            if registration.get('street'):
                address_parts.append(registration['street'])
            if registration.get('house_number'):
                address_parts.append(registration['house_number'])
            address = ', '.join(address_parts)
        
        # 6. Insertar en profiles
        # NOTA: Ajusta los campos según tu estructura de tabla profiles
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
        
        # 7. Actualizar status en pending_registrations
        cursor.execute(
            "UPDATE pending_registrations SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = %s",
            (id,)
        )
        
        # Confirmar todas las operaciones
        connection.commit()
        
        # 8. Obtener datos actualizados
        cursor.execute(
            "SELECT * FROM pending_registrations WHERE id = %s",
            (id,)
        )
        updated_registration = cursor.fetchone()
        
        cursor.execute(
            "SELECT * FROM profiles WHERE id = %s",
            (profile_id,)
        )
        new_profile = cursor.fetchone()
        
        # Convertir datetime a string y eliminar password
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

### 3. PUT `/api/registrations/<id>/reject` - Rechazar Registro

**Código Flask:**
```python
@app.route('/api/registrations/<id>/reject', methods=['PUT'])
def reject_registration(id):
    """Rechaza un registro pendiente, cambiando status a 'rejected'"""
    try:
        data = request.json or {}
        reason = data.get('reason', '')
        
        connection = get_db_connection()
        if not connection:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Verificar que el registro existe y está pendiente
        cursor.execute(
            "SELECT * FROM pending_registrations WHERE id = %s AND status = 'pending'",
            (id,)
        )
        registration = cursor.fetchone()
        
        if not registration:
            cursor.close()
            connection.close()
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Registro no encontrado o ya procesado'
            }), 404
        
        # Actualizar status a 'rejected'
        # Si necesitas guardar el motivo, puedes agregar una columna 'rejection_reason' a la tabla
        cursor.execute(
            "UPDATE pending_registrations SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = %s",
            (id,)
        )
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'exito': True,
            'message': 'Registro rechazado exitosamente',
            'mensaje': 'Registro rechazado exitosamente'
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
```

## 🔧 Función de Conexión a Base de Datos

Asegúrate de tener esta función configurada para XAMPP:

```python
import mysql.connector
from mysql.connector import Error

def get_db_connection():
    """Obtiene conexión a la base de datos MySQL en XAMPP"""
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',  # Usuario por defecto de XAMPP
            password='',  # Contraseña por defecto (vacía)
            database='tu_base_de_datos',  # Cambiar por tu base de datos
            charset='utf8mb4'
        )
        return connection
    except Error as e:
        print(f"Error conectando a MySQL: {e}")
        return None
```

## 📝 Estructura de Respuesta Esperada

### GET `/api/registrations`
```json
{
    "success": true,
    "exito": true,
    "data": [
        {
            "id": "uuid-1",
            "full_name": "Juan Pérez",
            "user_name": "juanperez",
            "email": "juan@example.com",
            "phone": "1234567890",
            "role": "resident",
            "fraccionamiento_id": "1",
            "street": "Calle Principal",
            "house_number": "123",
            "status": "pending",
            "created_at": "2024-01-15T10:30:00",
            "updated_at": "2024-01-15T10:30:00"
        }
    ]
}
```

### PUT `/api/registrations/<id>/approve`
```json
{
    "success": true,
    "exito": true,
    "mensaje": "Registro aprobado exitosamente",
    "data": {
        "id": "uuid",
        "status": "approved",
        ...
    }
}
```

### PUT `/api/registrations/<id>/reject`
```json
{
    "success": true,
    "exito": true,
    "message": "Registro rechazado exitosamente",
    "mensaje": "Registro rechazado exitosamente"
}
```

## ⚠️ Notas Importantes

1. **Filtrado**: El GET debe devolver **solo registros con status = 'pending'**
2. **Seguridad**: No devolver el campo `password` en las respuestas
3. **Validación**: Verificar que el registro existe y está pendiente antes de aprobar/rechazar
4. **Fecha**: Convertir los objetos datetime a string ISO para JSON
5. **Errores**: Manejar errores de base de datos y devolver mensajes claros

## 🧪 Pruebas

Puedes probar los endpoints con curl:

```bash
# Obtener registros pendientes
curl http://localhost:5000/api/registrations

# Aprobar registro
curl -X PUT http://localhost:5000/api/registrations/<id>/approve

# Rechazar registro
curl -X PUT http://localhost:5000/api/registrations/<id>/reject \
  -H "Content-Type: application/json" \
  -d '{"reason": "Motivo del rechazo"}'
```

