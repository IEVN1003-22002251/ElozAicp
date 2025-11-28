# AICP Flask Backend API

Backend API para el sistema AICP desarrollado con Flask y MySQL (XAMPP).

## 🚀 Inicio Rápido

### Requisitos Previos
- Python 3.x
- XAMPP (MySQL)
- pip

### Instalación

1. **Crear entorno virtual:**
```bash
py -m venv venv
```

2. **Activar entorno virtual:**
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **Instalar dependencias:**
```bash
pip install -r requirements.txt
```

4. **Configurar base de datos:**
   - Iniciar XAMPP y activar MySQL
   - Abrir phpMyAdmin (http://localhost/phpmyadmin)
   - Importar el archivo `database.sql`

5. **Configurar variables de entorno:**
   - Crear archivo `.env` en la raíz del proyecto
   - Ver `ENV_EJEMPLO.md` para el formato

6. **Ejecutar aplicación:**
```bash
cd src
py app.py
```

La API estará disponible en `http://localhost:5000`

## 📁 Estructura del Proyecto

```
Flask/
├── src/
│   ├── app.py          # Aplicación principal
│   └── config.py       # Configuración
├── database.sql        # Script de creación de BD
├── requirements.txt    # Dependencias Python
├── .env                # Variables de entorno (crear)
└── README.md
```

## 🔧 Configuración

### Variables de Entorno (.env)

```env
SECRET_KEY=tu-clave-secreta-aqui
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=aicp_db
MYSQL_PORT=3306
CORS_ORIGINS=http://localhost:4200
```

## 📡 Endpoints Disponibles

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/profile?user_id=xxx` - Obtener perfil

### Visitantes
- `GET /api/visitors` - Listar visitantes
- `GET /api/visitors/:id` - Obtener visitante
- `POST /api/visitors` - Crear visitante
- `PUT /api/visitors/:id` - Actualizar visitante
- `DELETE /api/visitors/:id` - Eliminar visitante

### Registros
- `GET /api/registrations` - Listar registros pendientes
- `POST /api/registrations` - Crear registro
- `PUT /api/registrations/:id/approve` - Aprobar registro
- `PUT /api/registrations/:id/reject` - Rechazar registro

## 🗄️ Base de Datos

La base de datos se crea ejecutando `database.sql` en MySQL. Incluye las siguientes tablas:
- `profiles` - Perfiles de usuario
- `visitors` - Visitantes
- `pending_registrations` - Registros pendientes
- `notifications` - Notificaciones
- `chat_messages` - Mensajes de chat
- `banners` - Banners
- `house_access` - Historial de accesos

## 📝 Notas

- Usa MySQL a través de XAMPP
- El archivo `.env` debe estar en la raíz del proyecto Flask
- La aplicación se ejecuta desde `src/app.py`
- CORS está configurado para `http://localhost:4200`

## 🔗 Repositorio

Este es un repositorio independiente del frontend Angular.
