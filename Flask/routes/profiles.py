"""
Profiles routes
"""
from flask import Blueprint, request, jsonify
from services.profile_service import ProfileService
from utils.supabase_client import supabase

profiles_bp = Blueprint('profiles', __name__)
profile_service = ProfileService(supabase)

@profiles_bp.route('/<profile_id>', methods=['GET'])
def get_profile(profile_id):
    """Get profile by ID"""
    try:
        result = profile_service.get_profile_by_id(profile_id)
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 404
        
        return jsonify({'success': True, 'data': result.get('data')}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profiles_bp.route('/<profile_id>', methods=['PUT'])
def update_profile(profile_id):
    """Update profile"""
    try:
        data = request.get_json()
        result = profile_service.update_profile(profile_id, data)
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 400
        
        return jsonify({'success': True, 'data': result.get('data')}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

