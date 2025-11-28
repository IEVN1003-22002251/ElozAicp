"""
History routes
"""
from flask import Blueprint, request, jsonify
from services.history_service import HistoryService
from utils.supabase_client import supabase

history_bp = Blueprint('history', __name__)
history_service = HistoryService(supabase)

@history_bp.route('', methods=['GET'])
def get_history():
    """Get access history"""
    try:
        user_id = request.args.get('user_id')
        fraccionamiento_id = request.args.get('fraccionamiento_id')
        
        if user_id:
            result = history_service.get_history_by_user(user_id)
        elif fraccionamiento_id:
            result = history_service.get_history_by_fraccionamiento(fraccionamiento_id)
        else:
            result = history_service.get_all_history()
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 400
        
        return jsonify({'success': True, 'data': result.get('data')}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

