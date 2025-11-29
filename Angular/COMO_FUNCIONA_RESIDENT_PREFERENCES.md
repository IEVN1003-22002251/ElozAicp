# 📖 Cómo Funciona la Tabla `resident_preferences`

## 🎯 Propósito

La tabla `resident_preferences` almacena las preferencias de cada residente sobre si **acepta o no acepta**:
- **Visitas** (visitantes)
- **Personal** (trabajadores, proveedores, etc.)

Estas preferencias se actualizan desde la aplicación móvil cuando el residente toca los botones en la pantalla de inicio.

## 🗄️ Estructura de la Tabla

```sql
resident_preferences
├── id (INT) - Identificador único del registro
├── user_id (INT) - ID del residente (referencia a profiles.id)
├── accepts_visitors (BOOLEAN) - ¿Acepta visitas? (FALSE por defecto)
├── accepts_personnel (BOOLEAN) - ¿Acepta personal? (TRUE por defecto)
├── created_at (TIMESTAMP) - Cuándo se creó el registro
└── updated_at (TIMESTAMP) - Cuándo se actualizó por última vez
```

## 🔗 Relación con Otras Tablas

```
profiles (tabla de usuarios)
    │
    ├── id: 2 (Juan Pérez, resident)
    ├── id: 4 (Melissa Meraz, resident)
    └── id: 5 (Alan, resident)
         │
         └── resident_preferences
              ├── user_id: 2 → accepts_visitors: false, accepts_personnel: true
              ├── user_id: 4 → accepts_visitors: true, accepts_personnel: false
              └── user_id: 5 → accepts_visitors: true, accepts_personnel: true
```

**Regla importante:** Solo los usuarios con `role = 'resident'` en la tabla `profiles` pueden tener preferencias.

## 🔄 Flujo de Funcionamiento

### 1. **Al Abrir la App (Carga Inicial)**

```
Usuario abre la app
    ↓
App verifica autenticación
    ↓
App llama: GET /api/resident-preferences?user_id=2
    ↓
Backend busca en BD:
    - Si existe registro → devuelve los valores guardados
    - Si NO existe → devuelve valores por defecto
    ↓
App muestra los botones según el estado:
    - Botón VISITAS: Rojo (desactivado) o Turquesa (activado)
    - Botón PERSONAL: Rojo (desactivado) o Turquesa (activado)
```

**Ejemplo de respuesta si existe:**
```json
{
    "exito": true,
    "data": {
        "user_id": 2,
        "accepts_visitors": false,  // ← Botón VISITAS en rojo
        "accepts_personnel": true    // ← Botón PERSONAL en turquesa
    }
}
```

**Ejemplo si NO existe (valores por defecto):**
```json
{
    "exito": true,
    "data": {
        "user_id": 2,
        "accepts_visitors": false,  // ← Por defecto: NO acepta visitas
        "accepts_personnel": true   // ← Por defecto: SÍ acepta personal
    }
}
```

### 2. **Cuando el Residente Toca un Botón**

#### Escenario A: Residente activa "VISITAS"

```
Usuario toca botón VISITAS (estaba en rojo/desactivado)
    ↓
App cambia estado local: isVisitorsActive = true
    ↓
App llama: PUT /api/resident-preferences/visitors
    Body: { "user_id": 2, "accepts_visitors": true }
    ↓
Backend actualiza BD:
    UPDATE resident_preferences 
    SET accepts_visitors = TRUE, updated_at = NOW()
    WHERE user_id = 2
    ↓
Si no existe registro, lo crea:
    INSERT INTO resident_preferences (user_id, accepts_visitors, accepts_personnel)
    VALUES (2, TRUE, TRUE)
    ↓
Backend responde: { "exito": true, "mensaje": "Preferencia actualizada" }
    ↓
Botón cambia a color turquesa (activado) ✅
```

#### Escenario B: Residente desactiva "PERSONAL"

```
Usuario toca botón PERSONAL (estaba en turquesa/activado)
    ↓
App cambia estado local: isPersonnelActive = false
    ↓
App llama: PUT /api/resident-preferences/personnel
    Body: { "user_id": 2, "accepts_personnel": false }
    ↓
Backend actualiza BD:
    UPDATE resident_preferences 
    SET accepts_personnel = FALSE, updated_at = NOW()
    WHERE user_id = 2
    ↓
Backend responde: { "exito": true }
    ↓
Botón cambia a color rojo (desactivado) ❌
```

## 📊 Ejemplos de Datos en la Tabla

### Estado Inicial (Sin Preferencias Guardadas)
```
Tabla resident_preferences: VACÍA
```

### Después de que Juan Pérez (id: 2) configura sus preferencias:
```sql
SELECT * FROM resident_preferences WHERE user_id = 2;
```

| id | user_id | accepts_visitors | accepts_personnel | created_at | updated_at |
|----|---------|------------------|-------------------|------------|------------|
| 1  | 2       | FALSE            | TRUE              | 2024-01-15 | 2024-01-15 |

**Significado:**
- Juan **NO acepta visitas** (botón rojo)
- Juan **SÍ acepta personal** (botón turquesa)

### Después de que Melissa (id: 4) configura sus preferencias:
```sql
SELECT * FROM resident_preferences WHERE user_id = 4;
```

| id | user_id | accepts_visitors | accepts_personnel | created_at | updated_at |
|----|---------|------------------|-------------------|------------|------------|
| 2  | 4       | TRUE             | FALSE             | 2024-01-15 | 2024-01-16 |

**Significado:**
- Melissa **SÍ acepta visitas** (botón turquesa)
- Melissa **NO acepta personal** (botón rojo)

## 🎨 Representación Visual en la App

### Botón VISITAS (accepts_visitors)
```
Estado FALSE (desactivado):
┌─────────────────┐
│  👥  [ROJO]      │  ← No acepta visitas
└─────────────────┘

Estado TRUE (activado):
┌─────────────────┐
│  👥  [TURQUESA]  │  ← Acepta visitas
└─────────────────┘
```

### Botón PERSONAL (accepts_personnel)
```
Estado FALSE (desactivado):
┌─────────────────┐
│  🔧  [ROJO]      │  ← No acepta personal
└─────────────────┘

Estado TRUE (activado):
┌─────────────────┐
│  🔧  [TURQUESA]  │  ← Acepta personal
└─────────────────┘
```

## 🔍 Consultas Útiles

### Ver todos los residentes que aceptan visitas:
```sql
SELECT 
    p.name,
    p.user_name,
    rp.accepts_visitors,
    rp.accepts_personnel
FROM resident_preferences rp
JOIN profiles p ON rp.user_id = p.id
WHERE rp.accepts_visitors = TRUE;
```

**Resultado:**
| name | user_name | accepts_visitors | accepts_personnel |
|------|-----------|-------------------|-------------------|
| Melissa Meraz | Mel | TRUE | FALSE |
| Alan | Alan | TRUE | TRUE |

### Ver todos los residentes que NO aceptan personal:
```sql
SELECT 
    p.name,
    rp.accepts_personnel
FROM resident_preferences rp
JOIN profiles p ON rp.user_id = p.id
WHERE rp.accepts_personnel = FALSE;
```

### Ver preferencias de un residente específico:
```sql
SELECT * 
FROM resident_preferences 
WHERE user_id = 2;
```

## ⚙️ Características Técnicas

### 1. **UNIQUE KEY (unique_user_preference)**
- Garantiza que cada usuario solo tenga **un registro** de preferencias
- Evita duplicados
- Permite usar `INSERT ... ON DUPLICATE KEY UPDATE` en MySQL

### 2. **FOREIGN KEY (user_id → profiles.id)**
- Mantiene la integridad referencial
- Si se elimina un usuario de `profiles`, se eliminan automáticamente sus preferencias (`ON DELETE CASCADE`)
- Evita crear preferencias para usuarios que no existen

### 3. **Valores por Defecto**
- `accepts_visitors = FALSE`: Por seguridad, no se aceptan visitas por defecto
- `accepts_personnel = TRUE`: Se asume que el personal puede entrar por defecto

### 4. **Timestamps Automáticos**
- `created_at`: Se establece cuando se crea el registro
- `updated_at`: Se actualiza automáticamente cada vez que se modifica

## 🚨 Casos de Uso Reales

### Caso 1: Residente va de vacaciones
```
1. Residente abre la app
2. Toca botón VISITAS → se desactiva (rojo)
3. Toca botón PERSONAL → se desactiva (rojo)
4. BD guarda: accepts_visitors = FALSE, accepts_personnel = FALSE
5. El sistema de seguridad sabe que NO debe permitir entrada
```

### Caso 2: Residente espera una visita
```
1. Residente abre la app
2. Toca botón VISITAS → se activa (turquesa)
3. BD guarda: accepts_visitors = TRUE
4. El sistema de seguridad permite que los visitantes entren
```

### Caso 3: Residente tiene trabajos en casa
```
1. Residente abre la app
2. Toca botón PERSONAL → se activa (turquesa)
3. BD guarda: accepts_personnel = TRUE
4. El personal autorizado puede entrar
```

## 🔄 Sincronización

La tabla se mantiene sincronizada en tiempo real:
- **App → BD**: Cada vez que el usuario toca un botón
- **BD → App**: Cada vez que se abre la app (carga inicial)

Si hay un error al guardar, la app revierte el cambio visual para mantener consistencia.

## 📝 Resumen

| Aspecto | Descripción |
|---------|-------------|
| **Propósito** | Almacenar si un residente acepta visitas y/o personal |
| **Relación** | Un registro por residente (1:1 con profiles) |
| **Actualización** | En tiempo real cuando el usuario toca los botones |
| **Valores por defecto** | No visitas, sí personal |
| **Uso** | Sistema de seguridad consulta esta tabla antes de permitir acceso |


