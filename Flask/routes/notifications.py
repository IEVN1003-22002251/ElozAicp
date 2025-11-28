"""
Notifications routes
"""
from flask import Blueprint, request, jsonify
from services.notification_service import NotificationService
from utils.supabase_client import supabase

notifications_bp = Blueprint('notifications', __name__)
notification_service = NotificationService(supabase)

@notifications_bp.route('', methods=['GET'])
def get_notifications():
    """Get notifications for user"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id es requerido'}), 400
        
        result = notification_service.get_notifications_by_user(user_id)
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 400
        
        return jsonify({'success': True, 'data': result.get('data')}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/<notification_id>/read', methods=['PUT'])
def mark_as_read(notification_id):
    """Mark notification as read"""
    try:
        result = notification_service.mark_as_read(notification_id)
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 400
        
        return jsonify({'success': True}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

