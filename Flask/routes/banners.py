"""
Banners routes
"""
from flask import Blueprint, request, jsonify
from services.banner_service import BannerService
from utils.supabase_client import supabase

banners_bp = Blueprint('banners', __name__)
banner_service = BannerService(supabase)

@banners_bp.route('', methods=['GET'])
def get_banners():
    """Get active banners"""
    try:
        fraccionamiento_id = request.args.get('fraccionamiento_id')
        result = banner_service.get_active_banners(fraccionamiento_id)
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 400
        
        return jsonify({'success': True, 'data': result.get('data')}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@banners_bp.route('', methods=['POST'])
def create_banner():
    """Create new banner"""
    try:
        data = request.get_json()
        result = banner_service.create_banner(data)
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 400
        
        return jsonify({'success': True, 'data': result.get('data')}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

