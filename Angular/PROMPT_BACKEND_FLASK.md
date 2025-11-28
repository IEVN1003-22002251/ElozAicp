# Prompt para Backend Flask - Registros Pendientes

## Instrucciones para el Backend

Necesito que implementes un endpoint en Flask para manejar los registros pendientes de usuarios. Aquí están los detalles:

### 1. Tabla en Base de Datos

La tabla se llama `pending_registrations` y tiene la siguiente estructura (MySQL/MariaDB en XAMPP):

```sql
CREATE TABLE IF NOT EXISTS pending_registrations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
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

### 2. Endpoint POST para Crear Registro

**Ruta**: `/api/registrations`  
**Método**: POST  
**Content-Type**: application/json

**Datos que recibirá** (JSON):
```json
{
    "full_name": "Juan Pérez",
    "user_name": "juanperez",
    "email": "juan@example.com",
    "password": "password123",
    "phone": "1234567890",
    "role": "resident",
    "fraccionamiento_id": "1",
    "street": "Calle Principal",
    "house_number": "123",
    "status": "pending"
}
```

**Respuesta exitosa** (201 Created):
```json
{
    "exito": true,
    "success": true,
    "mensaje": "Registro creado exitosamente",
    "message": "Registration created successfully",
    "data": {
        "id": "uuid-generado",
        "full_name": "Juan Pérez",
        "user_name": "juanperez",
        "email": "juan@example.com",
        "status": "pending",
        ...
    }
}
```

**Respuesta de error** (400 Bad Request):
```json
{
    "exito": false,
    "success": false,
    "mensaje": "Error: campo requerido faltante",
    "message": "Error: missing required field"
}
```

### 3. Endpoint GET para Obtener Registros Pendientes

**Ruta**: `/api/registrations`  
**Método**: GET

**Respuesta exitosa** (200 OK):
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
            "created_at": "2024-01-15T10:30:00"
        },
        ...
    ]
}
```

### 4. Endpoint PUT para Aprobar Registro

**Ruta**: `/api/registrations/<id>/approve`  
**Método**: PUT

**Respuesta exitosa** (200 OK):
```json
{
    "success": true,
    "exito": true,
    "data": {
        "id": "uuid",
        "status": "approved",
        ...
    }
}
```

### 5. Endpoint PUT para Rechazar Registro

**Ruta**: `/api/registrations/<id>/reject`  
**Método**: PUT  
**Body** (opcional):
```json
{
    "reason": "Motivo del rechazo"
}
```

**Respuesta exitosa** (200 OK):
```json
{
    "success": true,
    "exito": true,
    "message": "Registro rechazado exitosamente"
}
```

### 6. Requisitos Técnicos

1. **Configuración de CORS**: Permite peticiones desde `http://localhost:4200`
   ```python
   from flask_cors import CORS
   CORS(app, origins=['http://localhost:4200'])
   ```

2. **Hash de Contraseñas**: Usa werkzeug.security para hashear las contraseñas antes de guardarlas
   ```python
   from werkzeug.security import generate_password_hash
   hashed_password = generate_password_hash(password)
   ```

3. **Validación de Campos**: Valida que los campos requeridos estén presentes:
   - `full_name` (requerido)
   - `email` (requerido, validar formato)
   - `password` (requerido, mínimo 6 caracteres)

4. **Manejo de Errores**: 
   - Captura errores de base de datos
   - Devuelve mensajes de error claros
   - Usa transacciones (commit/rollback)

5. **Conexión a MySQL**: Configura la conexión para XAMPP:
   ```python
   # Configuración para XAMPP
   DB_CONFIG = {
       'host': 'localhost',
       'user': 'root',  # Usuario por defecto de XAMPP
       'password': '',  # Contraseña por defecto (vacía)
       'database': 'tu_base_de_datos',
       'charset': 'utf8mb4'
   }
   ```

### 7. Ejemplo de Código Flask

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from werkzeug.security import generate_password_hash
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app, origins=['http://localhost:4200'])

# Configuración de base de datos
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'tu_base_de_datos',
    'charset': 'utf8mb4'
}

def get_db_connection():
    """Obtiene conexión a la base de datos"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error conectando a MySQL: {e}")
        return None

@app.route('/api/registrations', methods=['POST'])
def create_registration():
    """Crea un nuevo registro pendiente"""
    try:
        data = request.json
        
        # Validar campos requeridos
        if not data.get('full_name'):
            return jsonify({
                'exito': False,
                'success': False,
                'mensaje': 'El campo full_name es requerido',
                'message': 'full_name field is required'
            }), 400
        
        if not data.get('email'):
            return jsonify({
                'exito': False,
                'success': False,
                'mensaje': 'El campo email es requerido',
                'message': 'email field is required'
            }), 400
        
        if not data.get('password'):
            return jsonify({
                'exito': False,
                'success': False,
                'mensaje': 'El campo password es requerido',
                'message': 'password field is required'
            }), 400
        
        # Hash de la contraseña
        hashed_password = generate_password_hash(data['password'])
        
        # Generar UUID
        registration_id = str(uuid.uuid4())
        
        # Insertar en la base de datos
        connection = get_db_connection()
        if not connection:
            return jsonify({
                'exito': False,
                'success': False,
                'mensaje': 'Error de conexión a la base de datos',
                'message': 'Database connection error'
            }), 500
        
        cursor = connection.cursor(dictionary=True)
        
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
            registration_id,
            data.get('full_name'),
            data.get('user_name'),
            data.get('email'),
            hashed_password,
            data.get('phone'),
            data.get('role', 'resident'),
            data.get('fraccionamiento_id'),
            data.get('street'),
            data.get('house_number'),
            data.get('status', 'pending')
        )
        
        cursor.execute(query, values)
        connection.commit()
        
        # Obtener el registro creado
        cursor.execute(
            "SELECT * FROM pending_registrations WHERE id = %s",
            (registration_id,)
        )
        new_registration = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'exito': True,
            'success': True,
            'mensaje': 'Registro creado exitosamente',
            'message': 'Registration created successfully',
            'data': new_registration
        }), 201
        
    except Error as e:
        if connection:
            connection.rollback()
            connection.close()
        return jsonify({
            'exito': False,
            'success': False,
            'mensaje': f'Error en la base de datos: {str(e)}',
            'message': f'Database error: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'exito': False,
            'success': False,
            'mensaje': f'Error al procesar la solicitud: {str(e)}',
            'message': f'Error processing request: {str(e)}'
        }), 500

@app.route('/api/registrations', methods=['GET'])
def get_registrations():
    """Obtiene todos los registros pendientes"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM pending_registrations ORDER BY created_at DESC"
        )
        registrations = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        # Convertir datetime a string
        for reg in registrations:
            if reg.get('created_at'):
                reg['created_at'] = reg['created_at'].isoformat()
            if reg.get('updated_at'):
                reg['updated_at'] = reg['updated_at'].isoformat()
        
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

@app.route('/api/registrations/<id>/approve', methods=['PUT'])
def approve_registration(id):
    """Aprueba un registro pendiente"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "UPDATE pending_registrations SET status = 'approved' WHERE id = %s",
            (id,)
        )
        connection.commit()
        
        cursor.execute(
            "SELECT * FROM pending_registrations WHERE id = %s",
            (id,)
        )
        updated_registration = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        if updated_registration:
            return jsonify({
                'success': True,
                'exito': True,
                'data': updated_registration
            }), 200
        else:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Registro no encontrado'
            }), 404
        
    except Error as e:
        if connection:
            connection.rollback()
            connection.close()
        return jsonify({
            'success': False,
            'exito': False,
            'mensaje': f'Error en la base de datos: {str(e)}'
        }), 500

@app.route('/api/registrations/<id>/reject', methods=['PUT'])
def reject_registration(id):
    """Rechaza un registro pendiente"""
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
        cursor.execute(
            "UPDATE pending_registrations SET status = 'rejected' WHERE id = %s",
            (id,)
        )
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'exito': True,
            'message': 'Registro rechazado exitosamente',
            'mensaje': 'Registration rejected successfully'
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

### 8. Instalación de Dependencias

```bash
pip install flask
pip install flask-cors
pip install mysql-connector-python
pip install werkzeug
```

### 9. Verificación

Para verificar que funciona:

1. Ejecuta el servidor Flask:
   ```bash
   python app.py
   ```

2. Prueba con curl:
   ```bash
   curl -X POST http://localhost:5000/api/registrations \
     -H "Content-Type: application/json" \
     -d '{
       "full_name": "Juan Pérez",
       "user_name": "juanperez",
       "email": "juan@example.com",
       "password": "password123",
       "phone": "1234567890",
       "role": "resident",
       "fraccionamiento_id": "1",
       "street": "Calle Principal",
       "house_number": "123",
       "status": "pending"
     }'
   ```

3. Verifica en MySQL:
   ```sql
   SELECT * FROM pending_registrations;
   ```

### 10. Notas Importantes

- Ajusta `DB_CONFIG` con tu configuración de XAMPP
- Cambia `'tu_base_de_datos'` por el nombre real de tu base de datos
- Si tu usuario de MySQL tiene contraseña, agrégalo en `DB_CONFIG`
- El puerto 5000 debe estar disponible
- Asegúrate de que MySQL esté corriendo en XAMPP

