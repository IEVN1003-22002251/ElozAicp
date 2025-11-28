"""
Visitors routes
"""
from flask import Blueprint, request, jsonify
from services.visitor_service import VisitorService
from utils.supabase_client import supabase

visitors_bp = Blueprint('visitors', __name__)
visitor_service = VisitorService(supabase)

@visitors_bp.route('', methods=['GET'])
def get_visitors():
    """Get all visitors"""
    try:
        user_id = request.args.get('user_id')
        status = request.args.get('status')
        visitor_type = request.args.get('type')
        search = request.args.get('search')
        
        if user_id:
            result = visitor_service.get_visitors_by_user(user_id)
        elif status:
            result = visitor_service.get_visitors_by_status(status)
        elif visitor_type:
            result = visitor_service.get_visitors_by_type(visitor_type)
        elif search:
            result = visitor_service.search_visitors(search)
        else:
            result = visitor_service.get_all_visitors()
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 400
        
        return jsonify({'success': True, 'data': result.get('data')}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@visitors_bp.route('/<visitor_id>', methods=['GET'])
def get_visitor(visitor_id):
    """Get visitor by ID"""
    try:
        result = visitor_service.get_visitor_by_id(visitor_id)
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 404
        
        return jsonify({'success': True, 'data': result.get('data')}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@visitors_bp.route('', methods=['POST'])
def create_visitor():
    """Create new visitor"""
    try:
        data = request.get_json()
        result = visitor_service.create_visitor(data)
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 400
        
        return jsonify({'success': True, 'data': result.get('data')}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@visitors_bp.route('/<visitor_id>', methods=['PUT'])
def update_visitor(visitor_id):
    """Update visitor"""
    try:
        data = request.get_json()
        result = visitor_service.update_visitor(visitor_id, data)
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 400
        
        return jsonify({'success': True, 'data': result.get('data')}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@visitors_bp.route('/<visitor_id>', methods=['DELETE'])
def delete_visitor(visitor_id):
    """Delete visitor"""
    try:
        result = visitor_service.delete_visitor(visitor_id)
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 400
        
        return jsonify({'success': True, 'message': 'Visitante eliminado'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@visitors_bp.route('/stats', methods=['GET'])
def get_visitor_stats():
    """Get visitor statistics"""
    try:
        result = visitor_service.get_visitor_statistics()
        
        if result.get('error'):
            return jsonify({'error': result['error']}), 400
        
        return jsonify({'success': True, 'data': result.get('data')}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

