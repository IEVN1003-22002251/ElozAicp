"""
AICP Flask Backend API
Main application entry point - MySQL (XAMPP)
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from config import config
import mysql.connector
from mysql.connector import Error
from datetime import datetime
import os
import uuid
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash

# Load environment variables from parent directory
import sys
from pathlib import Path
parent_dir = Path(__file__).parent.parent
env_path = parent_dir / '.env'
load_dotenv(dotenv_path=env_path)

app = Flask(__name__)
app.config.from_object(config['development'])

# Configure CORS
cors_origins = app.config.get('CORS_ORIGINS', ['http://localhost:4200'])
CORS(app, resources={r"/api/*": {"origins": cors_origins}})

# Database connection function
def get_connection():
    """Get MySQL database connection"""
    try:
        connection = mysql.connector.connect(
            host=app.config['MYSQL_HOST'],
            user=app.config['MYSQL_USER'],
            password=app.config['MYSQL_PASSWORD'],
            database=app.config['MYSQL_DATABASE'],
            port=app.config.get('MYSQL_PORT', 3306)
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# =====================================================
# ROOT ROUTE
# =====================================================

@app.route('/', methods=['GET'])
def index():
    """Root endpoint - API information"""
    return jsonify({
        'mensaje': 'AICP Flask API está funcionando correctamente',
        'exito': True,
        'version': '1.0.0',
        'endpoints': {
            'auth': [
                'POST /api/auth/login',
                'POST /api/auth/logout',
                'GET /api/auth/profile?user_id=xxx'
            ],
            'visitors': [
                'GET /api/visitors',
                'GET /api/visitors/<id>',
                'POST /api/visitors',
                'PUT /api/visitors/<id>',
                'DELETE /api/visitors/<id>'
            ],
            'registrations': [
                'GET /api/registrations',
                'GET /api/registrations/<id>',
                'POST /api/registrations',
                'PUT /api/registrations/<id>/approve',
                'PUT /api/registrations/<id>/reject'
            ]
        }
    }), 200

# =====================================================
# AUTHENTICATION ROUTES
# =====================================================

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email y contraseña son requeridos', 'exito': False}), 400
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Error de conexión a la base de datos', 'exito': False}), 500
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM profiles WHERE email = %s", (email,))
        profile = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not profile:
            return jsonify({'error': 'Usuario no encontrado', 'exito': False}), 401
        
        # Validate password
        if not profile.get('password') or profile['password'] != password:
            return jsonify({'error': 'Contraseña incorrecta', 'exito': False}), 401
        
        return jsonify({
            'exito': True,
            'user': {
                'id': profile['id'],
                'email': profile['email']
            },
            'profile': profile
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e), 'exito': False}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """User logout endpoint"""
    return jsonify({'mensaje': 'Sesión cerrada', 'exito': True}), 200

@app.route('/api/auth/profile', methods=['GET'])
def get_profile():
    """Get user profile"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id es requerido', 'exito': False}), 400
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Error de conexión a la base de datos', 'exito': False}), 500
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM profiles WHERE id = %s", (user_id,))
        profile = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not profile:
            return jsonify({'error': 'Perfil no encontrado', 'exito': False}), 404
        
        return jsonify({'exito': True, 'profile': profile}), 200
        
    except Exception as e:
        return jsonify({'error': str(e), 'exito': False}), 500

# =====================================================
# VISITORS ROUTES
# =====================================================

@app.route('/api/visitors', methods=['GET'])
def get_visitors():
    """Get all visitors"""
    try:
        user_id = request.args.get('user_id')
        status = request.args.get('status')
        visitor_type = request.args.get('type')
        search = request.args.get('search')
        
        conn = get_connection()
        if not conn:
            return jsonify({'mensaje': 'Error de conexión a la base de datos', 'exito': False}), 500
        
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM visitors WHERE 1=1"
        params = []
        
        if user_id:
            query += " AND created_by = %s"
            # Convertir user_id a entero para comparar con created_by (INT)
            try:
                params.append(int(user_id))
            except (ValueError, TypeError):
                params.append(user_id)
        if status:
            query += " AND status = %s"
            params.append(status)
        if visitor_type:
            query += " AND type = %s"
            params.append(visitor_type)
        if search:
            query += " AND name LIKE %s"
            params.append(f'%{search}%')
        
        cursor.execute(query, params)
        visitors = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({'visitors': visitors, 'mensaje': 'Visitantes encontrados', 'exito': True}), 200
        
    except Exception as e:
        return jsonify({'mensaje': 'Error al listar visitantes: ' + str(e), 'exito': False}), 500

@app.route('/api/visitors/<visitor_id>', methods=['GET'])
def get_visitor(visitor_id):
    """Get visitor by ID"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({'mensaje': 'Error de conexión a la base de datos', 'exito': False}), 500
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM visitors WHERE id = %s", (visitor_id,))
        visitor = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not visitor:
            return jsonify({'mensaje': 'Visitante no encontrado', 'exito': False}), 404
        
        return jsonify({'visitor': visitor, 'mensaje': 'Visitante encontrado', 'exito': True}), 200
        
    except Exception as e:
        return jsonify({'mensaje': 'Error al obtener visitante: ' + str(e), 'exito': False}), 500

@app.route('/api/visitors', methods=['POST'])
def create_visitor():
    """Create new visitor"""
    try:
        visitor_data = request.get_json()
        
        conn = get_connection()
        if not conn:
            return jsonify({'mensaje': 'Error de conexión a la base de datos', 'exito': False}), 500
        
        cursor = conn.cursor(dictionary=True)
        sql = """INSERT INTO visitors (name, email, phone, type, status, created_by, created_at)
                 VALUES (%s, %s, %s, %s, %s, %s, %s)"""
        values = (
            visitor_data.get('name'),
            visitor_data.get('email'),
            visitor_data.get('phone'),
            visitor_data.get('type', 'visitor'),
            visitor_data.get('status', 'active'),
            visitor_data.get('created_by'),
            datetime.now()
        )
        
        cursor.execute(sql, values)
        conn.commit()
        visitor_id = cursor.lastrowid
        cursor.execute("SELECT * FROM visitors WHERE id = %s", (visitor_id,))
        visitor = cursor.fetchone()
        cursor.close()
        conn.close()
        
        return jsonify({
            'mensaje': 'Visitante registrado correctamente',
            'visitor': visitor,
            'exito': True
        }), 201
        
    except Exception as e:
        return jsonify({'mensaje': 'Error: ' + str(e), 'exito': False}), 500

@app.route('/api/visitors/<visitor_id>', methods=['PUT'])
def update_visitor(visitor_id):
    """Update visitor"""
    try:
        updates = request.get_json()
        
        conn = get_connection()
        if not conn:
            return jsonify({'mensaje': 'Error de conexión a la base de datos', 'exito': False}), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # Build update query dynamically
        set_clause = []
        values = []
        for key, value in updates.items():
            if key != 'id':
                set_clause.append(f"{key} = %s")
                values.append(value)
        
        if not set_clause:
            return jsonify({'mensaje': 'No hay campos para actualizar', 'exito': False}), 400
        
        values.append(visitor_id)
        sql = f"UPDATE visitors SET {', '.join(set_clause)} WHERE id = %s"
        
        cursor.execute(sql, values)
        conn.commit()
        cursor.execute("SELECT * FROM visitors WHERE id = %s", (visitor_id,))
        visitor = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not visitor:
            return jsonify({'mensaje': 'Visitante no encontrado', 'exito': False}), 404
        
        return jsonify({
            'mensaje': 'Visitante actualizado correctamente',
            'visitor': visitor,
            'exito': True
        }), 200
        
    except Exception as e:
        return jsonify({'mensaje': 'Error: ' + str(e), 'exito': False}), 500

@app.route('/api/visitors/<visitor_id>', methods=['DELETE'])
def delete_visitor(visitor_id):
    """Delete visitor"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({'mensaje': 'Error de conexión a la base de datos', 'exito': False}), 500
        
        cursor = conn.cursor()
        cursor.execute("DELETE FROM visitors WHERE id = %s", (visitor_id,))
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'mensaje': 'Visitante eliminado correctamente', 'exito': True}), 200
        
    except Exception as e:
        return jsonify({'mensaje': 'Error: ' + str(e), 'exito': False}), 500

# =====================================================
# REGISTRATIONS ROUTES
# =====================================================

@app.route('/api/registrations', methods=['GET'])
def get_pending_registrations():
    """Obtiene todos los registros pendientes (status = 'pending')"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # IMPORTANTE: Filtrar solo registros con status = 'pending'
        cursor.execute(
            "SELECT * FROM pending_registrations WHERE status = 'pending' ORDER BY created_at DESC"
        )
        registrations = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        # Convertir datetime a string para JSON y eliminar password
        for reg in registrations:
            if reg.get('created_at'):
                reg['created_at'] = reg['created_at'].isoformat() if hasattr(reg['created_at'], 'isoformat') else str(reg['created_at'])
            if reg.get('updated_at'):
                reg['updated_at'] = reg['updated_at'].isoformat() if hasattr(reg['updated_at'], 'isoformat') else str(reg['updated_at'])
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
    except Exception as e:
        return jsonify({
            'success': False,
            'exito': False,
            'mensaje': f'Error al listar registros: {str(e)}'
        }), 500

@app.route('/api/registrations/<registration_id>', methods=['GET'])
def get_registration(registration_id):
    """Get registration by ID"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({'mensaje': 'Error de conexión a la base de datos', 'exito': False}), 500
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM pending_registrations WHERE id = %s", (registration_id,))
        registration = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not registration:
            return jsonify({'mensaje': 'Registro no encontrado', 'exito': False}), 404
        
        return jsonify({'registration': registration, 'mensaje': 'Registro encontrado', 'exito': True}), 200
        
    except Exception as e:
        return jsonify({'mensaje': 'Error al obtener registro: ' + str(e), 'exito': False}), 500

@app.route('/api/registrations', methods=['POST'])
def create_registration():
    """Create new registration request"""
    try:
        registration_data = request.get_json()
        
        # Validar campos requeridos
        if not registration_data:
            return jsonify({
                'exito': False,
                'success': False,
                'mensaje': 'Datos de registro requeridos'
            }), 400
        
        full_name = registration_data.get('full_name')
        email = registration_data.get('email')
        password = registration_data.get('password')
        
        if not full_name:
            return jsonify({
                'exito': False,
                'success': False,
                'mensaje': 'El campo full_name es requerido'
            }), 400
        
        if not email:
            return jsonify({
                'exito': False,
                'success': False,
                'mensaje': 'El campo email es requerido'
            }), 400
        
        if not password:
            return jsonify({
                'exito': False,
                'success': False,
                'mensaje': 'El campo password es requerido'
            }), 400
        
        # Validar role (debe ser uno de los valores del ENUM)
        valid_roles = ['admin', 'guard', 'resident', 'visitor']
        role = registration_data.get('role', 'resident')
        if role not in valid_roles:
            return jsonify({
                'exito': False,
                'success': False,
                'mensaje': f'El rol debe ser uno de: {", ".join(valid_roles)}'
            }), 400
        
        # Validar status (debe ser uno de los valores del ENUM)
        valid_statuses = ['pending', 'approved', 'rejected']
        status = registration_data.get('status', 'pending')
        if status not in valid_statuses:
            return jsonify({
                'exito': False,
                'success': False,
                'mensaje': f'El estado debe ser uno de: {", ".join(valid_statuses)}'
            }), 400
        
        # Generar UUID para el id
        registration_id = str(uuid.uuid4())
        
        conn = get_connection()
        if not conn:
            return jsonify({
                'exito': False,
                'success': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # Verificar si el email ya existe
        cursor.execute("SELECT id FROM pending_registrations WHERE email = %s", (email,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({
                'exito': False,
                'success': False,
                'mensaje': 'El email ya está registrado'
            }), 400
        
        # Insertar registro (incluyendo campos opcionales con UUID)
        sql = """INSERT INTO pending_registrations 
                 (id, full_name, user_name, email, password, phone, role, fraccionamiento_id, street, house_number, status, created_at)
                 VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        values = (
            registration_id,
            full_name,
            registration_data.get('user_name'),
            email,
            password,
            registration_data.get('phone'),
            role,
            registration_data.get('fraccionamiento_id'),
            registration_data.get('street'),
            registration_data.get('house_number'),
            status,
            datetime.now()
        )
        
        cursor.execute(sql, values)
        conn.commit()
        cursor.execute("SELECT * FROM pending_registrations WHERE id = %s", (registration_id,))
        registration = cursor.fetchone()
        cursor.close()
        conn.close()
        
        return jsonify({
            'exito': True,
            'success': True,
            'mensaje': 'Registro creado exitosamente',
            'data': registration
        }), 201
        
    except Error as e:
        error_msg = str(e)
        if 'Duplicate entry' in error_msg or 'UNIQUE constraint' in error_msg:
            return jsonify({
                'exito': False,
                'success': False,
                'mensaje': 'El email o nombre de usuario ya está registrado'
            }), 400
        return jsonify({
            'exito': False,
            'success': False,
            'mensaje': 'Error de base de datos: ' + error_msg
        }), 500
    except Exception as e:
        return jsonify({
            'exito': False,
            'success': False,
            'mensaje': 'Error: ' + str(e)
        }), 500

@app.route('/api/registrations/<registration_id>/approve', methods=['PUT'])
def approve_registration(registration_id):
    """Aprueba un registro pendiente y crea un usuario en profiles"""
    conn = None
    cursor = None
    
    try:
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # 1. Obtener el registro pendiente
        cursor.execute(
            "SELECT * FROM pending_registrations WHERE id = %s AND status = 'pending'",
            (registration_id,)
        )
        registration = cursor.fetchone()
        
        if not registration:
            cursor.close()
            conn.close()
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
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Ya existe un usuario con este email'
            }), 400
        
        # 3. Generar ID para el nuevo usuario (UUID)
        profile_id = str(uuid.uuid4())
        
        # 4. Preparar datos para profiles
        password = registration['password']
        
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
            password,  # Password en texto plano
            registration.get('role', 'resident'),
            registration.get('fraccionamiento_id')
        )
        
        cursor.execute(insert_profile_query, profile_values)
        
        # 6. Actualizar status en pending_registrations
        cursor.execute(
            "UPDATE pending_registrations SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = %s",
            (registration_id,)
        )
        
        # Confirmar todas las operaciones
        conn.commit()
        
        # 7. Obtener datos actualizados
        cursor.execute(
            "SELECT * FROM pending_registrations WHERE id = %s",
            (registration_id,)
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
                updated_registration['created_at'] = updated_registration['created_at'].isoformat() if hasattr(updated_registration['created_at'], 'isoformat') else str(updated_registration['created_at'])
            if updated_registration.get('updated_at'):
                updated_registration['updated_at'] = updated_registration['updated_at'].isoformat() if hasattr(updated_registration['updated_at'], 'isoformat') else str(updated_registration['updated_at'])
            if 'password' in updated_registration:
                del updated_registration['password']
        
        if new_profile:
            if new_profile.get('created_at'):
                new_profile['created_at'] = new_profile['created_at'].isoformat() if hasattr(new_profile['created_at'], 'isoformat') else str(new_profile['created_at'])
            if new_profile.get('updated_at'):
                new_profile['updated_at'] = new_profile['updated_at'].isoformat() if hasattr(new_profile['updated_at'], 'isoformat') else str(new_profile['updated_at'])
            if 'password' in new_profile:
                del new_profile['password']
        
        cursor.close()
        conn.close()
        
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
        if conn:
            conn.rollback()
        return jsonify({
            'success': False,
            'exito': False,
            'mensaje': f'Error en la base de datos: {str(e)}'
        }), 500
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({
            'success': False,
            'exito': False,
            'mensaje': f'Error al procesar la solicitud: {str(e)}'
        }), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/api/registrations/<registration_id>/reject', methods=['PUT'])
def reject_registration(registration_id):
    """Rechaza un registro pendiente, cambiando status a 'rejected'"""
    try:
        data = request.get_json() or {}
        reason = data.get('reason', '')
        
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # Verificar que el registro existe y está pendiente
        cursor.execute(
            "SELECT * FROM pending_registrations WHERE id = %s AND status = 'pending'",
            (registration_id,)
        )
        registration = cursor.fetchone()
        
        if not registration:
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Registro no encontrado o ya procesado'
            }), 404
        
        # Actualizar status a 'rejected'
        # Si hay motivo de rechazo, guardarlo en rejection_reason
        if reason:
            cursor.execute(
                "UPDATE pending_registrations SET status = 'rejected', rejection_reason = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                (reason, registration_id)
            )
        else:
            cursor.execute(
                "UPDATE pending_registrations SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                (registration_id,)
            )
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'exito': True,
            'message': 'Registro rechazado exitosamente',
            'mensaje': 'Registro rechazado exitosamente'
        }), 200
        
    except Error as e:
        if conn:
            conn.rollback()
            conn.close()
        return jsonify({
            'success': False,
            'exito': False,
            'mensaje': f'Error en la base de datos: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'exito': False,
            'mensaje': f'Error: {str(e)}'
        }), 500

# =====================================================
# ERROR HANDLERS
# =====================================================

def pagina_no_encontrada(error):
    return jsonify({'mensaje': 'La página que intentas buscar no existe...', 'exito': False}), 404

if __name__ == '__main__':
    app.config.from_object(config['development'])
    app.register_error_handler(404, pagina_no_encontrada)
    app.run(debug=True, port=5000)
