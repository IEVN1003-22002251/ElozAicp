"""
Chat routes
"""
from flask import Blueprint, request, jsonify
from services.chat_service import ChatService
from utils.supabase_client import supabase

chat_bp = Blueprint('chat', __name__)
chat_service = ChatService(supabase)

@chat_bp.route('/messages', methods=['GET'])
def get_messages():
    """Get chat messages"""
    try:
        fraccionamiento_id = request.args.get('fraccionamiento_id')
        if not fraccionamiento_id:
            return jsonify({'error': 'fraccionamiento_id es requerido'}), 400
        
        result = chat_service.get_messages(fraccionamiento_id)
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 400
        
        return jsonify({'success': True, 'data': result.get('data')}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/messages', methods=['POST'])
def send_message():
    """Send chat message"""
    try:
        data = request.get_json()
        result = chat_service.send_message(data)
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 400
        
        return jsonify({'success': True, 'data': result.get('data')}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

