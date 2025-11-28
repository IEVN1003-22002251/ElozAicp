"""
Notification service
"""
from typing import Dict
from supabase import Client

class NotificationService:
    """Service for notification operations"""
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
    
    def get_notifications_by_user(self, user_id: str) -> Dict:
        """Get notifications for user"""
        try:
            response = self.supabase.table('notifications').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
            return {'data': response.data}
        except Exception as e:
            return {'error': str(e)}
    
    def mark_as_read(self, notification_id: str) -> Dict:
        """Mark notification as read"""
        try:
            response = self.supabase.table('notifications').update({'read': True}).eq('id', notification_id).execute()
            return {'success': True}
        except Exception as e:
            return {'error': str(e)}

