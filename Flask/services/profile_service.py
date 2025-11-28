"""
Profile service
"""
from typing import Dict
from supabase import Client

class ProfileService:
    """Service for profile operations"""
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
    
    def get_profile_by_id(self, profile_id: str) -> Dict:
        """Get profile by ID"""
        try:
            response = self.supabase.table('profiles').select('*').eq('id', profile_id).maybe_single().execute()
            
            if not response.data:
                return {'error': 'Perfil no encontrado'}
            
            return {'data': response.data}
        except Exception as e:
            return {'error': str(e)}
    
    def update_profile(self, profile_id: str, updates: Dict) -> Dict:
        """Update profile"""
        try:
            response = self.supabase.table('profiles').update(updates).eq('id', profile_id).execute()
            
            if not response.data:
                return {'error': 'Perfil no encontrado'}
            
            return {'data': response.data[0] if response.data else None}
        except Exception as e:
            return {'error': str(e)}

