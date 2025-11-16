# Sistema de Gestión Per Cápita FONASA

Sistema integral para la gestión y validación de inscritos en el sistema per cápita de FONASA, desarrollado para centros de salud (CESFAM).

## 📋 Descripción

Este sistema permite:
- Gestión de cortes mensuales de FONASA
- Validación automática de nuevos inscritos
- Integración con HP Trakcare
- Seguimiento y observaciones de usuarios
- Generación de certificados
- Reportes y estadísticas

## 🏗️ Arquitectura

Proyecto full-stack con arquitectura moderna y modular:

### Backend (Django REST Framework)
- **Framework**: Django 5.1+ con Django REST Framework 3.15+
- **Base de Datos**: PostgreSQL (con soporte SQLite para desarrollo)
- **Autenticación**: Token-based authentication
- **Estructura**: Modular organizada por dominios

```
backend/
├── api/
│   ├── models/           # Modelos organizados por dominio
│   │   ├── catalogos.py
│   │   ├── cortes.py
│   │   ├── hp_trakcare.py
│   │   ├── usuarios.py
│   │   ├── historial.py
│   │   └── auth.py
│   ├── serializers/      # Serializers por dominio
│   ├── views/            # Vistas por funcionalidad
│   ├── migrations/
│   └── urls.py
└── config/               # Configuración Django
```

### Frontend (Next.js)
- **Framework**: Next.js 16.0 con App Router
- **UI**: React 19.2 + Tailwind CSS 4 + shadcn/ui
- **Visualización**: Recharts 3.3
- **Animaciones**: Framer Motion 12.23
- **Formularios**: React Hook Form patterns
- **Manejo de Estado**: React Context API

```
frontend/
├── app/                  # Next.js App Router
│   ├── dashboard/        # Páginas del dashboard
│   ├── login/
│   └── register/
├── components/           # Componentes React
│   ├── charts/
│   ├── dashboard/
│   ├── ui/              # shadcn/ui components
│   └── magicui/         # Animaciones
├── services/            # Capa de servicios API
├── contexts/            # React Contexts
├── lib/                 # Utilidades y hooks
└── types/               # Tipos TypeScript
```

## 🚀 Inicio Rápido

### Prerequisitos

- Python 3.11+
- Node.js 20+
- PostgreSQL 14+ (opcional, puede usar SQLite para desarrollo)
- npm o yarn

### Instalación Backend

```bash
# Navegar al directorio backend
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Linux/Mac:
source venv/bin/activate
# En Windows:
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Copiar archivo de configuración
cp .env.example .env

# Editar .env con tus configuraciones
nano .env

# Ejecutar migraciones
python manage.py migrate

# Crear superusuario (opcional)
python manage.py createsuperuser

# Iniciar servidor de desarrollo
python manage.py runserver
```

El servidor estará disponible en: http://localhost:8000

### Instalación Frontend

```bash
# Navegar al directorio frontend
cd frontend

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.local.example .env.local

# Editar .env.local con la URL del backend
nano .env.local

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en: http://localhost:3000

## 🔧 Configuración

### Variables de Entorno Backend

Crear archivo `.env` en `/backend/`:

```env
# Database
DB_NAME=percapita_db
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432

# Security
SECRET_KEY=tu_secret_key_muy_seguro
DEBUG=True
ADMIN_DELETE_PASSWORD=password_admin

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Variables de Entorno Frontend

Crear archivo `.env.local` en `/frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 📚 Módulos Principales

### 1. Gestión de Cortes FONASA
- Carga masiva de archivos de cortes mensuales
- Validación automática de registros
- Detección de rechazos y motivos
- Historial de apariciones por usuario

### 2. Gestión de Nuevos Usuarios
- Registro de usuarios pre-corte
- Validación automática cuando llega el corte
- Seguimiento de estados (PENDIENTE/VALIDADO/NO_VALIDADO/FALLECIDO)
- Revisión manual y observaciones

### 3. HP Trakcare Integration
- Carga de base de datos HP Trakcare
- Validación cruzada con cortes FONASA
- Información completa de pacientes
- Búsqueda por familia

### 4. Certificados
- Certificado de Inscripción
- Certificado de No Inscripción
- Certificado de Renovación de NIP

### 5. Catálogos
- Etnias
- Nacionalidades
- Sectores y Subsectores
- Establecimientos de Salud

## 🔄 Flujo de Trabajo

1. **Carga de Datos Iniciales**
   - Cargar base HP Trakcare
   - Cargar catálogos (etnias, nacionalidades, sectores, establecimientos)

2. **Gestión Mensual**
   - Registrar nuevos inscritos del mes
   - Esperar corte FONASA del mes siguiente
   - Cargar corte FONASA
   - Sistema valida automáticamente nuevos usuarios
   - Revisar usuarios no validados

3. **Seguimiento**
   - Buscar usuarios individuales
   - Revisar historial mensual
   - Agregar observaciones
   - Generar certificados

## 🛡️ Seguridad

- Autenticación basada en tokens
- Contraseñas hasheadas con algoritmo de Django
- Validación de permisos para operaciones sensibles
- Protección CSRF
- CORS configurado

## 📊 Base de Datos

### Modelos Principales

- **CorteFonasa**: Registros mensuales de FONASA
- **HpTrakcare**: Base de datos de HP Trakcare
- **NuevoUsuario**: Usuarios pre-corte pendientes de validación
- **ValidacionCorte**: Historial de validaciones
- **HistorialCarga**: Auditoría de cargas de archivos
- **Usuario**: Usuarios del sistema (autenticación)

### Catálogos

- Etnia, Nacionalidad, Sector, Subsector, Establecimiento

## 🧪 Testing

```bash
# Backend
cd backend
python manage.py test

# Frontend
cd frontend
npm run test
```

## 📦 Build para Producción

### Backend

```bash
cd backend

# Collectstatic
python manage.py collectstatic --noinput

# Usar gunicorn o similar
gunicorn config.wsgi:application
```

### Frontend

```bash
cd frontend

# Build
npm run build

# Start
npm start
```

## 📝 Buenas Prácticas Aplicadas

### Backend
✅ Estructura modular por dominios
✅ Serializers con validaciones robustas
✅ Normalización de datos (RUNs, motivos)
✅ Índices de base de datos optimizados
✅ Comentarios detallados en código
✅ Type hints en Python
✅ Separación de concerns (models/serializers/views)

### Frontend
✅ Componentes reutilizables
✅ Capa de servicios para API
✅ Type safety con TypeScript
✅ Componentes UI consistentes (shadcn/ui)
✅ Manejo de estados con Context API
✅ Optimización de performance

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Contacto

Para soporte o consultas, contactar al equipo de desarrollo.

## 🔄 Changelog

### v1.0.0 - Refactorización Mayor
- ✅ Reorganización modular del backend
- ✅ División de models, serializers y views por dominios
- ✅ Mejora de comentarios y documentación
- ✅ Optimización de estructura de código
- ✅ Implementación de mejores prácticas

---

**Desarrollado para la gestión eficiente del sistema per cápita de FONASA**
