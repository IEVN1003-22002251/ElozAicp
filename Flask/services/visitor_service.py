"""
Visitor service
"""
from typing import Dict, List, Optional
from supabase import Client

class VisitorService:
    """Service for visitor operations"""
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
    
    def get_all_visitors(self) -> Dict:
        """Get all visitors"""
        try:
            response = self.supabase.table('visitors').select('*').execute()
            return {'data': response.data}
        except Exception as e:
            return {'error': str(e)}
    
    def get_visitor_by_id(self, visitor_id: str) -> Dict:
        """Get visitor by ID"""
        try:
            response = self.supabase.table('visitors').select('*').eq('id', visitor_id).maybe_single().execute()
            
            if not response.data:
                return {'error': 'Visitante no encontrado'}
            
            return {'data': response.data}
        except Exception as e:
            return {'error': str(e)}
    
    def get_visitors_by_user(self, user_id: str) -> Dict:
        """Get visitors by creator/user ID"""
        try:
            response = self.supabase.table('visitors').select('*').eq('created_by', user_id).execute()
            return {'data': response.data}
        except Exception as e:
            return {'error': str(e)}
    
    def get_visitors_by_status(self, status: str) -> Dict:
        """Get visitors by status"""
        try:
            response = self.supabase.table('visitors').select('*').eq('status', status).execute()
            return {'data': response.data}
        except Exception as e:
            return {'error': str(e)}
    
    def get_visitors_by_type(self, visitor_type: str) -> Dict:
        """Get visitors by type"""
        try:
            response = self.supabase.table('visitors').select('*').eq('type', visitor_type).execute()
            return {'data': response.data}
        except Exception as e:
            return {'error': str(e)}
    
    def search_visitors(self, search_term: str) -> Dict:
        """Search visitors by name, email, or phone"""
        try:
            # Supabase doesn't support full-text search directly, so we'll filter by name
            response = self.supabase.table('visitors').select('*').ilike('name', f'%{search_term}%').execute()
            return {'data': response.data}
        except Exception as e:
            return {'error': str(e)}
    
    def create_visitor(self, visitor_data: Dict) -> Dict:
        """Create new visitor"""
        try:
            response = self.supabase.table('visitors').insert(visitor_data).execute()
            
            if not response.data:
                return {'error': 'Error al crear visitante'}
            
            return {'data': response.data[0] if response.data else None}
        except Exception as e:
            return {'error': str(e)}
    
    def update_visitor(self, visitor_id: str, updates: Dict) -> Dict:
        """Update visitor"""
        try:
            response = self.supabase.table('visitors').update(updates).eq('id', visitor_id).execute()
            
            if not response.data:
                return {'error': 'Visitante no encontrado'}
            
            return {'data': response.data[0] if response.data else None}
        except Exception as e:
            return {'error': str(e)}
    
    def delete_visitor(self, visitor_id: str) -> Dict:
        """Delete visitor"""
        try:
            response = self.supabase.table('visitors').delete().eq('id', visitor_id).execute()
            return {'success': True}
        except Exception as e:
            return {'error': str(e)}
    
    def get_visitor_statistics(self) -> Dict:
        """Get visitor statistics"""
        try:
            # Get all visitors to calculate stats
            all_visitors = self.supabase.table('visitors').select('status, type').execute()
            
            visitors = all_visitors.data if all_visitors.data else []
            
            stats = {
                'total': len(visitors),
                'by_status': {},
                'by_type': {}
            }
            
            for visitor in visitors:
                # Count by status
                status = visitor.get('status', 'unknown')
                stats['by_status'][status] = stats['by_status'].get(status, 0) + 1
                
                # Count by type
                visitor_type = visitor.get('type', 'unknown')
                stats['by_type'][visitor_type] = stats['by_type'].get(visitor_type, 0) + 1
            
            return {'data': stats}
        except Exception as e:
            return {'error': str(e)}

