"""
Authentication service
"""
from typing import Dict, Optional
from supabase import Client

class AuthService:
    """Service for authentication operations"""
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
    
    def sign_in(self, email: str, password: str) -> Dict:
        """Sign in user with email and password"""
        try:
            # Query profile from Supabase
            response = self.supabase.table('profiles').select('*').eq('email', email).maybe_single().execute()
            
            if not response.data:
                return {'error': 'Usuario no encontrado'}
            
            profile = response.data
            
            # Validate password (in production, use hashed passwords)
            if not profile.get('password') or profile['password'] != password:
                return {'error': 'Contraseña incorrecta'}
            
            return {
                'user': {
                    'id': profile['id'],
                    'email': profile['email']
                },
                'profile': profile
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def get_user_profile(self, user_id: str) -> Dict:
        """Get user profile by ID"""
        try:
            response = self.supabase.table('profiles').select('*').eq('id', user_id).maybe_single().execute()
            
            if not response.data:
                return {'error': 'Perfil no encontrado'}
            
            return {'data': response.data}
            
        except Exception as e:
            return {'error': str(e)}
    
    def request_password_reset(self, email: str) -> Dict:
        """Request password reset"""
        try:
            # Check if user exists
            response = self.supabase.table('profiles').select('id, email').eq('email', email).maybe_single().execute()
            
            if not response.data:
                return {'error': 'Usuario no encontrado'}
            
            # TODO: Implement email sending logic
            # For now, just return success
            return {'success': True, 'message': 'Email de recuperación enviado'}
            
        except Exception as e:
            return {'error': str(e)}

