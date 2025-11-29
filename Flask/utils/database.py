"""
Database utility functions
"""
from flask import current_app
import mysql.connector
from mysql.connector import Error

def get_connection():
    """Get MySQL database connection"""
    try:
        # Importar app para acceder a la configuración
        from src.app import app
        
        connection = mysql.connector.connect(
            host=app.config['MYSQL_HOST'],
            user=app.config['MYSQL_USER'],
            password=app.config['MYSQL_PASSWORD'],
            database=app.config['MYSQL_DATABASE'],
            port=app.config.get('MYSQL_PORT', 3306)
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

