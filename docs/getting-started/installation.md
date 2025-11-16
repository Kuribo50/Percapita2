# Instalación

Esta guía te ayudará a configurar el Sistema Per Cápita FONASA en tu entorno local de desarrollo.

## Requisitos Previos

Asegúrate de tener instalado lo siguiente:

### Software Requerido

| Software | Versión Mínima | Propósito |
|----------|----------------|-----------|
| Python | 3.11+ | Backend (Django) |
| Node.js | 20.x+ | Frontend (Next.js) |
| PostgreSQL | 14+ | Base de datos |
| Git | 2.x+ | Control de versiones |

### Verificar Instalaciones

```bash
# Python
python --version
# Python 3.11.5

# Node.js
node --version
# v20.10.0

# PostgreSQL
psql --version
# psql (PostgreSQL) 14.10

# Git
git --version
# git version 2.40.0
```

## Clonar el Repositorio

```bash
# Clonar desde GitHub
git clone https://github.com/your-org/Percapita2.git
cd Percapita2
```

## Configuración del Backend (Django)

### 1. Crear Entorno Virtual

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Linux/macOS:
source venv/bin/activate

# En Windows:
venv\Scripts\activate
```

### 2. Instalar Dependencias

```bash
# Instalar dependencias de Python
pip install --upgrade pip
pip install -r requirements.txt
```

**Archivo `requirements.txt`**:

```txt
Django==5.1.5
djangorestframework==3.15.2
psycopg2-binary==2.9.9
python-decouple==3.8
django-cors-headers==4.3.1
openpyxl==3.1.2
reportlab==4.0.7
Pillow==10.1.0
```

### 3. Configurar Base de Datos

**Crear base de datos en PostgreSQL**:

```bash
# Conectar a PostgreSQL
psql -U postgres

# En el prompt de PostgreSQL:
CREATE DATABASE percapita_db;
CREATE USER percapita_user WITH PASSWORD 'your_secure_password';
ALTER ROLE percapita_user SET client_encoding TO 'utf8';
ALTER ROLE percapita_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE percapita_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE percapita_db TO percapita_user;

# Salir
\q
```

### 4. Configurar Variables de Entorno

Crear archivo `.env` en `/backend/`:

```bash
# backend/.env

# Django Settings
SECRET_KEY=your-secret-key-here-generate-a-secure-one
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=percapita_db
DB_USER=percapita_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Media Files
MEDIA_ROOT=/path/to/media
MEDIA_URL=/media/
```

**Generar SECRET_KEY**:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 5. Configurar Django Settings

Actualizar `percapita/settings.py` para usar variables de entorno:

```python
from decouple import config

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='').split(',')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}
```

### 6. Ejecutar Migraciones

```bash
# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Salida esperada:
# Running migrations:
#   Applying contenttypes.0001_initial... OK
#   Applying api.0001_initial... OK
#   ...
```

### 7. Crear Superusuario

```bash
python manage.py createsuperuser

# Ingresar datos:
# Email: admin@example.com
# Nombre completo: Administrador del Sistema
# Password: (ingresa contraseña segura)
```

### 8. Cargar Datos Iniciales (Opcional)

```bash
# Si tienes fixtures con datos de catálogos
python manage.py loaddata catalogos_iniciales.json
```

### 9. Iniciar Servidor de Desarrollo

```bash
python manage.py runserver

# Servidor corriendo en: http://127.0.0.1:8000/
# Admin disponible en: http://127.0.0.1:8000/admin/
```

## Configuración del Frontend (Next.js)

### 1. Instalar Dependencias

```bash
cd ../frontend

# Instalar dependencias de Node.js
npm install

# O con yarn:
yarn install

# O con pnpm:
pnpm install
```

**Principales dependencias** (`package.json`):

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "typescript": "^5",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-select": "^2.1.2",
    "tailwindcss": "^4.0.0",
    "framer-motion": "^11.11.17",
    "axios": "^1.7.9",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.468.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^8",
    "eslint-config-next": "^16.0.0"
  }
}
```

### 2. Configurar Variables de Entorno

Crear archivo `.env.local` en `/frontend/`:

```bash
# frontend/.env.local

# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Site Information
NEXT_PUBLIC_SITE_NAME=Sistema Per Cápita FONASA
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Configurar Next.js

Verificar `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}

module.exports = nextConfig
```

### 4. Configurar Tailwind CSS

Verificar `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... más colores
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### 5. Iniciar Servidor de Desarrollo

```bash
npm run dev

# O con yarn:
yarn dev

# O con pnpm:
pnpm dev

# Servidor corriendo en: http://localhost:3000/
```

## Verificación de Instalación

### Backend

1. **Acceder al Admin**:
   - URL: `http://localhost:8000/admin/`
   - Usuario: `admin@example.com`
   - Contraseña: (la que configuraste)

2. **Probar API**:
   ```bash
   # Login
   curl -X POST http://localhost:8000/api/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{"username":"admin@example.com","password":"tu_password"}'

   # Respuesta esperada:
   # {"token":"9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b","usuario":{...}}
   ```

3. **Verificar base de datos**:
   ```bash
   python manage.py dbshell

   # En PostgreSQL:
   \dt
   # Lista todas las tablas
   ```

### Frontend

1. **Acceder a la aplicación**:
   - URL: `http://localhost:3000/`
   - Deberías ver la página de login

2. **Verificar consola del navegador**:
   - Abrir DevTools (F12)
   - No debería haber errores críticos
   - Verificar que las peticiones a API funcionen

3. **Login y Dashboard**:
   - Ingresar con el usuario admin
   - Verificar que el dashboard cargue correctamente

## Solución de Problemas Comunes

### Error: "No module named 'django'"

**Solución**: Activar el entorno virtual

```bash
cd backend
source venv/bin/activate  # Linux/macOS
# O
venv\Scripts\activate  # Windows
```

### Error: "FATAL: password authentication failed"

**Solución**: Verificar credenciales de PostgreSQL en `.env`

```bash
# Verificar que coincidan con la configuración de PostgreSQL
psql -U percapita_user -d percapita_db -h localhost
```

### Error: "Port 8000 is already in use"

**Solución**: Matar el proceso o usar otro puerto

```bash
# Matar proceso en puerto 8000
# Linux/macOS:
lsof -ti:8000 | xargs kill -9

# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# O usar otro puerto:
python manage.py runserver 8001
```

### Error: "Module not found: Can't resolve '@/components/ui/button'"

**Solución**: Reinstalar dependencias del frontend

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Error: "ReportLab not available"

**Solución**: Instalar ReportLab

```bash
pip install reportlab
# O con dependencias de imágenes:
pip install reportlab Pillow
```

## Próximos Pasos

Una vez completada la instalación:

1. [Configuración](configuration.md) - Configurar ajustes específicos
2. [Primer Uso](first-steps.md) - Aprender los conceptos básicos
3. [Guía de Usuario](../user-guide/index.md) - Guías por rol

## Comandos Útiles

### Backend

```bash
# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Iniciar shell de Django
python manage.py shell

# Iniciar servidor
python manage.py runserver

# Correr tests
python manage.py test

# Recolectar archivos estáticos
python manage.py collectstatic
```

### Frontend

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar en producción
npm start

# Linter
npm run lint

# Type checking
npm run type-check
```

## Recursos Adicionales

- [Documentación de Django](https://docs.djangoproject.com/)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de PostgreSQL](https://www.postgresql.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
