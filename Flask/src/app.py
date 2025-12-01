"""
AICP Flask Backend API
Main application entry point - MySQL (XAMPP)
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from config import config
import mysql.connector
from mysql.connector import Error
from datetime import datetime, date, timedelta, time
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

# Configure CORS - Permite todas las peticiones desde el frontend
cors_origins = app.config.get('CORS_ORIGINS', ['http://localhost:4200'])
# Configuración más permisiva para desarrollo
CORS(app, 
     origins=cors_origins,
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"],
     supports_credentials=True,
     max_age=3600)

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

# Helper function to serialize visitor data for JSON
def serialize_visitor_for_json(visitor):
    """Convert datetime, date, and timedelta objects to strings for JSON serialization"""
    if not visitor:
        return visitor
    
    serialized = {}
    for key, value in visitor.items():
        if value is None:
            serialized[key] = None
        elif isinstance(value, datetime):
            serialized[key] = value.isoformat()
        elif isinstance(value, date):
            serialized[key] = value.isoformat()
        elif isinstance(value, timedelta):
            # Convert timedelta to HH:MM:SS format
            total_seconds = int(value.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            serialized[key] = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        else:
            serialized[key] = value
    return serialized

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
        # Obtener perfil con nombre del fraccionamiento si existe la tabla
        try:
            query = """
                SELECT 
                    p.*,
                    f.name as fraccionamiento_name
                FROM profiles p
                LEFT JOIN fraccionamientos f ON p.fraccionamiento_id = f.id
                WHERE p.id = %s
            """
            cursor.execute(query, (user_id,))
        except Exception:
            # Si no existe la tabla fraccionamientos, solo obtener el perfil
            cursor.execute("SELECT * FROM profiles WHERE id = %s", (user_id,))
        profile = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not profile:
            return jsonify({'error': 'Perfil no encontrado', 'exito': False}), 404
        
        return jsonify({'exito': True, 'profile': profile}), 200
        
    except Exception as e:
        return jsonify({'error': str(e), 'exito': False}), 500

@app.route('/api/auth/resident-address', methods=['GET'])
def get_resident_address():
    """Get resident address from pending_registrations based on email"""
    try:
        email = request.args.get('email')
        if not email:
            return jsonify({'mensaje': 'email es requerido', 'exito': False}), 400
        
        conn = get_connection()
        if not conn:
            return jsonify({'mensaje': 'Error de conexión a la base de datos', 'exito': False}), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # Buscar la dirección en pending_registrations (primero en aprobados, luego en cualquier registro)
        cursor.execute(
            "SELECT street, house_number FROM pending_registrations WHERE email = %s AND status = 'approved' ORDER BY created_at DESC LIMIT 1",
            (email,)
        )
        pending_reg = cursor.fetchone()
        
        if not pending_reg:
            cursor.execute(
                "SELECT street, house_number FROM pending_registrations WHERE email = %s ORDER BY created_at DESC LIMIT 1",
                (email,)
            )
            pending_reg = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if pending_reg:
            address_parts = []
            if pending_reg.get('street'):
                address_parts.append(pending_reg['street'])
            if pending_reg.get('house_number'):
                address_parts.append(pending_reg['house_number'])
            address = ', '.join(address_parts) if address_parts else None
            
            return jsonify({
                'exito': True,
                'address': address,
                'street': pending_reg.get('street', ''),
                'house_number': pending_reg.get('house_number', ''),
                'mensaje': 'Dirección encontrada'
            }), 200
        else:
            return jsonify({
                'exito': False,
                'address': None,
                'street': '',
                'house_number': '',
                'mensaje': 'No se encontró dirección para este email'
            }), 404
        
    except Exception as e:
        return jsonify({'mensaje': 'Error: ' + str(e), 'exito': False}), 500

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
        
        # Query base para obtener visitantes con JOIN a profiles para obtener el email
        query = """
            SELECT 
                v.*,
                p.email as resident_email
            FROM visitors v
            LEFT JOIN profiles p ON v.created_by = p.id
            WHERE 1=1
        """
        params = []
        
        if user_id:
            query += " AND v.created_by = %s"
            # Convertir user_id a entero para comparar con created_by (INT)
            try:
                params.append(int(user_id))
            except (ValueError, TypeError):
                params.append(user_id)
        if status:
            query += " AND v.status = %s"
            params.append(status)
        if visitor_type:
            query += " AND v.type = %s"
            params.append(visitor_type)
        if search:
            query += " AND v.name LIKE %s"
            params.append(f'%{search}%')
        
        # Ordenar por fecha de creación descendente (más nuevos primero)
        query += " ORDER BY v.created_at DESC"
        
        cursor.execute(query, params)
        visitors = cursor.fetchall()
        
        # Obtener direcciones desde pending_registrations usando el email del perfil
        for visitor in visitors:
            visitor['address'] = None
            if visitor.get('resident_email'):
                try:
                    # Buscar la dirección en pending_registrations usando el email del residente
                    # Primero intentamos buscar en registros aprobados, luego en cualquier registro
                    cursor.execute(
                        "SELECT street, house_number FROM pending_registrations WHERE email = %s AND status = 'approved' ORDER BY created_at DESC LIMIT 1",
                        (visitor['resident_email'],)
                    )
                    pending_reg = cursor.fetchone()
                    
                    # Si no encontramos en aprobados, buscar en cualquier registro con ese email
                    if not pending_reg:
                        cursor.execute(
                            "SELECT street, house_number FROM pending_registrations WHERE email = %s ORDER BY created_at DESC LIMIT 1",
                            (visitor['resident_email'],)
                        )
                        pending_reg = cursor.fetchone()
                    
                    if pending_reg:
                        address_parts = []
                        if pending_reg.get('street'):
                            address_parts.append(pending_reg['street'])
                        if pending_reg.get('house_number'):
                            address_parts.append(pending_reg['house_number'])
                        visitor['address'] = ', '.join(address_parts) if address_parts else None
                        visitor['street'] = pending_reg.get('street')
                        visitor['house_number'] = pending_reg.get('house_number')
                except Exception as e:
                    # Si hay error, simplemente dejar address como None
                    visitor['address'] = None
                    print(f"Error obteniendo dirección para visitante {visitor.get('id')}: {str(e)}")
        
        # Convertir objetos datetime, date y timedelta a strings para JSON
        serialized_visitors = []
        for visitor in visitors:
            serialized_visitors.append(serialize_visitor_for_json(visitor))
        
        cursor.close()
        conn.close()
        
        return jsonify({'visitors': serialized_visitors, 'mensaje': 'Visitantes encontrados', 'exito': True}), 200
        
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
        
        # Convertir objetos datetime, date y timedelta a strings para JSON
        if visitor:
            visitor = serialize_visitor_for_json(visitor)
        
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
        
        # Si es un evento, incluir los campos de evento
        is_event = visitor_data.get('type') == 'event'
        if is_event:
            sql = """INSERT INTO visitors (name, email, phone, type, status, created_by, created_at, eventDate, eventTime, numberOfGuests, eventLocation)
                     VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
            values = (
                visitor_data.get('name'),
                visitor_data.get('email'),
                visitor_data.get('phone'),
                visitor_data.get('type', 'visitor'),
                visitor_data.get('status', 'active'),
                visitor_data.get('created_by'),
                datetime.now(),
                visitor_data.get('eventDate') if visitor_data.get('eventDate') else None,
                visitor_data.get('eventTime') if visitor_data.get('eventTime') else None,
                visitor_data.get('numberOfGuests') if visitor_data.get('numberOfGuests') else None,
                visitor_data.get('eventLocation') if visitor_data.get('eventLocation') else None
            )
        else:
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
        
        # Si es un visitante de "solo una vez", generar el QR automáticamente
        if visitor.get('type') == 'one-time':
            try:
                # Generar QR directamente aquí
                import json
                import urllib.parse
                from datetime import timedelta
                
                # Obtener información del residente si existe
                resident_address = None
                resident_street = None
                resident_house_number = None
                
                if visitor.get('created_by'):
                    cursor.execute(
                        "SELECT p.email FROM profiles p WHERE p.id = %s",
                        (visitor['created_by'],)
                    )
                    resident_profile = cursor.fetchone()
                    if resident_profile and resident_profile.get('email'):
                        cursor.execute(
                            "SELECT street, house_number FROM pending_registrations WHERE email = %s AND status = 'approved' ORDER BY created_at DESC LIMIT 1",
                            (resident_profile['email'],)
                        )
                        pending_reg = cursor.fetchone()
                        if not pending_reg:
                            cursor.execute(
                                "SELECT street, house_number FROM pending_registrations WHERE email = %s ORDER BY created_at DESC LIMIT 1",
                                (resident_profile['email'],)
                            )
                            pending_reg = cursor.fetchone()
                        if pending_reg:
                            resident_street = pending_reg.get('street')
                            resident_house_number = pending_reg.get('house_number')
                            address_parts = []
                            if resident_street:
                                address_parts.append(resident_street)
                            if resident_house_number:
                                address_parts.append(resident_house_number)
                            resident_address = ', '.join(address_parts) if address_parts else None
                
                # Calcular expiración (24 horas desde la creación)
                visitor_created_at = visitor.get('created_at')
                expiration_timestamp = None
                if visitor_created_at:
                    try:
                        if isinstance(visitor_created_at, str):
                            visitor_created_at = datetime.fromisoformat(visitor_created_at.replace('Z', '+00:00'))
                        expiration_timestamp = (visitor_created_at + timedelta(hours=24)).isoformat()
                    except:
                        expiration_timestamp = (datetime.now() + timedelta(hours=24)).isoformat()
                
                # Crear objeto QR
                qr_data_object = {
                    'type': 'one-time',
                    'visitor_id': visitor['id'],
                    'visitor_name': visitor['name'],
                    'resident_name': '',
                    'resident_address': resident_address or '',
                    'resident_street': resident_street or '',
                    'resident_house_number': resident_house_number or '',
                    'timestamp': datetime.now().isoformat(),
                    'created_at': visitor.get('created_at').isoformat() if hasattr(visitor.get('created_at'), 'isoformat') else (visitor.get('created_at') if visitor.get('created_at') else datetime.now().isoformat()),
                    'expires_at': expiration_timestamp
                }
                
                qr_data_string = json.dumps(qr_data_object)
                qr_code_url = f"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data={urllib.parse.quote(qr_data_string)}"
                
                # Guardar el QR en la base de datos
                cursor.execute(
                    "UPDATE visitors SET codigo_qr = %s WHERE id = %s",
                    (qr_code_url, visitor_id)
                )
                conn.commit()
                
                # Obtener el visitante actualizado
                cursor.execute("SELECT * FROM visitors WHERE id = %s", (visitor_id,))
                visitor = cursor.fetchone()
            except Exception as qr_error:
                print(f"Error generando QR automático para visitante de solo una vez: {str(qr_error)}")
                # Continuar sin QR si hay error
        
        # Convertir objetos datetime, date y timedelta a strings para JSON
        visitor = serialize_visitor_for_json(visitor)
        
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
        
        # Mapeo de nombres de campos (camelCase a snake_case si es necesario)
        # Por ahora, los campos se guardan con camelCase directamente
        # Si la BD usa snake_case, aquí se mapearían
        
        # Build update query dynamically
        set_clause = []
        values = []
        for key, value in updates.items():
            if key != 'id':
                # Los campos eventDate, eventTime, numberOfGuests se guardan tal cual
                # Si la BD requiere snake_case, descomentar las siguientes líneas:
                # field_mapping = {
                #     'eventDate': 'eventDate',  # o 'event_date' si la BD usa snake_case
                #     'eventTime': 'eventTime',  # o 'event_time' si la BD usa snake_case
                #     'numberOfGuests': 'numberOfGuests'  # o 'number_of_guests' si la BD usa snake_case
                # }
                # db_field = field_mapping.get(key, key)
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
        
        # Convertir objetos datetime, date y timedelta a strings para JSON
        if visitor:
            visitor = serialize_visitor_for_json(visitor)
        
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

@app.route('/api/visitors/<visitor_id>/generate-qr', methods=['POST'])
def generate_visitor_qr(visitor_id):
    """Generate QR code for a visitor"""
    try:
        import json
        from datetime import datetime
        
        conn = get_connection()
        if not conn:
            return jsonify({'mensaje': 'Error de conexión a la base de datos', 'exito': False}), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # Obtener información del visitante con JOIN para obtener datos del residente
        query = """
            SELECT 
                v.*,
                p.name as resident_name,
                p.email as resident_email
            FROM visitors v
            LEFT JOIN profiles p ON v.created_by = p.id
            WHERE v.id = %s
        """
        cursor.execute(query, (visitor_id,))
        visitor = cursor.fetchone()
        
        if not visitor:
            cursor.close()
            conn.close()
            return jsonify({'mensaje': 'Visitante no encontrado', 'exito': False}), 404
        
        # Verificar que sea un visitante frecuente o de solo una vez
        visitor_type = visitor.get('type')
        if visitor_type not in ['visitor', 'one-time']:
            cursor.close()
            conn.close()
            return jsonify({'mensaje': 'Solo se pueden generar códigos QR para visitantes frecuentes o de solo una vez', 'exito': False}), 400
        
        # Obtener la dirección del residente desde pending_registrations
        resident_address = None
        resident_street = None
        resident_house_number = None
        
        if visitor.get('resident_email'):
            try:
                # Buscar la dirección en pending_registrations
                cursor.execute(
                    "SELECT street, house_number FROM pending_registrations WHERE email = %s AND status = 'approved' ORDER BY created_at DESC LIMIT 1",
                    (visitor['resident_email'],)
                )
                pending_reg = cursor.fetchone()
                
                # Si no encontramos en aprobados, buscar en cualquier registro
                if not pending_reg:
                    cursor.execute(
                        "SELECT street, house_number FROM pending_registrations WHERE email = %s ORDER BY created_at DESC LIMIT 1",
                        (visitor['resident_email'],)
                    )
                    pending_reg = cursor.fetchone()
                
                if pending_reg:
                    resident_street = pending_reg.get('street')
                    resident_house_number = pending_reg.get('house_number')
                    address_parts = []
                    if resident_street:
                        address_parts.append(resident_street)
                    if resident_house_number:
                        address_parts.append(resident_house_number)
                    resident_address = ', '.join(address_parts) if address_parts else None
            except Exception as e:
                print(f"Error obteniendo dirección para QR: {str(e)}")
                resident_address = None
        
        # Obtener la fecha de creación del visitante para calcular expiración
        visitor_created_at = visitor.get('created_at')
        expiration_timestamp = None
        if visitor_type == 'one-time' and visitor_created_at:
            # Para visitantes de solo una vez, el QR expira 24 horas después de la creación
            from datetime import timedelta
            try:
                if isinstance(visitor_created_at, str):
                    # Intentar parsear diferentes formatos de fecha
                    try:
                        visitor_created_at = datetime.fromisoformat(visitor_created_at.replace('Z', '+00:00'))
                    except:
                        from dateutil import parser
                        visitor_created_at = parser.parse(visitor_created_at)
                elif isinstance(visitor_created_at, datetime):
                    pass  # Ya es un datetime
                else:
                    visitor_created_at = datetime.now()
                
                expiration_timestamp = (visitor_created_at + timedelta(hours=24)).isoformat()
            except Exception as e:
                print(f"Error calculando expiración: {str(e)}")
                # Si hay error, usar fecha actual + 24 horas
                expiration_timestamp = (datetime.now() + timedelta(hours=24)).isoformat()
        
        # Crear objeto SIMPLE para el QR (solo datos esenciales para facilitar el escaneo)
        qr_data_object = {
            't': visitor_type,  # 'visitor' o 'one-time' (abreviado)
            'id': visitor['id']  # Solo el ID del visitante
        }
        
        # Convertir a JSON string para el QR
        qr_data_string = json.dumps(qr_data_object)
        
        # Generar URL del QR code usando API externa con tamaño más grande para mejor escaneo
        import urllib.parse
        qr_code_url = f"https://api.qrserver.com/v1/create-qr-code/?size=400x400&data={urllib.parse.quote(qr_data_string)}"
        
        # Guardar el código QR en la base de datos
        cursor.execute(
            "UPDATE visitors SET codigo_qr = %s WHERE id = %s",
            (qr_code_url, visitor_id)
        )
        conn.commit()
        
        # Obtener el visitante actualizado
        cursor.execute("SELECT * FROM visitors WHERE id = %s", (visitor_id,))
        updated_visitor = cursor.fetchone()
        
        # Convertir objetos datetime, date y timedelta a strings para JSON
        if updated_visitor:
            updated_visitor = serialize_visitor_for_json(updated_visitor)
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'mensaje': 'Código QR generado correctamente',
            'visitor': updated_visitor,
            'qr_code_url': qr_code_url,
            'qr_data': qr_data_string,
            'exito': True
        }), 200
        
    except Exception as e:
        return jsonify({'mensaje': 'Error al generar código QR: ' + str(e), 'exito': False}), 500

@app.route('/api/visitors/decode-qr', methods=['POST'])
def decode_visitor_qr():
    """Decode QR code data - Solo para admins"""
    try:
        import json
        
        data = request.get_json()
        qr_data_string = data.get('qr_data')
        
        if not qr_data_string:
            return jsonify({'mensaje': 'Datos del QR no proporcionados', 'exito': False}), 400
        
        # Decodificar el JSON del QR
        # Soporta dos formatos:
        # 1. Formato simplificado: {'t': 'visitor', 'id': 123}
        # 2. Formato completo: {'type': 'resident', 'user_id': 123, ...}
        try:
            qr_data = json.loads(qr_data_string)
        except json.JSONDecodeError:
            return jsonify({'mensaje': 'Formato de QR inválido', 'exito': False}), 400
        
        # Obtener el ID y tipo del QR (soporta ambos formatos)
        visitor_id = qr_data.get('id') or qr_data.get('user_id')
        qr_type = qr_data.get('t') or qr_data.get('type')  # Soporta 't' (abreviado) y 'type' (completo)
        
        if not visitor_id:
            return jsonify({'mensaje': 'ID no encontrado en el QR: falta información', 'exito': False}), 400
        
        # Verificar que sea un QR válido (visitante, one-time, evento o residente)
        valid_types = ['visitor', 'one-time', 'event', 'resident']
        if qr_type not in valid_types:
            return jsonify({'mensaje': f'Código QR inválido: tipo "{qr_type}" no reconocido. Tipos válidos: {", ".join(valid_types)}', 'exito': False}), 400
        
        # Si es un QR de residente, buscar en la tabla profiles
        if qr_type == 'resident':
            conn = get_connection()
            if not conn:
                return jsonify({'mensaje': 'Error de conexión a la base de datos', 'exito': False}), 500
            
            cursor = conn.cursor(dictionary=True)
            
            # Obtener información del residente desde profiles
            # También intentar obtener dirección desde pending_registrations si está disponible
            query = """
                SELECT 
                    p.*,
                    f.name as fraccionamiento_name
                FROM profiles p
                LEFT JOIN fraccionamientos f ON p.fraccionamiento_id = f.id
                WHERE p.id = %s
            """
            cursor.execute(query, (visitor_id,))
            profile = cursor.fetchone()
            
            if not profile:
                cursor.close()
                conn.close()
                return jsonify({'mensaje': 'Residente no encontrado', 'exito': False}), 404
            
            # Intentar obtener dirección desde pending_registrations o usar campos del profile
            resident_address = None
            resident_street = None
            resident_house_number = None
            
            # Primero intentar obtener desde pending_registrations si hay email
            if profile.get('email'):
                try:
                    cursor.execute(
                        "SELECT street, house_number FROM pending_registrations WHERE email = %s AND status = 'approved' ORDER BY created_at DESC LIMIT 1",
                        (profile['email'],)
                    )
                    pending_reg = cursor.fetchone()
                    
                    if not pending_reg:
                        cursor.execute(
                            "SELECT street, house_number FROM pending_registrations WHERE email = %s ORDER BY created_at DESC LIMIT 1",
                            (profile['email'],)
                        )
                        pending_reg = cursor.fetchone()
                    
                    if pending_reg:
                        resident_street = pending_reg.get('street')
                        resident_house_number = pending_reg.get('house_number')
                except Exception as e:
                    print(f"Error obteniendo dirección del residente desde pending_registrations: {str(e)}")
            
            # Si no se encontró en pending_registrations, usar los campos directos del profile
            if not resident_street and not resident_house_number:
                resident_street = profile.get('street')
                resident_house_number = profile.get('house_number')
            
            # Construir la dirección completa
            if resident_street or resident_house_number:
                address_parts = []
                if resident_street:
                    address_parts.append(resident_street)
                if resident_house_number:
                    address_parts.append(resident_house_number)
                resident_address = ', '.join(address_parts) if address_parts else None
            
            cursor.close()
            conn.close()
            
            # Retornar información completa del residente
            return jsonify({
                'mensaje': 'QR de residente decodificado correctamente',
                'qr_data': qr_data,
                'visitor_info': {
                    'visitor_id': profile['id'],
                    'visitor_name': profile.get('name') or profile.get('user_name') or '',
                    'visitor_type': 'resident',
                    'resident_name': profile.get('name') or profile.get('user_name') or '',
                    'resident_user_name': profile.get('user_name') or '',
                    'resident_email': profile.get('email') or '',
                    'resident_phone': profile.get('phone') or '',
                    'resident_address': resident_address or '',
                    'resident_street': resident_street or profile.get('street') or '',
                    'resident_house_number': resident_house_number or profile.get('house_number') or '',
                    'fraccionamiento_id': profile.get('fraccionamiento_id') or '',
                    'fraccionamiento_name': profile.get('fraccionamiento_name') or '',
                    'role': profile.get('role') or 'resident',
                    'timestamp': profile.get('created_at').isoformat() if profile.get('created_at') and hasattr(profile.get('created_at'), 'isoformat') else (profile.get('created_at') if profile.get('created_at') else '')
                },
                'exito': True
            }), 200
        
        # Obtener información completa del visitante/evento desde la base de datos
        conn = get_connection()
        if not conn:
            return jsonify({'mensaje': 'Error de conexión a la base de datos', 'exito': False}), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # Obtener información del visitante/evento con JOIN para obtener datos del residente
        query = """
            SELECT 
                v.*,
                v.eventLocation as eventLocation,
                p.name as resident_name,
                p.email as resident_email
            FROM visitors v
            LEFT JOIN profiles p ON v.created_by = p.id
            WHERE v.id = %s
        """
        cursor.execute(query, (visitor_id,))
        visitor = cursor.fetchone()
        
        if not visitor:
            cursor.close()
            conn.close()
            return jsonify({'mensaje': 'Visitante o evento no encontrado', 'exito': False}), 404
        
        # Si es un evento, retornar información del evento
        if qr_type == 'event':
            # Obtener la dirección del residente si el lugar es "domicilio"
            # Intentar obtener eventLocation de diferentes formas posibles (MySQL puede devolverlo con diferentes nombres)
            event_location = visitor.get('eventLocation') or visitor.get('eventlocation') or visitor.get('event_location') or None
            resident_address = None
            if event_location == 'domicilio' and visitor.get('resident_email'):
                try:
                    cursor.execute(
                        "SELECT street, house_number FROM pending_registrations WHERE email = %s AND status = 'approved' ORDER BY created_at DESC LIMIT 1",
                        (visitor['resident_email'],)
                    )
                    pending_reg = cursor.fetchone()
                    
                    if not pending_reg:
                        cursor.execute(
                            "SELECT street, house_number FROM pending_registrations WHERE email = %s ORDER BY created_at DESC LIMIT 1",
                            (visitor['resident_email'],)
                        )
                        pending_reg = cursor.fetchone()
                    
                    if pending_reg:
                        address_parts = []
                        if pending_reg.get('street'):
                            address_parts.append(pending_reg['street'])
                        if pending_reg.get('house_number'):
                            address_parts.append(pending_reg['house_number'])
                        resident_address = ', '.join(address_parts) if address_parts else None
                except Exception as e:
                    print(f"Error obteniendo dirección para evento: {str(e)}")
                    resident_address = None
            
            # Asegurar que event_location tenga un valor (puede ser None si el evento fue creado antes de agregar el campo)
            final_event_location = event_location or visitor.get('eventLocation') or visitor.get('eventlocation') or visitor.get('event_location') or None
            
            cursor.close()
            conn.close()
            return jsonify({
                'mensaje': 'QR de evento decodificado correctamente',
                'qr_data': qr_data,
                'visitor_info': {
                    'visitor_id': visitor['id'],
                    'visitor_name': visitor.get('name', ''),
                    'visitor_type': 'event',
                    'event_name': visitor.get('name', ''),
                    'event_date': visitor.get('eventDate', ''),
                    'event_time': visitor.get('eventTime', ''),
                    'number_of_guests': visitor.get('numberOfGuests', ''),
                    'event_location': final_event_location or '',
                    'resident_name': visitor.get('resident_name', ''),
                    'resident_address': resident_address or '',
                    'timestamp': visitor.get('created_at').isoformat() if visitor.get('created_at') and hasattr(visitor.get('created_at'), 'isoformat') else (visitor.get('created_at') if visitor.get('created_at') else '')
                },
                'exito': True
            }), 200
        
        # Obtener la dirección del residente desde pending_registrations
        resident_address = None
        resident_street = None
        resident_house_number = None
        
        if visitor.get('resident_email'):
            try:
                cursor.execute(
                    "SELECT street, house_number FROM pending_registrations WHERE email = %s AND status = 'approved' ORDER BY created_at DESC LIMIT 1",
                    (visitor['resident_email'],)
                )
                pending_reg = cursor.fetchone()
                
                if not pending_reg:
                    cursor.execute(
                        "SELECT street, house_number FROM pending_registrations WHERE email = %s ORDER BY created_at DESC LIMIT 1",
                        (visitor['resident_email'],)
                    )
                    pending_reg = cursor.fetchone()
                
                if pending_reg:
                    resident_street = pending_reg.get('street')
                    resident_house_number = pending_reg.get('house_number')
                    address_parts = []
                    if resident_street:
                        address_parts.append(resident_street)
                    if resident_house_number:
                        address_parts.append(resident_house_number)
                    resident_address = ', '.join(address_parts) if address_parts else None
            except Exception as e:
                print(f"Error obteniendo dirección: {str(e)}")
                resident_address = None
        
        cursor.close()
        conn.close()
        
        # Retornar la información decodificada (solo visible para admin)
        return jsonify({
            'mensaje': 'QR decodificado correctamente',
            'qr_data': qr_data,
            'visitor_info': {
                'visitor_id': visitor['id'],
                'visitor_name': visitor.get('name', ''),
                'resident_name': visitor.get('resident_name', ''),
                'resident_address': resident_address or '',
                'resident_street': resident_street or '',
                'resident_house_number': resident_house_number or '',
                'timestamp': visitor.get('created_at').isoformat() if visitor.get('created_at') and hasattr(visitor.get('created_at'), 'isoformat') else (visitor.get('created_at') if visitor.get('created_at') else '')
            },
            'exito': True
        }), 200
        
    except Exception as e:
        return jsonify({'mensaje': 'Error al decodificar QR: ' + str(e), 'exito': False}), 500

@app.route('/api/visitors/<visitor_id>/generate-event-qr', methods=['POST'])
def generate_event_qr(visitor_id):
    """Generate QR code for an event"""
    try:
        import json
        from datetime import datetime
        
        conn = get_connection()
        if not conn:
            return jsonify({'mensaje': 'Error de conexión a la base de datos', 'exito': False}), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # Obtener información del evento con JOIN para obtener datos del residente
        # Asegurar que eventLocation se seleccione explícitamente
        query = """
            SELECT 
                v.*,
                v.eventLocation as eventLocation,
                p.name as resident_name,
                p.email as resident_email
            FROM visitors v
            LEFT JOIN profiles p ON v.created_by = p.id
            WHERE v.id = %s
        """
        cursor.execute(query, (visitor_id,))
        event = cursor.fetchone()
        
        if not event:
            cursor.close()
            conn.close()
            return jsonify({'mensaje': 'Evento no encontrado', 'exito': False}), 404
        
        # Verificar que sea un evento
        event_type = event.get('type')
        if event_type != 'event':
            cursor.close()
            conn.close()
            return jsonify({'mensaje': 'Solo se pueden generar códigos QR para eventos', 'exito': False}), 400
        
        # Obtener la dirección del residente desde pending_registrations
        resident_address = None
        resident_street = None
        resident_house_number = None
        
        if event.get('resident_email'):
            try:
                # Buscar la dirección en pending_registrations
                cursor.execute(
                    "SELECT street, house_number FROM pending_registrations WHERE email = %s AND status = 'approved' ORDER BY created_at DESC LIMIT 1",
                    (event['resident_email'],)
                )
                pending_reg = cursor.fetchone()
                
                # Si no encontramos en aprobados, buscar en cualquier registro
                if not pending_reg:
                    cursor.execute(
                        "SELECT street, house_number FROM pending_registrations WHERE email = %s ORDER BY created_at DESC LIMIT 1",
                        (event['resident_email'],)
                    )
                    pending_reg = cursor.fetchone()
                
                if pending_reg:
                    resident_street = pending_reg.get('street')
                    resident_house_number = pending_reg.get('house_number')
                    address_parts = []
                    if resident_street:
                        address_parts.append(resident_street)
                    if resident_house_number:
                        address_parts.append(resident_house_number)
                    resident_address = ', '.join(address_parts) if address_parts else None
            except Exception as e:
                print(f"Error obteniendo dirección para QR: {str(e)}")
                resident_address = None
        
        # Crear objeto SIMPLE para el QR (solo datos esenciales para facilitar el escaneo)
        qr_data_object = {
            't': 'event',  # Tipo abreviado
            'id': event['id']  # Solo el ID del evento
        }
        
        # Convertir a JSON string para el QR
        qr_data_string = json.dumps(qr_data_object)
        
        # Generar URL del QR code usando API externa con tamaño más grande para mejor escaneo
        import urllib.parse
        qr_code_url = f"https://api.qrserver.com/v1/create-qr-code/?size=400x400&data={urllib.parse.quote(qr_data_string)}"
        
        # Guardar el código QR en la base de datos
        cursor.execute(
            "UPDATE visitors SET codigo_qr = %s WHERE id = %s",
            (qr_code_url, visitor_id)
        )
        conn.commit()
        
        # Obtener el evento actualizado
        cursor.execute("SELECT * FROM visitors WHERE id = %s", (visitor_id,))
        updated_event = cursor.fetchone()
        
        # Convertir objetos datetime, date y timedelta a strings para JSON
        if updated_event:
            updated_event = serialize_visitor_for_json(updated_event)
        
        # Obtener eventLocation del evento (puede tener diferentes nombres en la BD)
        event_location = event.get('eventLocation') or event.get('eventlocation') or event.get('event_location') or updated_event.get('eventLocation') or updated_event.get('eventlocation') or updated_event.get('event_location') or None
        
        # Convertir eventDate y eventTime a strings si son objetos date/time
        event_date = event.get('eventDate', '')
        if event_date:
            if isinstance(event_date, date):
                event_date = event_date.isoformat()
            elif isinstance(event_date, datetime):
                event_date = event_date.date().isoformat()
            elif hasattr(event_date, 'strftime'):
                event_date = event_date.strftime('%Y-%m-%d')
            else:
                event_date = str(event_date) if event_date else ''
        
        event_time = event.get('eventTime', '')
        if event_time:
            if isinstance(event_time, time):
                event_time = event_time.strftime('%H:%M:%S')
            elif isinstance(event_time, timedelta):
                # Convertir timedelta a HH:MM:SS
                total_seconds = int(event_time.total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                seconds = total_seconds % 60
                event_time = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            elif hasattr(event_time, 'strftime'):
                event_time = event_time.strftime('%H:%M:%S')
            else:
                event_time = str(event_time) if event_time else ''
        
        # Crear objeto con información completa del evento para el frontend
        event_info = {
            'event_name': event.get('name', '') or '',
            'event_date': event_date or '',
            'event_time': event_time or '',
            'number_of_guests': event.get('numberOfGuests', '') or '',
            'event_location': event_location or '',
            'resident_name': event.get('resident_name', '') or '',
            'resident_address': resident_address or ''
        }
        
        # Convertir event_info a JSON string para incluirlo en la respuesta
        event_info_json = json.dumps(event_info)
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'mensaje': 'Código QR del evento generado correctamente',
            'event': updated_event,
            'qr_code_url': qr_code_url,
            'qr_data': qr_data_string,  # QR simplificado para escanear
            'event_info': event_info_json,  # Información completa del evento para mostrar
            'exito': True
        }), 200
        
    except Exception as e:
        return jsonify({'mensaje': 'Error al generar código QR del evento: ' + str(e), 'exito': False}), 500

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
    """Obtiene todos los registros (pendientes, aprobados y rechazados)"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # Obtener TODOS los registros para que el frontend los separe por status
        cursor.execute(
            "SELECT * FROM pending_registrations ORDER BY created_at DESC"
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
        
        # 3. Preparar datos para profiles
        password = registration['password']
        
        # Convertir fraccionamiento_id a INT si es posible (puede ser VARCHAR en pending_registrations)
        fraccionamiento_id = registration.get('fraccionamiento_id')
        if fraccionamiento_id:
            try:
                # Intentar convertir a int si es un número válido
                if isinstance(fraccionamiento_id, str) and fraccionamiento_id.isdigit():
                    fraccionamiento_id = int(fraccionamiento_id)
                elif isinstance(fraccionamiento_id, (int, float)):
                    fraccionamiento_id = int(fraccionamiento_id)
                else:
                    # Si no es convertible, dejarlo como None
                    fraccionamiento_id = None
            except (ValueError, TypeError):
                fraccionamiento_id = None
        
        # 4. Verificar qué columnas existen en la tabla profiles
        cursor.execute("SHOW COLUMNS FROM profiles LIKE 'phone'")
        has_phone = cursor.fetchone() is not None
        
        cursor.execute("SHOW COLUMNS FROM profiles LIKE 'street'")
        has_street = cursor.fetchone() is not None
        
        cursor.execute("SHOW COLUMNS FROM profiles LIKE 'house_number'")
        has_house_number = cursor.fetchone() is not None
        
        # 5. Insertar en profiles (sin especificar id, dejar que AUTO_INCREMENT lo genere)
        # Construir la query dinámicamente según las columnas disponibles
        base_columns = ['name', 'user_name', 'email', 'password', 'role', 'fraccionamiento_id']
        base_values = [
            registration['full_name'],  # name en profiles = full_name en pending
            registration.get('user_name'),
            registration['email'],
            password,  # Password en texto plano
            registration.get('role', 'resident'),
            fraccionamiento_id
        ]
        
        # Agregar phone si existe la columna
        if has_phone:
            base_columns.append('phone')
            base_values.append(registration.get('phone'))
        
        # Agregar street si existe la columna
        if has_street:
            base_columns.append('street')
            base_values.append(registration.get('street'))
        
        # Agregar house_number si existe la columna
        if has_house_number:
            base_columns.append('house_number')
            base_values.append(registration.get('house_number'))
        
        # Agregar timestamps
        base_columns.extend(['created_at', 'updated_at'])
        base_values.extend(['CURRENT_TIMESTAMP', 'CURRENT_TIMESTAMP'])
        
        # Construir la query de inserción
        columns_str = ', '.join(base_columns)
        # Para los timestamps, usar CURRENT_TIMESTAMP directamente en SQL en lugar de placeholders
        placeholders_list = []
        for i, col in enumerate(base_columns):
            if col in ['created_at', 'updated_at']:
                placeholders_list.append('CURRENT_TIMESTAMP')
            else:
                placeholders_list.append('%s')
        
        placeholders = ', '.join(placeholders_list)
        
        # Filtrar los valores para excluir los timestamps (ya que se usan directamente en SQL)
        values_for_query = [val for i, val in enumerate(base_values) if base_columns[i] not in ['created_at', 'updated_at']]
        
        insert_profile_query = f"""
            INSERT INTO profiles ({columns_str})
            VALUES ({placeholders})
        """
        
        cursor.execute(insert_profile_query, values_for_query)
        profile_id = cursor.lastrowid  # Obtener el ID generado por AUTO_INCREMENT
        
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
# RESIDENT PREFERENCES ROUTES
# =====================================================

@app.route('/api/resident-preferences', methods=['GET'])
def get_resident_preferences():
    """Obtiene las preferencias de un residente"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'user_id es requerido'
            }), 400
        
        conn = get_connection()
        if not conn:
            # Si no hay conexión, devolver valores por defecto
            return jsonify({
                'success': True,
                'exito': True,
                'data': {
                    'user_id': int(user_id) if user_id.isdigit() else 0,
                    'accepts_visitors': False,
                    'accepts_personnel': True
                }
            }), 200
        
        cursor = conn.cursor(dictionary=True)
        preferences = None
        try:
            cursor.execute(
                "SELECT * FROM resident_preferences WHERE user_id = %s",
                (user_id,)
            )
            preferences = cursor.fetchone()
        except Error as db_error:
            # Si la tabla no existe o hay error, usar None para devolver valores por defecto después
            preferences = None
        finally:
            # Asegurar que siempre se cierren las conexiones
            try:
                cursor.close()
            except:
                pass
            try:
                conn.close()
            except:
                pass
        
        if preferences:
            # Convertir datetime a string
            if preferences.get('created_at'):
                preferences['created_at'] = preferences['created_at'].isoformat() if hasattr(preferences['created_at'], 'isoformat') else str(preferences['created_at'])
            if preferences.get('updated_at'):
                preferences['updated_at'] = preferences['updated_at'].isoformat() if hasattr(preferences['updated_at'], 'isoformat') else str(preferences['updated_at'])
            return jsonify({
                'success': True,
                'exito': True,
                'data': preferences
            }), 200
        else:
            # Devolver valores por defecto si no existe el registro
            return jsonify({
                'success': True,
                'exito': True,
                'data': {
                    'user_id': int(user_id) if user_id.isdigit() else 0,
                    'accepts_visitors': False,
                    'accepts_personnel': True
                }
            }), 200
            
    except (ValueError, TypeError) as e:
        # Error al convertir user_id a int, devolver valores por defecto
        return jsonify({
            'success': True,
            'exito': True,
            'data': {
                'user_id': 0,
                'accepts_visitors': False,
                'accepts_personnel': True
            }
        }), 200
    except Exception as e:
        # Para cualquier otro error, devolver valores por defecto en lugar de error 500
        return jsonify({
            'success': True,
            'exito': True,
            'data': {
                'user_id': int(user_id) if user_id and user_id.isdigit() else 0,
                'accepts_visitors': False,
                'accepts_personnel': True
            }
        }), 200

# =====================================================
# BANNERS ROUTES
# =====================================================

@app.route('/api/banners', methods=['GET'])
def get_all_banners():
    """Obtiene todos los banners (admin)"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(
                "SELECT * FROM banners ORDER BY `order` ASC, id ASC"
            )
            banners = cursor.fetchall()
        except Error as db_error:
            # Si la tabla no existe, devolver array vacío
            banners = []
        finally:
            cursor.close()
            conn.close()
        
        # Convertir datetime a string
        for banner in banners:
            if banner.get('created_at'):
                banner['created_at'] = banner['created_at'].isoformat() if hasattr(banner['created_at'], 'isoformat') else str(banner['created_at'])
            if banner.get('updated_at'):
                banner['updated_at'] = banner['updated_at'].isoformat() if hasattr(banner['updated_at'], 'isoformat') else str(banner['updated_at'])
        
        return jsonify({
            'success': True,
            'exito': True,
            'data': banners,
            'banners': banners  # También en formato banners para compatibilidad
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'exito': False,
            'mensaje': f'Error: {str(e)}'
        }), 500

@app.route('/api/banners/active', methods=['GET'])
def get_active_banners():
    """Obtiene los banners activos"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM banners WHERE is_active = 1 ORDER BY `order` ASC"
        )
        banners = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Convertir datetime a string
        for banner in banners:
            if banner.get('created_at'):
                banner['created_at'] = banner['created_at'].isoformat() if hasattr(banner['created_at'], 'isoformat') else str(banner['created_at'])
            if banner.get('updated_at'):
                banner['updated_at'] = banner['updated_at'].isoformat() if hasattr(banner['updated_at'], 'isoformat') else str(banner['updated_at'])
        
        return jsonify({
            'success': True,
            'exito': True,
            'data': banners
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
            'mensaje': f'Error: {str(e)}'
        }), 500

@app.route('/api/banners', methods=['POST'])
def create_banner():
    """Crea un nuevo banner"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'No se recibieron datos'
            }), 400
        
        title = data.get('title')
        description = data.get('description')
        
        if not title or not description:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'El título y la descripción son requeridos'
            }), 400
        
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(
                """INSERT INTO banners (title, description, cta_text, cta_url, is_active, `order`)
                   VALUES (%s, %s, %s, %s, %s, %s)""",
                (
                    title,
                    description,
                    data.get('cta_text'),
                    data.get('cta_url'),
                    data.get('is_active', True),
                    data.get('order', 0)
                )
            )
            conn.commit()
            banner_id = cursor.lastrowid
            
            # Obtener el banner creado
            cursor.execute("SELECT * FROM banners WHERE id = %s", (banner_id,))
            banner = cursor.fetchone()
            
            cursor.close()
            conn.close()
            
            # Convertir datetime a string
            if banner.get('created_at'):
                banner['created_at'] = banner['created_at'].isoformat() if hasattr(banner['created_at'], 'isoformat') else str(banner['created_at'])
            if banner.get('updated_at'):
                banner['updated_at'] = banner['updated_at'].isoformat() if hasattr(banner['updated_at'], 'isoformat') else str(banner['updated_at'])
            
            return jsonify({
                'success': True,
                'exito': True,
                'mensaje': 'Banner creado correctamente',
                'data': banner
            }), 201
            
        except Error as db_error:
            conn.rollback()
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': f'Error en la base de datos: {str(db_error)}'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'exito': False,
            'mensaje': f'Error: {str(e)}'
        }), 500

@app.route('/api/banners/<int:banner_id>', methods=['PUT'])
def update_banner(banner_id):
    """Actualiza un banner existente"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'No se recibieron datos'
            }), 400
        
        title = data.get('title')
        description = data.get('description')
        
        if not title or not description:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'El título y la descripción son requeridos'
            }), 400
        
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor(dictionary=True)
        try:
            # Verificar que el banner existe
            cursor.execute("SELECT id FROM banners WHERE id = %s", (banner_id,))
            if not cursor.fetchone():
                cursor.close()
                conn.close()
                return jsonify({
                    'success': False,
                    'exito': False,
                    'mensaje': 'Banner no encontrado'
                }), 404
            
            # Actualizar el banner
            cursor.execute(
                """UPDATE banners 
                   SET title = %s, description = %s, cta_text = %s, cta_url = %s, 
                       is_active = %s, `order` = %s, updated_at = CURRENT_TIMESTAMP
                   WHERE id = %s""",
                (
                    title,
                    description,
                    data.get('cta_text'),
                    data.get('cta_url'),
                    data.get('is_active', True),
                    data.get('order', 0),
                    banner_id
                )
            )
            conn.commit()
            
            # Obtener el banner actualizado
            cursor.execute("SELECT * FROM banners WHERE id = %s", (banner_id,))
            banner = cursor.fetchone()
            
            cursor.close()
            conn.close()
            
            # Convertir datetime a string
            if banner.get('created_at'):
                banner['created_at'] = banner['created_at'].isoformat() if hasattr(banner['created_at'], 'isoformat') else str(banner['created_at'])
            if banner.get('updated_at'):
                banner['updated_at'] = banner['updated_at'].isoformat() if hasattr(banner['updated_at'], 'isoformat') else str(banner['updated_at'])
            
            return jsonify({
                'success': True,
                'exito': True,
                'mensaje': 'Banner actualizado correctamente',
                'data': banner
            }), 200
            
        except Error as db_error:
            conn.rollback()
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': f'Error en la base de datos: {str(db_error)}'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'exito': False,
            'mensaje': f'Error: {str(e)}'
        }), 500

@app.route('/api/banners/<int:banner_id>', methods=['DELETE'])
def delete_banner(banner_id):
    """Elimina un banner"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor(dictionary=True)
        try:
            # Verificar que el banner existe
            cursor.execute("SELECT id FROM banners WHERE id = %s", (banner_id,))
            if not cursor.fetchone():
                cursor.close()
                conn.close()
                return jsonify({
                    'success': False,
                    'exito': False,
                    'mensaje': 'Banner no encontrado'
                }), 404
            
            # Eliminar el banner
            cursor.execute("DELETE FROM banners WHERE id = %s", (banner_id,))
            conn.commit()
            
            cursor.close()
            conn.close()
            
            return jsonify({
                'success': True,
                'exito': True,
                'mensaje': 'Banner eliminado correctamente'
            }), 200
            
        except Error as db_error:
            conn.rollback()
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': f'Error en la base de datos: {str(db_error)}'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'exito': False,
            'mensaje': f'Error: {str(e)}'
        }), 500

@app.route('/api/banners/<int:banner_id>/status', methods=['PUT'])
def update_banner_status(banner_id):
    """Actualiza el estado (activo/inactivo) de un banner"""
    try:
        data = request.get_json()
        
        if not data or 'is_active' not in data:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'El campo is_active es requerido'
            }), 400
        
        is_active = bool(data.get('is_active'))
        
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor(dictionary=True)
        try:
            # Verificar que el banner existe
            cursor.execute("SELECT id FROM banners WHERE id = %s", (banner_id,))
            if not cursor.fetchone():
                cursor.close()
                conn.close()
                return jsonify({
                    'success': False,
                    'exito': False,
                    'mensaje': 'Banner no encontrado'
                }), 404
            
            # Actualizar el estado
            cursor.execute(
                "UPDATE banners SET is_active = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                (is_active, banner_id)
            )
            conn.commit()
            
            cursor.close()
            conn.close()
            
            return jsonify({
                'success': True,
                'exito': True,
                'mensaje': 'Estado del banner actualizado',
                'data': {
                    'id': banner_id,
                    'is_active': is_active
                }
            }), 200
            
        except Error as db_error:
            conn.rollback()
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': f'Error en la base de datos: {str(db_error)}'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'exito': False,
            'mensaje': f'Error: {str(e)}'
        }), 500

# =====================================================
# NOTIFICATIONS ROUTES
# =====================================================

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    """Obtiene las notificaciones de un usuario"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'user_id es requerido'
            }), 400
        
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(
                "SELECT * FROM notifications WHERE user_id = %s ORDER BY created_at DESC",
                (user_id,)
            )
            notifications = cursor.fetchall()
        except Error as db_error:
            # Si la tabla no existe, devolver array vacío
            notifications = []
        finally:
            cursor.close()
            conn.close()
        
        # Convertir datetime a string y ajustar nombre del campo read
        for notification in notifications:
            if notification.get('created_at'):
                notification['created_at'] = notification['created_at'].isoformat() if hasattr(notification['created_at'], 'isoformat') else str(notification['created_at'])
            # Convertir el campo `read` a is_read para compatibilidad con el frontend
            if 'read' in notification:
                notification['is_read'] = bool(notification['read'])
                # Mantener ambos campos para compatibilidad
                if not 'is_read' in notification:
                    notification['is_read'] = notification['read']
        
        return jsonify({
            'success': True,
            'exito': True,
            'data': notifications,
            'notifications': notifications  # También en formato notifications para compatibilidad
        }), 200
        
    except Exception as e:
        # En caso de error, devolver array vacío
        return jsonify({
            'success': True,
            'exito': True,
            'data': [],
            'notifications': []
        }), 200

@app.route('/api/notifications/<notification_id>/read', methods=['PUT'])
def mark_notification_as_read(notification_id):
    """Marca una notificación como leída"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(
                "UPDATE notifications SET `read` = 1 WHERE id = %s",
                (notification_id,)
            )
            conn.commit()
        except Error as db_error:
            conn.rollback()
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': f'Error en la base de datos: {str(db_error)}'
            }), 500
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'exito': True,
            'mensaje': 'Notificación marcada como leída'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'exito': False,
            'mensaje': f'Error: {str(e)}'
        }), 500

@app.route('/api/emergency/alert', methods=['POST'])
def create_emergency_alert():
    """Crea una alerta de emergencia desde un residente y la envía a todos los guardias"""
    try:
        data = request.get_json()
        resident_id = data.get('resident_id')
        
        if not resident_id:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'resident_id es requerido'
            }), 400
        
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor(dictionary=True)
        try:
            # Obtener información del residente
            cursor.execute(
                "SELECT id, name, user_name, email, fraccionamiento_id, street, house_number FROM profiles WHERE id = %s",
                (resident_id,)
            )
            resident = cursor.fetchone()
            
            if not resident:
                cursor.close()
                conn.close()
                return jsonify({
                    'success': False,
                    'exito': False,
                    'mensaje': 'Residente no encontrado'
                }), 404
            
            # Obtener todos los guardias
            cursor.execute(
                "SELECT id FROM profiles WHERE role = 'guard' OR role = 'admin'"
            )
            guards = cursor.fetchall()
            
            if not guards:
                cursor.close()
                conn.close()
                return jsonify({
                    'success': False,
                    'exito': False,
                    'mensaje': 'No hay guardias disponibles'
                }), 404
            
            # Crear mensaje de emergencia con datos del residente
            location_info = []
            if resident.get('fraccionamiento_id'):
                try:
                    cursor.execute("SELECT name FROM fraccionamientos WHERE id = %s", (resident['fraccionamiento_id'],))
                    fracc = cursor.fetchone()
                    if fracc:
                        location_info.append(fracc['name'])
                except Error:
                    # Si la tabla fraccionamientos no existe, continuar sin error
                    pass
            if resident.get('street'):
                location_info.append(resident['street'])
            if resident.get('house_number'):
                location_info.append(f"Casa {resident['house_number']}")
            
            location_str = ", ".join(location_info) if location_info else "Ubicación no especificada"
            
            resident_name = resident.get('name') or resident.get('user_name') or resident.get('email') or 'Residente'
            title = f"🚨 ALERTA DE EMERGENCIA"
            message = f"El residente {resident_name} ha activado el botón de emergencia.\n\n"
            message += f"📋 Datos del residente:\n"
            message += f"• Nombre: {resident_name}\n"
            message += f"• Email: {resident.get('email', 'N/A')}\n"
            message += f"• Ubicación: {location_str}"
            
            # Crear notificación para cada guardia
            created_notifications = []
            for guard in guards:
                cursor.execute(
                    "INSERT INTO notifications (user_id, title, message, `read`) VALUES (%s, %s, %s, 0)",
                    (guard['id'], title, message)
                )
                created_notifications.append(cursor.lastrowid)
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return jsonify({
                'success': True,
                'exito': True,
                'mensaje': f'Alerta de emergencia enviada a {len(guards)} guardia(s)',
                'notifications_created': len(created_notifications)
            }), 200
            
        except Error as db_error:
            conn.rollback()
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': f'Error en la base de datos: {str(db_error)}'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'exito': False,
            'mensaje': f'Error: {str(e)}'
        }), 500

@app.route('/api/notifications/mark-all-read', methods=['PUT'])
def mark_all_notifications_as_read():
    """Marca todas las notificaciones de un usuario como leídas"""
    try:
        data = request.get_json()
        user_id = data.get('user_id') if data else None
        user_id = user_id or request.args.get('user_id')
        
        if not user_id:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'user_id es requerido'
            }), 400
        
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(
                "UPDATE notifications SET `read` = 1 WHERE user_id = %s",
                (user_id,)
            )
            conn.commit()
        except Error as db_error:
            conn.rollback()
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': f'Error en la base de datos: {str(db_error)}'
            }), 500
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'exito': True,
            'mensaje': 'Todas las notificaciones marcadas como leídas'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'exito': False,
            'mensaje': f'Error: {str(e)}'
        }), 500

# =====================================================
# INCIDENTS ROUTES
# =====================================================

@app.route('/api/incidents/stats/by-type', methods=['GET'])
def get_incidents_by_type():
    """Obtiene estadísticas de incidentes agrupados por tipo"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # Obtener parámetros opcionales
        fraccionamiento_id = request.args.get('fraccionamiento_id')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Construir query
        query = """
            SELECT incident_type, COUNT(*) as count 
            FROM incidents 
            WHERE 1=1
        """
        params = []
        
        if fraccionamiento_id:
            query += " AND fraccionamiento_id = %s"
            params.append(fraccionamiento_id)
        
        if start_date:
            query += " AND reported_at >= %s"
            params.append(start_date)
        
        if end_date:
            query += " AND reported_at <= %s"
            params.append(end_date)
        
        query += " GROUP BY incident_type ORDER BY count DESC"
        
        try:
            cursor.execute(query, params)
            results = cursor.fetchall()
        except Error as db_error:
            # Si la tabla no existe, devolver array vacío
            results = []
        finally:
            cursor.close()
            conn.close()
        
        return jsonify({
            'success': True,
            'exito': True,
            'data': results
        }), 200
        
    except Exception as e:
        # En caso de error, devolver array vacío
        return jsonify({
            'success': True,
            'exito': True,
            'data': []
        }), 200

# =====================================================
# RESIDENTS ROUTES (Para Chat)
# =====================================================

@app.route('/api/residents', methods=['GET'])
def get_residents():
    """Obtiene la lista de todos los residentes"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # Obtener todos los usuarios con rol 'resident'
        query = """
            SELECT id, name, user_name, email, role
            FROM profiles
            WHERE role = 'resident'
            ORDER BY name ASC
        """
        
        try:
            cursor.execute(query)
            residents = cursor.fetchall()
            
            # Convertir IDs a enteros si es necesario
            for resident in residents:
                if 'id' in resident and resident['id']:
                    try:
                        resident['id'] = int(resident['id'])
                    except (ValueError, TypeError):
                        pass
        except Error as db_error:
            residents = []
        finally:
            cursor.close()
            conn.close()
        
        return jsonify({
            'success': True,
            'exito': True,
            'data': residents
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'exito': False,
            'mensaje': f'Error al obtener residentes: {str(e)}',
            'data': []
        }), 200

# =====================================================
# CHAT ROUTES
# =====================================================

@app.route('/api/chat/messages', methods=['POST'])
def send_chat_message():
    """Envía un mensaje de chat"""
    try:
        data = request.get_json()
        sender_id = data.get('sender_id')
        receiver_id = data.get('receiver_id')
        message_text = data.get('message')
        chat_type = data.get('chat_type', 'administration')  # Para residentes que usan tabs
        
        if not sender_id or not message_text:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'sender_id y message son requeridos'
            }), 400
        
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor(dictionary=True)
        
        try:
            # Obtener información del sender
            cursor.execute("SELECT id, role, fraccionamiento_id FROM profiles WHERE id = %s", (sender_id,))
            sender = cursor.fetchone()
            
            if not sender:
                return jsonify({
                    'success': False,
                    'exito': False,
                    'mensaje': 'Usuario remitente no encontrado'
                }), 404
            
            # Determinar si es admin, guard o residente
            sender_role = sender.get('role')
            is_admin = sender_role in ['admin', 'guard']
            
            # Si es una conversación 1 a 1 (admin/guard-residente o viceversa)
            if receiver_id:
                # Verificar que el receiver existe
                cursor.execute("SELECT id, role, fraccionamiento_id FROM profiles WHERE id = %s", (receiver_id,))
                receiver = cursor.fetchone()
                
                if not receiver:
                    return jsonify({
                        'success': False,
                        'exito': False,
                        'mensaje': 'Usuario destinatario no encontrado'
                    }), 404
                
                # Intentar insertar con sender_id y receiver_id primero
                # IMPORTANTE: También incluir chat_type y fraccionamiento_id para que el residente pueda verlo
                try:
                    chat_type_for_message = 'administration' if sender_role == 'admin' else 'security' if sender_role == 'guard' else 'administration'
                    fracc_id = sender.get('fraccionamiento_id') or receiver.get('fraccionamiento_id')
                    
                    # Intentar insertar con todas las columnas disponibles
                    insert_query = """
                        INSERT INTO chat_messages (sender_id, receiver_id, fraccionamiento_id, chat_type, user_id, message, created_at)
                        VALUES (%s, %s, %s, %s, %s, %s, NOW())
                    """
                    cursor.execute(insert_query, (sender_id, receiver_id, fracc_id, chat_type_for_message, sender_id, message_text))
                        
                except Error as e:
                    # Si falla, intentar solo con sender_id y receiver_id (sin chat_type)
                    try:
                        insert_query = """
                            INSERT INTO chat_messages (sender_id, receiver_id, message, created_at)
                            VALUES (%s, %s, %s, NOW())
                        """
                        cursor.execute(insert_query, (sender_id, receiver_id, message_text))
                        
                        # También insertar en estructura antigua para compatibilidad
                        try:
                            chat_type_for_message = 'administration' if sender_role == 'admin' else 'security' if sender_role == 'guard' else 'administration'
                            fracc_id = sender.get('fraccionamiento_id') or receiver.get('fraccionamiento_id')
                            insert_old = """
                                INSERT INTO chat_messages (fraccionamiento_id, chat_type, user_id, message, created_at)
                                VALUES (%s, %s, %s, %s, NOW())
                            """
                            cursor.execute(insert_old, (fracc_id, chat_type_for_message, sender_id, message_text))
                        except Error:
                            pass  # Si falla, no es crítico
                    except Error as e2:
                        # Si las columnas sender_id/receiver_id no existen, usar solo estructura antigua
                        # IMPORTANTE: Guardar con chat_type según el rol del sender
                        chat_type_for_message = 'administration' if sender_role == 'admin' else 'security' if sender_role == 'guard' else 'administration'
                        fracc_id = sender.get('fraccionamiento_id') or receiver.get('fraccionamiento_id')
                        insert_query = """
                            INSERT INTO chat_messages (fraccionamiento_id, chat_type, user_id, message, created_at)
                            VALUES (%s, %s, %s, %s, NOW())
                        """
                        cursor.execute(insert_query, (fracc_id, chat_type_for_message, sender_id, message_text))
            else:
                # Mensaje de residente a un tab específico (para que los admins lo vean)
                # Guardamos el mensaje con chat_type y user_id del residente
                # Los admins verán estos mensajes cuando seleccionen a ese residente
                insert_query = """
                    INSERT INTO chat_messages (fraccionamiento_id, chat_type, user_id, message, created_at)
                    VALUES (%s, %s, %s, %s, NOW())
                """
                cursor.execute(insert_query, (
                    sender.get('fraccionamiento_id'),
                    chat_type or 'administration',
                    sender_id,
                    message_text
                ))
            
            conn.commit()
            message_id = cursor.lastrowid
            
            cursor.close()
            conn.close()
            
            return jsonify({
                'success': True,
                'exito': True,
                'mensaje': 'Mensaje enviado correctamente',
                'data': {
                    'id': message_id,
                    'sender_id': sender_id,
                    'receiver_id': receiver_id,
                    'message': message_text,
                    'created_at': None  # Se puede obtener de la BD si es necesario
                }
            }), 201
            
        except Error as db_error:
            conn.rollback()
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': f'Error en la base de datos: {str(db_error)}'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'exito': False,
            'mensaje': f'Error al enviar mensaje: {str(e)}'
        }), 500

@app.route('/api/chat/messages', methods=['GET'])
def get_chat_messages():
    """Obtiene los mensajes de chat"""
    try:
        sender_id = request.args.get('sender_id')
        receiver_id = request.args.get('receiver_id')
        chat_type = request.args.get('chat_type')
        user_id = request.args.get('user_id')  # Para obtener todos los mensajes de un usuario
        
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor(dictionary=True)
        
        try:
            messages = []
            
            # Si es conversación 1 a 1 (admin/guard-residente)
            if sender_id and receiver_id:
                # Obtener el rol del sender para filtrar correctamente
                cursor.execute("SELECT role FROM profiles WHERE id = %s", (sender_id,))
                sender_role_info = cursor.fetchone()
                sender_role = sender_role_info.get('role') if sender_role_info else None
                
                # Determinar el chat_type según el rol del sender
                target_chat_type = 'administration' if sender_role == 'admin' else 'security' if sender_role == 'guard' else None
                
                # Primero intentar con estructura nueva (sender_id, receiver_id)
                try:
                    query_new = """
                        SELECT 
                            cm.*,
                            s.name as sender_name,
                            s.user_name as sender_username,
                            r.name as receiver_name,
                            r.user_name as receiver_username
                        FROM chat_messages cm
                        LEFT JOIN profiles s ON cm.sender_id = s.id
                        LEFT JOIN profiles r ON cm.receiver_id = r.id
                        WHERE (cm.sender_id = %s AND cm.receiver_id = %s)
                           OR (cm.sender_id = %s AND cm.receiver_id = %s)
                        ORDER BY cm.created_at ASC
                    """
                    cursor.execute(query_new, (sender_id, receiver_id, receiver_id, sender_id))
                    messages_new = cursor.fetchall()
                    
                    if messages_new:
                        messages = messages_new
                except Error:
                    messages_new = []
                
                # SIEMPRE buscar también en estructura antigua (user_id, chat_type)
                # Obtener mensajes del residente, pero SOLO del chat_type correspondiente al rol del sender
                if target_chat_type:
                    query_resident = """
                        SELECT 
                            cm.*,
                            p.name as sender_name,
                            p.user_name as sender_username
                        FROM chat_messages cm
                        LEFT JOIN profiles p ON cm.user_id = p.id
                        WHERE cm.user_id = %s
                          AND cm.chat_type = %s
                        ORDER BY cm.created_at ASC
                    """
                    cursor.execute(query_resident, (receiver_id, target_chat_type))
                else:
                    # Si no hay target_chat_type, buscar todos los mensajes del residente
                    query_resident = """
                        SELECT 
                            cm.*,
                            p.name as sender_name,
                            p.user_name as sender_username
                        FROM chat_messages cm
                        LEFT JOIN profiles p ON cm.user_id = p.id
                        WHERE cm.user_id = %s
                        ORDER BY cm.created_at ASC
                    """
                    cursor.execute(query_resident, (receiver_id,))
                
                messages_resident = cursor.fetchall()
                
                # Combinar mensajes del residente, evitando duplicados
                existing_ids = {m.get('id') for m in messages}
                for msg in messages_resident:
                    if msg.get('id') not in existing_ids:
                        messages.append(msg)
                
                # NO buscar mensajes de admin/guard en la estructura antigua para conversaciones 1 a 1
                # En conversaciones 1 a 1, solo debemos usar la estructura nueva (sender_id/receiver_id)
                # para evitar mostrar mensajes de otros residentes del mismo fraccionamiento
                # Los mensajes de admin/guard ya están incluidos en la búsqueda inicial con sender_id/receiver_id
                
                # Ordenar todos los mensajes por fecha después de combinarlos
                messages.sort(key=lambda x: x.get('created_at') or '1970-01-01 00:00:00')
            elif chat_type and user_id:
                # Para residentes que usan tabs
                # Obtener mensajes del residente (estructura antigua: user_id + chat_type)
                query_resident = """
                    SELECT 
                        cm.*,
                        p.name as sender_name,
                        p.user_name as sender_username
                    FROM chat_messages cm
                    LEFT JOIN profiles p ON cm.user_id = p.id
                    WHERE cm.chat_type = %s
                      AND cm.user_id = %s
                    ORDER BY cm.created_at ASC
                """
                cursor.execute(query_resident, (chat_type, user_id))
                messages = cursor.fetchall()
                
                # Determinar el rol objetivo para filtrar mensajes de admin/guard
                target_role = 'admin' if chat_type == 'administration' else 'guard' if chat_type == 'security' else None
                
                # NO buscar mensajes de admin/guard en la estructura antigua sin receiver_id
                # Esto previene que residentes vean mensajes de admin/guard que no fueron dirigidos a ellos
                # Solo se mostrarán mensajes que:
                # 1. Fueron enviados por el residente actual (ya obtenidos arriba)
                # 2. Fueron enviados por admin/guard directamente al residente (obtenidos con receiver_id)
                # 
                # Los mensajes de admin/guard en la estructura antigua sin receiver_id específico
                # no deben mostrarse a todos los residentes, solo a aquellos a quienes fueron dirigidos
                
                # También obtener mensajes donde el residente es el receiver_id (estructura nueva)
                # Esto captura mensajes enviados por admin/guard directamente al residente
                try:
                    query_receiver_messages = """
                        SELECT 
                            cm.*,
                            s.name as sender_name,
                            s.user_name as sender_username
                        FROM chat_messages cm
                        LEFT JOIN profiles s ON cm.sender_id = s.id
                        WHERE cm.receiver_id = %s
                          AND (cm.chat_type = %s OR cm.chat_type IS NULL)
                        ORDER BY cm.created_at ASC
                    """
                    cursor.execute(query_receiver_messages, (user_id, chat_type))
                    receiver_messages = cursor.fetchall()
                    
                    # Combinar mensajes, evitando duplicados
                    existing_ids = {m.get('id') for m in messages}
                    for msg in receiver_messages:
                        if msg.get('id') not in existing_ids:
                            messages.append(msg)
                except Error:
                    pass  # Si falla, continuar
                
                # También buscar mensajes de admin/guard con receiver_id específico (estructura nueva)
                if target_role:
                    try:
                        query_admin_to_resident = """
                            SELECT 
                                cm.*,
                                s.name as sender_name,
                                s.user_name as sender_username
                            FROM chat_messages cm
                            LEFT JOIN profiles s ON cm.sender_id = s.id
                            WHERE cm.receiver_id = %s
                              AND s.role = %s
                            ORDER BY cm.created_at ASC
                        """
                        cursor.execute(query_admin_to_resident, (user_id, target_role))
                        admin_messages = cursor.fetchall()
                        
                        # Combinar mensajes, evitando duplicados
                        existing_ids = {m.get('id') for m in messages}
                        for msg in admin_messages:
                            if msg.get('id') not in existing_ids:
                                messages.append(msg)
                    except Error:
                        pass  # Continuar con la búsqueda alternativa
                
                # También buscar mensajes donde el residente es el sender_id (mensajes enviados por el residente en estructura nueva)
                try:
                    query_sender_messages = """
                        SELECT 
                            cm.*,
                            s.name as sender_name,
                            s.user_name as sender_username
                        FROM chat_messages cm
                        LEFT JOIN profiles s ON cm.sender_id = s.id
                        WHERE cm.sender_id = %s
                        ORDER BY cm.created_at ASC
                    """
                    cursor.execute(query_sender_messages, (user_id,))
                    sender_messages = cursor.fetchall()
                    
                    # Combinar mensajes, evitando duplicados
                    existing_ids = {m.get('id') for m in messages}
                    for msg in sender_messages:
                        if msg.get('id') not in existing_ids:
                            messages.append(msg)
                except Error:
                    pass  # Si falla, continuar
                
                # NO buscar mensajes de admin/guard en el mismo fraccionamiento sin receiver_id
                # Esto previene que residentes vean mensajes de admin/guard que no fueron dirigidos a ellos
                # Solo se mostrarán mensajes que:
                # 1. Fueron enviados por el residente actual (ya obtenidos arriba)
                # 2. Fueron enviados por admin/guard directamente al residente (obtenidos arriba con receiver_id)
                # 
                # Los mensajes de admin/guard en el mismo fraccionamiento sin receiver_id específico
                # no deben mostrarse a todos los residentes, solo a aquellos a quienes fueron dirigidos
                
                # Ordenar todos los mensajes por fecha
                messages.sort(key=lambda x: x.get('created_at') or '1970-01-01 00:00:00')
            elif user_id:
                # Obtener todos los mensajes de un usuario (para admin viendo conversaciones)
                try:
                    query = """
                        SELECT 
                            cm.*,
                            s.name as sender_name,
                            s.user_name as sender_username,
                            r.name as receiver_name,
                            r.user_name as receiver_username
                        FROM chat_messages cm
                        LEFT JOIN profiles s ON cm.sender_id = s.id
                        LEFT JOIN profiles r ON cm.receiver_id = r.id
                        WHERE cm.sender_id = %s OR cm.receiver_id = %s
                        ORDER BY cm.created_at ASC
                    """
                    cursor.execute(query, (user_id, user_id))
                    messages = cursor.fetchall()
                except Error:
                    # Estructura antigua
                    query = """
                        SELECT 
                            cm.*,
                            p.name as sender_name,
                            p.user_name as sender_username
                        FROM chat_messages cm
                        LEFT JOIN profiles p ON cm.user_id = p.id
                        WHERE cm.user_id = %s
                        ORDER BY cm.created_at ASC
                    """
                    cursor.execute(query, (user_id,))
                    messages = cursor.fetchall()
            
            # Formatear mensajes
            formatted_messages = []
            # Determinar el ID del usuario actual que está viendo los mensajes
            current_user_id = None
            if sender_id and str(sender_id).isdigit():
                current_user_id = int(sender_id)
            elif user_id and str(user_id).isdigit():
                current_user_id = int(user_id)
            elif receiver_id and str(receiver_id).isdigit():
                # Si hay receiver_id, ese es el usuario actual (para conversaciones 1 a 1)
                current_user_id = int(receiver_id)
            
            for msg in messages:
                # Obtener el ID del remitente del mensaje
                # Priorizar sender_id sobre user_id para mensajes 1 a 1
                msg_sender_id = msg.get('sender_id')
                if not msg_sender_id:
                    msg_sender_id = msg.get('user_id')
                
                if msg_sender_id:
                    try:
                        msg_sender_id = int(msg_sender_id)
                    except (ValueError, TypeError):
                        msg_sender_id = None
                
                # Determinar si el mensaje fue enviado por el usuario actual
                is_sent = False
                if current_user_id and msg_sender_id:
                    try:
                        is_sent = int(msg_sender_id) == int(current_user_id)
                    except (ValueError, TypeError):
                        is_sent = False
                
                # Si el mensaje tiene receiver_id, verificar que sea para el usuario actual
                # Esto previene que residentes vean mensajes de otros residentes como propios
                msg_receiver_id = msg.get('receiver_id')
                if msg_receiver_id and current_user_id:
                    try:
                        msg_receiver_id = int(msg_receiver_id)
                        # Si el mensaje tiene un receiver_id y no es el usuario actual, no debería marcarse como enviado
                        if msg_receiver_id != current_user_id and msg_sender_id != current_user_id:
                            is_sent = False
                    except (ValueError, TypeError):
                        pass
                
                # Formatear fecha
                created_at = msg.get('created_at')
                time_str = '00:00'
                if created_at:
                    try:
                        if hasattr(created_at, 'strftime'):
                            time_str = created_at.strftime('%H:%M')
                        elif isinstance(created_at, str):
                            # Intentar parsear string de fecha
                            from datetime import datetime
                            dt = datetime.strptime(created_at[:19], '%Y-%m-%d %H:%M:%S')
                            time_str = dt.strftime('%H:%M')
                        else:
                            time_str = str(created_at)[:5] if len(str(created_at)) >= 5 else '00:00'
                    except:
                        time_str = '00:00'
                
                formatted_messages.append({
                    'id': msg.get('id'),
                    'text': msg.get('message', ''),
                    'time': time_str,
                    'sent': is_sent,
                    'sender_name': msg.get('sender_name') or msg.get('sender_username', 'Usuario'),
                    'created_at': created_at.isoformat() if created_at and hasattr(created_at, 'isoformat') else str(created_at) if created_at else None
                })
            
            cursor.close()
            conn.close()
            
            return jsonify({
                'success': True,
                'exito': True,
                'data': formatted_messages
            }), 200
            
        except Error as db_error:
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'exito': False,
                'mensaje': f'Error en la base de datos: {str(db_error)}',
                'data': []
            }), 200
            
    except Exception as e:
        return jsonify({
            'success': False,
            'exito': False,
            'mensaje': f'Error al obtener mensajes: {str(e)}',
            'data': []
        }), 200

# =====================================================
# ERROR HANDLERS
# =====================================================

def pagina_no_encontrada(error):
    return jsonify({'mensaje': 'La página que intentas buscar no existe...', 'exito': False}), 404

if __name__ == '__main__':
    app.config.from_object(config['development'])
    app.register_error_handler(404, pagina_no_encontrada)
    app.run(debug=True, port=5000)
