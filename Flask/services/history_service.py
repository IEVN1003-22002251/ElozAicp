"""
History service
"""
from typing import Dict
from supabase import Client

class HistoryService:
    """Service for history operations"""
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
    
    def get_all_history(self) -> Dict:
        """Get all access history"""
        try:
            response = self.supabase.table('house_access').select('*').order('created_at', desc=True).execute()
            return {'data': response.data}
        except Exception as e:
            return {'error': str(e)}
    
    def get_history_by_user(self, user_id: str) -> Dict:
        """Get history by user ID"""
        try:
            response = self.supabase.table('house_access').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
            return {'data': response.data}
        except Exception as e:
            return {'error': str(e)}
    
    def get_history_by_fraccionamiento(self, fraccionamiento_id: str) -> Dict:
        """Get history by fraccionamiento ID"""
        try:
            response = self.supabase.table('house_access').select('*').eq('fraccionamiento_id', fraccionamiento_id).order('created_at', desc=True).execute()
            return {'data': response.data}
        except Exception as e:
            return {'error': str(e)}

