"""
Chat service
"""
from typing import Dict
from supabase import Client
from datetime import datetime

class ChatService:
    """Service for chat operations"""
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
    
    def get_messages(self, fraccionamiento_id: str) -> Dict:
        """Get chat messages for fraccionamiento"""
        try:
            response = self.supabase.table('chat_messages').select('*').eq('fraccionamiento_id', fraccionamiento_id).order('created_at', desc=False).execute()
            return {'data': response.data}
        except Exception as e:
            return {'error': str(e)}
    
    def send_message(self, message_data: Dict) -> Dict:
        """Send chat message"""
        try:
            message_data['created_at'] = datetime.utcnow().isoformat()
            
            response = self.supabase.table('chat_messages').insert(message_data).execute()
            
            if not response.data:
                return {'error': 'Error al enviar mensaje'}
            
            return {'data': response.data[0] if response.data else None}
        except Exception as e:
            return {'error': str(e)}

