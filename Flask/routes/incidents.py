"""
Incidents routes
"""
from flask import Blueprint, request, jsonify, current_app
import mysql.connector
from mysql.connector import Error
from datetime import datetime
import uuid

def get_connection():
    """Get MySQL database connection"""
    try:
        from src.app import app
        
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

incidents_bp = Blueprint('incidents', __name__)

@incidents_bp.route('', methods=['GET'])
def get_incidents():
    """Get all incidents with optional filters"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # Obtener parámetros de filtro
        status = request.args.get('status')
        incident_type = request.args.get('incident_type')
        severity = request.args.get('severity')
        fraccionamiento_id = request.args.get('fraccionamiento_id')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Construir query base
        query = "SELECT * FROM incidents WHERE 1=1"
        params = []
        
        if status:
            query += " AND status = %s"
            params.append(status)
        
        if incident_type:
            query += " AND incident_type = %s"
            params.append(incident_type)
        
        if severity:
            query += " AND severity = %s"
            params.append(severity)
        
        if fraccionamiento_id:
            query += " AND fraccionamiento_id = %s"
            params.append(fraccionamiento_id)
        
        if start_date:
            query += " AND reported_at >= %s"
            params.append(start_date)
        
        if end_date:
            query += " AND reported_at <= %s"
            params.append(end_date)
        
        query += " ORDER BY reported_at DESC"
        
        cursor.execute(query, params)
        incidents = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        # Convertir datetime a string para JSON
        for incident in incidents:
            for key in ['reported_at', 'resolved_at', 'created_at', 'updated_at']:
                if incident.get(key) and hasattr(incident[key], 'isoformat'):
                    incident[key] = incident[key].isoformat()
        
        return jsonify({
            'success': True,
            'data': incidents
        }), 200
        
    except Error as e:
        return jsonify({
            'success': False,
            'mensaje': f'Error en la base de datos: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'mensaje': f'Error al listar incidentes: {str(e)}'
        }), 500

@incidents_bp.route('/<incident_id>', methods=['GET'])
def get_incident(incident_id):
    """Get incident by ID"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM incidents WHERE id = %s", (incident_id,))
        incident = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not incident:
            return jsonify({
                'success': False,
                'mensaje': 'Incidente no encontrado'
            }), 404
        
        # Convertir datetime a string
        for key in ['reported_at', 'resolved_at', 'created_at', 'updated_at']:
            if incident.get(key) and hasattr(incident[key], 'isoformat'):
                incident[key] = incident[key].isoformat()
        
        return jsonify({
            'success': True,
            'data': incident
        }), 200
        
    except Error as e:
        return jsonify({
            'success': False,
            'mensaje': f'Error en la base de datos: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'mensaje': f'Error al obtener incidente: {str(e)}'
        }), 500

@incidents_bp.route('', methods=['POST'])
def create_incident():
    """Create new incident"""
    try:
        data = request.get_json()
        
        if not data.get('incident_type'):
            return jsonify({
                'success': False,
                'mensaje': 'El tipo de incidente es requerido'
            }), 400
        
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor(dictionary=True)
        
        incident_id = str(uuid.uuid4())
        now = datetime.now()
        
        cursor.execute("""
            INSERT INTO incidents (
                id, incident_type, description, location, severity, status,
                reported_by, reported_at, fraccionamiento_id, created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            incident_id,
            data.get('incident_type'),
            data.get('description'),
            data.get('location'),
            data.get('severity', 'medium'),
            data.get('status', 'reported'),
            data.get('reported_by'),
            data.get('reported_at', now),
            data.get('fraccionamiento_id'),
            now,
            now
        ))
        
        conn.commit()
        
        # Obtener el incidente creado
        cursor.execute("SELECT * FROM incidents WHERE id = %s", (incident_id,))
        incident = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        # Convertir datetime a string
        for key in ['reported_at', 'resolved_at', 'created_at', 'updated_at']:
            if incident.get(key) and hasattr(incident[key], 'isoformat'):
                incident[key] = incident[key].isoformat()
        
        return jsonify({
            'success': True,
            'data': incident
        }), 201
        
    except Error as e:
        return jsonify({
            'success': False,
            'mensaje': f'Error en la base de datos: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'mensaje': f'Error al crear incidente: {str(e)}'
        }), 500

@incidents_bp.route('/<incident_id>', methods=['PUT'])
def update_incident(incident_id):
    """Update incident"""
    try:
        data = request.get_json()
        
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # Verificar que el incidente existe
        cursor.execute("SELECT * FROM incidents WHERE id = %s", (incident_id,))
        incident = cursor.fetchone()
        
        if not incident:
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'mensaje': 'Incidente no encontrado'
            }), 404
        
        # Construir query de actualización
        update_fields = []
        update_values = []
        
        allowed_fields = ['incident_type', 'description', 'location', 'severity', 
                        'status', 'resolved_at', 'resolution_notes']
        
        for field in allowed_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                update_values.append(data[field])
        
        if not update_fields:
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'mensaje': 'No hay campos para actualizar'
            }), 400
        
        update_fields.append("updated_at = %s")
        update_values.append(datetime.now())
        update_values.append(incident_id)
        
        query = f"UPDATE incidents SET {', '.join(update_fields)} WHERE id = %s"
        cursor.execute(query, update_values)
        
        conn.commit()
        
        # Obtener el incidente actualizado
        cursor.execute("SELECT * FROM incidents WHERE id = %s", (incident_id,))
        updated_incident = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        # Convertir datetime a string
        for key in ['reported_at', 'resolved_at', 'created_at', 'updated_at']:
            if updated_incident.get(key) and hasattr(updated_incident[key], 'isoformat'):
                updated_incident[key] = updated_incident[key].isoformat()
        
        return jsonify({
            'success': True,
            'data': updated_incident
        }), 200
        
    except Error as e:
        return jsonify({
            'success': False,
            'mensaje': f'Error en la base de datos: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'mensaje': f'Error al actualizar incidente: {str(e)}'
        }), 500

@incidents_bp.route('/<incident_id>', methods=['DELETE'])
def delete_incident(incident_id):
    """Delete incident"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor()
        cursor.execute("DELETE FROM incidents WHERE id = %s", (incident_id,))
        
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'mensaje': 'Incidente no encontrado'
            }), 404
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'mensaje': 'Incidente eliminado exitosamente'
        }), 200
        
    except Error as e:
        return jsonify({
            'success': False,
            'mensaje': f'Error en la base de datos: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'mensaje': f'Error al eliminar incidente: {str(e)}'
        }), 500

@incidents_bp.route('/stats/by-type', methods=['GET'])
def get_incidents_by_type():
    """Get incidents grouped by type"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
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
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': results
        }), 200
        
    except Error as e:
        return jsonify({
            'success': False,
            'mensaje': f'Error en la base de datos: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'mensaje': f'Error al obtener estadísticas: {str(e)}'
        }), 500

@incidents_bp.route('/stats', methods=['GET'])
def get_incident_stats():
    """Get general incident statistics"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'mensaje': 'Error de conexión a la base de datos'
            }), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # Obtener parámetros opcionales
        fraccionamiento_id = request.args.get('fraccionamiento_id')
        
        query = "SELECT * FROM incidents WHERE 1=1"
        params = []
        
        if fraccionamiento_id:
            query += " AND fraccionamiento_id = %s"
            params.append(fraccionamiento_id)
        
        cursor.execute(query, params)
        incidents = cursor.fetchall()
        
        # Calcular estadísticas
        stats = {
            'total': len(incidents),
            'by_status': {},
            'by_severity': {},
            'by_type': {}
        }
        
        for incident in incidents:
            # Por estado
            status = incident.get('status', 'reported')
            stats['by_status'][status] = stats['by_status'].get(status, 0) + 1
            
            # Por severidad
            severity = incident.get('severity', 'medium')
            stats['by_severity'][severity] = stats['by_severity'].get(severity, 0) + 1
            
            # Por tipo
            incident_type = incident.get('incident_type', 'otro')
            stats['by_type'][incident_type] = stats['by_type'].get(incident_type, 0) + 1
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': stats
        }), 200
        
    except Error as e:
        return jsonify({
            'success': False,
            'mensaje': f'Error en la base de datos: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'mensaje': f'Error al obtener estadísticas: {str(e)}'
        }), 500

