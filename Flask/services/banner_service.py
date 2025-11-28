"""
Banner service
"""
from typing import Dict, Optional
from supabase import Client
from datetime import datetime

class BannerService:
    """Service for banner operations"""
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
    
    def get_active_banners(self, fraccionamiento_id: Optional[str] = None) -> Dict:
        """Get active banners"""
        try:
            query = self.supabase.table('banners').select('*').eq('active', True)
            
            if fraccionamiento_id:
                query = query.eq('fraccionamiento_id', fraccionamiento_id)
            
            response = query.execute()
            return {'data': response.data}
        except Exception as e:
            return {'error': str(e)}
    
    def create_banner(self, banner_data: Dict) -> Dict:
        """Create new banner"""
        try:
            banner_data['created_at'] = datetime.utcnow().isoformat()
            banner_data['active'] = banner_data.get('active', True)
            
            response = self.supabase.table('banners').insert(banner_data).execute()
            
            if not response.data:
                return {'error': 'Error al crear banner'}
            
            return {'data': response.data[0] if response.data else None}
        except Exception as e:
            return {'error': str(e)}

