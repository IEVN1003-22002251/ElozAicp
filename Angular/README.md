# AICP Angular Frontend

Frontend del sistema AICP desarrollado con Angular.

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+ 
- npm o yarn

### Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar API URL:**
   - Editar `src/environments/environment.ts`
   - Asegurarse de que `apiUrl` apunte a `http://localhost:5000/api`

3. **Ejecutar aplicación:**
```bash
npm start
# o
npm run dev
```

La aplicación estará disponible en `http://localhost:4200`

## 📁 Estructura del Proyecto

```
Angular/
├── src/
│   ├── app/
│   │   ├── auth/              # Autenticación
│   │   ├── home/              # Página principal
│   │   ├── dashboard/         # Dashboard
│   │   ├── visitors/          # Visitantes
│   │   ├── pre-register/      # Pre-registro
│   │   ├── facial-register/   # Registro facial
│   │   ├── history/           # Historial
│   │   ├── cameras/           # Cámaras
│   │   ├── qr-access/         # Acceso QR
│   │   ├── recent-visitors/   # Visitantes recientes
│   │   ├── vip-register/      # Registro VIP
│   │   ├── one-time-visitor/  # Visitante de una vez
│   │   ├── providers/         # Proveedores
│   │   ├── events/            # Eventos
│   │   ├── visitor-qr/        # QR de visitante
│   │   ├── manage-visitors/   # Gestionar visitantes
│   │   ├── admin-banner/      # Banner de administración
│   │   ├── access-report/     # Reporte de accesos
│   │   ├── incident-report/   # Reporte de incidentes
│   │   ├── forgot-password/   # Recuperar contraseña
│   │   ├── register/          # Registro
│   │   ├── pending-registrations/ # Registros pendientes
│   │   ├── profile/           # Perfil
│   │   ├── notifications/     # Notificaciones
│   │   └── services/          # Servicios HTTP
│   └── environments/          # Configuración de entornos
├── package.json
└── README.md
```

## 🔧 Configuración

### Environment Variables

Editar `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

## 📦 Módulos Disponibles

- **Auth** - Autenticación (login/registro)
- **Home** - Página principal
- **Dashboard** - Panel de control
- **Visitors** - Gestión de visitantes
- **Pre-Register** - Pre-registro de visitantes
- **Facial Register** - Registro facial
- **History** - Historial de accesos
- **Cameras** - Sistema de cámaras
- **QR Access** - Acceso mediante QR
- **Recent Visitors** - Visitantes recientes
- **VIP Register** - Registro VIP
- **One Time Visitor** - Visitante de una vez
- **Providers** - Gestión de proveedores
- **Events** - Eventos
- **Visitor QR** - QR de visitante
- **Manage Visitors** - Gestionar visitantes
- **Admin Banner** - Banner de administración
- **Access Report** - Reporte de accesos
- **Incident Report** - Reporte de incidentes
- **Forgot Password** - Recuperar contraseña
- **Register** - Registro de usuarios
- **Pending Registrations** - Registros pendientes
- **Profile** - Perfil de usuario
- **Notifications** - Notificaciones

## 🛠️ Comandos Disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm run build` - Compila para producción
- `npm test` - Ejecuta las pruebas unitarias
- `npm run lint` - Ejecuta el linter

## 🔗 Conexión con Backend

El frontend se conecta al backend Flask a través de:
- **URL Base**: `http://localhost:5000/api`
- **Configurado en**: `src/environments/environment.ts`

## 📝 Notas

- Todos los módulos usan lazy loading para optimizar el rendimiento
- Los servicios HTTP están en `src/app/services/`
- Los componentes son standalone (Angular 17+)
- CORS debe estar configurado en el backend Flask

## 🔗 Repositorio

Este es un repositorio independiente del backend Flask.
