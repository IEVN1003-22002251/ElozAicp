"""
Authentication routes
"""
from flask import Blueprint, request, jsonify
from services.auth_service import AuthService
from utils.supabase_client import supabase

auth_bp = Blueprint('auth', __name__)
auth_service = AuthService(supabase)

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email y contraseña son requeridos'}), 400
        
        result = auth_service.sign_in(email, password)
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 401
        
        return jsonify({
            'success': True,
            'user': result.get('user'),
            'profile': result.get('profile')
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """User logout endpoint"""
    return jsonify({'success': True, 'message': 'Sesión cerrada'}), 200

@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    """Get user profile"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id es requerido'}), 400
        
        result = auth_service.get_user_profile(user_id)
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 404
        
        return jsonify({'success': True, 'profile': result.get('data')}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Request password reset"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email es requerido'}), 400
        
        result = auth_service.request_password_reset(email)
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 400
        
        return jsonify({'success': True, 'message': 'Email de recuperación enviado'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

