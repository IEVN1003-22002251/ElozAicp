"""
Registrations routes
"""
from flask import Blueprint, request, jsonify
from services.registration_service import RegistrationService
from utils.supabase_client import supabase

registrations_bp = Blueprint('registrations', __name__)
registration_service = RegistrationService(supabase)

@registrations_bp.route('', methods=['GET'])
def get_pending_registrations():
    """Get all pending registrations"""
    try:
        result = registration_service.get_all_pending_registrations()
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 400
        
        return jsonify({'success': True, 'data': result.get('data')}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@registrations_bp.route('/<registration_id>', methods=['GET'])
def get_registration(registration_id):
    """Get registration by ID"""
    try:
        result = registration_service.get_registration_by_id(registration_id)
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 404
        
        return jsonify({'success': True, 'data': result.get('data')}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@registrations_bp.route('', methods=['POST'])
def create_registration():
    """Create new registration request"""
    try:
        data = request.get_json()
        result = registration_service.create_registration(data)
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 400
        
        return jsonify({'success': True, 'data': result.get('data')}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@registrations_bp.route('/<registration_id>/approve', methods=['PUT'])
def approve_registration(registration_id):
    """Approve registration"""
    try:
        result = registration_service.approve_registration(registration_id)
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 400
        
        return jsonify({'success': True, 'data': result.get('data')}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@registrations_bp.route('/<registration_id>/reject', methods=['PUT'])
def reject_registration(registration_id):
    """Reject registration"""
    try:
        data = request.get_json()
        reason = data.get('reason', '')
        
        result = registration_service.reject_registration(registration_id, reason)
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 400
        
        return jsonify({'success': True, 'message': 'Registro rechazado'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@registrations_bp.route('/stats', methods=['GET'])
def get_registration_stats():
    """Get registration statistics"""
    try:
        result = registration_service.get_registration_statistics()
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 400
        
        return jsonify({'success': True, 'data': result.get('data')}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

