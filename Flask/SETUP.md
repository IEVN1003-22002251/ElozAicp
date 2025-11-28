# Guía de Configuración - Flask Backend

## Problemas Comunes y Soluciones

### Error: "no se encontró Python"

**Solución:** Usa `py` en lugar de `python`:
```bash
py --version
py -m venv venv
```

### Error: "No se encuentra la ruta de acceso"

**Solución:** Asegúrate de estar en el directorio correcto:
```bash
cd C:\Users\Armando\Documents\GitHub\aicp-flask-backend
```

## Instalación Paso a Paso

### Opción 1: Usando el script start.bat (Recomendado)

1. Navega a la carpeta del proyecto:
```bash
cd C:\Users\Armando\Documents\GitHub\aicp-flask-backend
```

2. Ejecuta el script:
```bash
start.bat
```

### Opción 2: Manual

1. Navega a la carpeta:
```bash
cd C:\Users\Armando\Documents\GitHub\aicp-flask-backend
```

2. Crea el entorno virtual:
```bash
py -m venv venv
```

3. Activa el entorno virtual:
```bash
venv\Scripts\activate
```

4. Instala las dependencias:
```bash
pip install -r requirements.txt
```

5. Crea el archivo `.env` en la raíz del proyecto:
```env
SECRET_KEY=tu-clave-secreta-aqui
SUPABASE_URL=https://rztujimmihjfwaahfkgu.supabase.co
SUPABASE_KEY=tu-clave-supabase-aqui
CORS_ORIGINS=http://localhost:4200
```

6. Ejecuta la aplicación:
```bash
cd src
py app.py
```

## Verificar Instalación

```bash
# Verificar Python
py --version

# Verificar pip
pip --version

# Verificar que el entorno virtual está activo
# Deberías ver (venv) al inicio de la línea de comandos
```

## Solución de Problemas

### Si `py` no funciona:
- Instala Python desde [python.org](https://www.python.org/downloads/)
- Durante la instalación, marca la opción "Add Python to PATH"

### Si `pip` no funciona:
```bash
py -m pip --version
py -m pip install -r requirements.txt
```

### Si hay errores de importación:
```bash
# Asegúrate de que el entorno virtual está activo
venv\Scripts\activate

# Reinstala las dependencias
pip install -r requirements.txt --force-reinstall
```

