# Configuración de Variables de Entorno

Copia el archivo `.env.example` a `.env` y configura las siguientes variables:

```bash
cp .env.example .env
```

## Variables Requeridas

1. **SECRET_KEY**: Clave secreta para Flask (genera una nueva para producción)
2. **SUPABASE_URL**: URL de tu proyecto Supabase
3. **SUPABASE_KEY**: Clave API de Supabase
4. **CORS_ORIGINS**: Orígenes permitidos para CORS (separados por comas)
   - Ejemplo: `http://localhost:4200,http://localhost:3000`

## Ejemplo de .env

```env
FLASK_APP=app.py
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=tu-clave-secreta-aqui

SUPABASE_URL=https://rztujimmihjfwaahfkgu.supabase.co
SUPABASE_KEY=tu-clave-supabase-aqui

CORS_ORIGINS=http://localhost:4200

PORT=5000
HOST=0.0.0.0
```

