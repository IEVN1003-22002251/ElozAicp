# Diagnóstico de Errores en Banners

## 🔴 Errores Actuales

1. **Error 500 al cargar banners** (GET /api/banners)
2. **Error 400 al crear recado** (POST /api/banners)

## 🔍 Análisis

### Error 400 (BAD REQUEST)
Significa que el backend está rechazando los datos enviados. Posibles causas:

1. **Campos faltantes o inválidos**
   - El backend espera campos que no se están enviando
   - Los nombres de los campos no coinciden

2. **Validación fallida**
   - El backend tiene validaciones que están fallando
   - Formato de datos incorrecto

3. **Problema con la base de datos**
   - La tabla `banners` no existe
   - Error en la consulta SQL

### Error 500 (INTERNAL SERVER ERROR)
Significa que hay un error en el código del backend. Posibles causas:

1. **Error de conexión a la base de datos**
2. **Error en la consulta SQL**
3. **La tabla no existe**

## ✅ Solución Paso a Paso

### Paso 1: Verificar la Tabla en la Base de Datos

Ejecuta en MySQL:
```sql
-- Verificar que la tabla existe
SHOW TABLES LIKE 'banners';

-- Ver estructura
DESCRIBE banners;

-- Si no existe, crear la tabla
SOURCE CREATE_TABLE_BANNERS.sql;
-- O ejecuta el contenido de CREATE_TABLE_BANNERS.sql
```

### Paso 2: Verificar el Formato de Datos

El frontend envía:
```json
{
  "title": "Título del recado",
  "description": "Descripción del recado",
  "is_active": true,
  "order": 0,
  "cta_text": "Texto opcional",
  "cta_url": "URL opcional"
}
```

**Verifica en el backend que:**
- Acepta estos nombres de campos exactamente
- `is_active` es boolean (no string "true"/"false")
- `order` es integer (no string)

### Paso 3: Revisar los Logs del Backend

En la terminal donde corre Flask, deberías ver el error exacto. Busca:
- Errores de SQL
- Errores de validación
- Errores de conexión

### Paso 4: Probar el Endpoint Manualmente

Usa Postman o curl para probar:

```bash
# Probar GET
curl http://localhost:5000/api/banners

# Probar POST
curl -X POST http://localhost:5000/api/banners \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "description": "Test description",
    "is_active": true,
    "order": 0
  }'
```

## 🛠️ Código de Ejemplo para Backend (Verificación)

Asegúrate de que tu backend tenga algo como esto:

```python
@app.route('/api/banners', methods=['POST'])
def create_banner():
    try:
        data = request.get_json()
        
        # Debug: imprimir lo que recibe
        print("Datos recibidos:", data)
        
        # Validaciones básicas
        if not data:
            return jsonify({
                'exito': False,
                'mensaje': 'No se recibieron datos'
            }), 400
        
        if not data.get('title'):
            return jsonify({
                'exito': False,
                'mensaje': 'El campo title es requerido'
            }), 400
        
        if not data.get('description'):
            return jsonify({
                'exito': False,
                'mensaje': 'El campo description es requerido'
            }), 400
        
        # Conectar a BD y crear
        # ... tu código aquí ...
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'exito': False,
            'mensaje': f'Error: {str(e)}'
        }), 500
```

## 📋 Checklist de Verificación

- [ ] La tabla `banners` existe en la base de datos
- [ ] El backend está corriendo en el puerto 5000
- [ ] CORS está configurado correctamente
- [ ] El endpoint `/api/banners` está implementado
- [ ] Los nombres de campos coinciden (title, description, is_active, order)
- [ ] Los tipos de datos son correctos (string, boolean, integer)
- [ ] La conexión a la base de datos funciona
- [ ] Los logs del backend muestran el error específico

## 🔧 Próximos Pasos

1. **Abre la consola del navegador (F12)**
   - Ve a la pestaña "Network"
   - Intenta crear un recado
   - Haz clic en la petición `/api/banners`
   - Ve a la pestaña "Response" para ver el mensaje exacto del servidor

2. **Revisa los logs del backend Flask**
   - Deberías ver el error exacto que está ocurriendo
   - Copia el mensaje de error completo

3. **Comparte el mensaje de error**
   - El mensaje del servidor en la respuesta HTTP
   - El error en los logs de Flask
   - Así podremos identificar el problema exacto

