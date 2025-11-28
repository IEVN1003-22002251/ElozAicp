"""
Routes package - Register all API routes
"""
from flask import Blueprint
from routes.auth import auth_bp
from routes.visitors import visitors_bp
from routes.registrations import registrations_bp
from routes.profiles import profiles_bp
from routes.notifications import notifications_bp
from routes.chat import chat_bp
from routes.banners import banners_bp
from routes.history import history_bp

def register_routes(app):
    """Register all blueprints"""
    # API prefix
    api_prefix = '/api'
    
    app.register_blueprint(auth_bp, url_prefix=f'{api_prefix}/auth')
    app.register_blueprint(visitors_bp, url_prefix=f'{api_prefix}/visitors')
    app.register_blueprint(registrations_bp, url_prefix=f'{api_prefix}/registrations')
    app.register_blueprint(profiles_bp, url_prefix=f'{api_prefix}/profiles')
    app.register_blueprint(notifications_bp, url_prefix=f'{api_prefix}/notifications')
    app.register_blueprint(chat_bp, url_prefix=f'{api_prefix}/chat')
    app.register_blueprint(banners_bp, url_prefix=f'{api_prefix}/banners')
    app.register_blueprint(history_bp, url_prefix=f'{api_prefix}/history')

