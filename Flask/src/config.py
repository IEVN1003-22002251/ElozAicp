"""
Configuration settings for Flask application
"""
import os
from dotenv import load_dotenv

# Load environment variables from parent directory
import sys
from pathlib import Path
parent_dir = Path(__file__).parent.parent
env_path = parent_dir / '.env'
load_dotenv(dotenv_path=env_path)

class DevelopmentConfig:
    """Development configuration"""
    DEBUG = True
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # MySQL Configuration (XAMPP)
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', '')
    MYSQL_DATABASE = os.getenv('MYSQL_DATABASE', 'aicp_db')
    MYSQL_PORT = int(os.getenv('MYSQL_PORT', 3306))
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:4200').split(',')

class ProductionConfig:
    """Production configuration"""
    DEBUG = False
    SECRET_KEY = os.getenv('SECRET_KEY')
    MYSQL_HOST = os.getenv('MYSQL_HOST')
    MYSQL_USER = os.getenv('MYSQL_USER')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')
    MYSQL_DATABASE = os.getenv('MYSQL_DATABASE')
    MYSQL_PORT = int(os.getenv('MYSQL_PORT', 3306))
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '').split(',')

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig
}

