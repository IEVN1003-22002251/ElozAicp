"""
Registration service
"""
from typing import Dict
from supabase import Client
from datetime import datetime

class RegistrationService:
    """Service for registration operations"""
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
    
    def get_all_pending_registrations(self) -> Dict:
        """Get all pending registrations"""
        try:
            response = self.supabase.table('pending_registrations').select('*').eq('status', 'pending').execute()
            return {'data': response.data}
        except Exception as e:
            return {'error': str(e)}
    
    def get_registration_by_id(self, registration_id: str) -> Dict:
        """Get registration by ID"""
        try:
            response = self.supabase.table('pending_registrations').select('*').eq('id', registration_id).maybe_single().execute()
            
            if not response.data:
                return {'error': 'Registro no encontrado'}
            
            return {'data': response.data}
        except Exception as e:
            return {'error': str(e)}
    
    def create_registration(self, registration_data: Dict) -> Dict:
        """Create new registration request"""
        try:
            registration_data['status'] = 'pending'
            registration_data['created_at'] = datetime.utcnow().isoformat()
            
            response = self.supabase.table('pending_registrations').insert(registration_data).execute()
            
            if not response.data:
                return {'error': 'Error al crear registro'}
            
            return {'data': response.data[0] if response.data else None}
        except Exception as e:
            return {'error': str(e)}
    
    def approve_registration(self, registration_id: str) -> Dict:
        """Approve registration and create profile"""
        try:
            # Get the registration
            reg_response = self.supabase.table('pending_registrations').select('*').eq('id', registration_id).maybe_single().execute()
            
            if not reg_response.data:
                return {'error': 'Registro no encontrado'}
            
            registration = reg_response.data
            
            # Create profile from registration
            profile_data = {
                'name': registration.get('full_name'),
                'user_name': registration.get('user_name'),
                'email': registration.get('email'),
                'password': registration.get('password'),  # Password en texto plano
                'role': registration.get('role', 'resident'),
                'fraccionamiento_id': registration.get('fraccionamiento_id'),
                'created_at': datetime.utcnow().isoformat()
            }
            
            # Insert into profiles
            profile_response = self.supabase.table('profiles').insert(profile_data).execute()
            
            if not profile_response.data:
                return {'error': 'Error al crear perfil'}
            
            # Update registration status
            self.supabase.table('pending_registrations').update({'status': 'approved'}).eq('id', registration_id).execute()
            
            return {'data': profile_response.data[0] if profile_response.data else None}
            
        except Exception as e:
            return {'error': str(e)}
    
    def reject_registration(self, registration_id: str, reason: str = '') -> Dict:
        """Reject registration"""
        try:
            update_data = {
                'status': 'rejected',
                'rejection_reason': reason,
                'updated_at': datetime.utcnow().isoformat()
            }
            
            response = self.supabase.table('pending_registrations').update(update_data).eq('id', registration_id).execute()
            
            if not response.data:
                return {'error': 'Registro no encontrado'}
            
            return {'success': True}
        except Exception as e:
            return {'error': str(e)}
    
    def get_registration_statistics(self) -> Dict:
        """Get registration statistics"""
        try:
            response = self.supabase.table('pending_registrations').select('status').execute()
            
            registrations = response.data if response.data else []
            
            stats = {
                'total': len(registrations),
                'pending': 0,
                'approved': 0,
                'rejected': 0
            }
            
            for reg in registrations:
                status = reg.get('status', 'pending')
                if status in stats:
                    stats[status] += 1
            
            return {'data': stats}
        except Exception as e:
            return {'error': str(e)}

