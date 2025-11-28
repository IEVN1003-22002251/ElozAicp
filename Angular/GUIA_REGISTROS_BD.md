# Guía: Cómo hacer que los nuevos registros se vean en la base de datos

## 📋 Verificación del Flujo Actual

El frontend está configurado para enviar registros a:
- **URL**: `http://localhost:5000/api/registrations`
- **Método**: POST
- **Datos enviados**: 
  - full_name
  - user_name
  - email
  - password
  - phone
  - role (siempre 'resident')
  - fraccionamiento_id
  - street
  - house_number
  - status (siempre 'pending')

## ✅ Pasos para que funcione

### 1. Verificar que el Backend esté corriendo

El backend debe estar ejecutándose en el puerto 5000:

```bash
# Si tienes un servidor Flask/Python:
python app.py
# o
flask run --port 5000
```

### 2. Verificar el Endpoint en el Backend

Debes tener un endpoint en tu backend que reciba las peticiones POST:

```python
# Ejemplo de endpoint Flask
@app.route('/api/registrations', methods=['POST'])
def create_registration():
    data = request.json
    
    # Validar datos
    required_fields = ['full_name', 'email', 'password']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'exito': False,
                'mensaje': f'Campo requerido: {field}'
            }), 400
    
    # Hash de la contraseña (importante)
    from werkzeug.security import generate_password_hash
    hashed_password = generate_password_hash(data['password'])
    
    # Insertar en la base de datos
    try:
        cursor = db.cursor()
        query = """
            INSERT INTO registrations (
                id, full_name, user_name, email, password, 
                phone, role, fraccionamiento_id, street, 
                house_number, status
            ) VALUES (
                UUID(), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
        """
        cursor.execute(query, (
            data.get('full_name'),
            data.get('user_name'),
            data.get('email'),
            hashed_password,  # Usar password hasheado
            data.get('phone'),
            data.get('role', 'resident'),
            data.get('fraccionamiento_id'),
            data.get('street'),
            data.get('house_number'),
            data.get('status', 'pending')
        ))
        db.commit()
        cursor.close()
        
        return jsonify({
            'exito': True,
            'mensaje': 'Registro creado exitosamente',
            'data': {
                'id': cursor.lastrowid,
                **data
            }
        }), 201
        
    except Exception as e:
        db.rollback()
        return jsonify({
            'exito': False,
            'mensaje': f'Error al crear registro: {str(e)}'
        }), 500
```

### 3. Verificar Conexión a la Base de Datos

Asegúrate de que tu backend esté conectado a la base de datos MySQL:

```python
import mysql.connector
from mysql.connector import Error

try:
    connection = mysql.connector.connect(
        host='localhost',
        database='aicp_db',  # Nombre de tu base de datos
        user='tu_usuario',
        password='tu_contraseña'
    )
    if connection.is_connected():
        print("Conexión a la base de datos exitosa")
except Error as e:
    print(f"Error conectando a la base de datos: {e}")
```

### 4. Verificar la Tabla en la Base de Datos

Verifica que la tabla `registrations` exista y tenga los campos correctos:

```sql
-- Ver estructura de la tabla
DESCRIBE registrations;

-- Ver registros existentes
SELECT * FROM registrations;

-- Ver solo registros pendientes
SELECT * FROM registrations WHERE status = 'pending';
```

### 5. Probar el Endpoint Manualmente

Puedes probar el endpoint directamente con curl o Postman:

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

### 6. Verificar en el Frontend

En el navegador, abre las DevTools (F12) y revisa:
- **Network tab**: Verifica que la petición POST se esté enviando
- **Console tab**: Busca errores de CORS o conexión
- Verifica que la respuesta del servidor sea exitosa

## 🔍 Solución de Problemas Comunes

### Error: "Error al conectar con el servidor"
- El backend no está corriendo
- Verifica que esté en el puerto 5000
- Verifica la URL en `src/environments/environment.ts`

### Error: "CORS policy"
- El backend necesita configurar CORS para permitir peticiones desde `http://localhost:4200`
```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app, origins=['http://localhost:4200'])
```

### Error: "Field 'xxx' doesn't have a default value"
- Verifica que todos los campos requeridos en la BD coincidan con los datos enviados
- Verifica que `password` se esté hasheando antes de guardar

### Los datos no aparecen en la BD
- Verifica que la conexión a la BD esté funcionando
- Verifica que la query INSERT esté ejecutándose correctamente
- Verifica que no haya errores de transacción (commit/rollback)
- Revisa los logs del backend

## 📝 Notas Importantes

1. **Seguridad**: Nunca guardes contraseñas en texto plano. Siempre usa hash (bcrypt, werkzeug, etc.)
2. **Validación**: Valida todos los campos en el backend, no confíes solo en el frontend
3. **Transacciones**: Usa transacciones para asegurar la integridad de los datos
4. **Errores**: Maneja todos los errores y devuelve mensajes claros al frontend

