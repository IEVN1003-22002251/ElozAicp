# Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto Flask (`AICP_V2\Flask\.env`) con el siguiente contenido:

```env
# Flask Configuration
SECRET_KEY=tu-clave-secreta-aqui-cambiar-en-produccion
FLASK_ENV=development
FLASK_DEBUG=True

# MySQL Configuration (XAMPP)
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=aicp_db
MYSQL_PORT=3306

# CORS Configuration
CORS_ORIGINS=http://localhost:4200
```

## Pasos para Configurar

1. **Instalar XAMPP** si no lo tienes instalado
2. **Iniciar MySQL** desde el panel de control de XAMPP
3. **Crear la base de datos**:
   - Abre phpMyAdmin (http://localhost/phpmyadmin)
   - Importa el archivo `database.sql` que está en la carpeta Flask
   - O ejecuta el SQL manualmente

4. **Crear el archivo `.env`** en `Flask/` con las credenciales de MySQL

## Nota sobre la Contraseña de MySQL

Por defecto, XAMPP tiene la contraseña de MySQL vacía. Si configuraste una contraseña, actualízala en el archivo `.env`.

