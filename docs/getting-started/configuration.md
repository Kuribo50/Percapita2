# Configuración

Esta guía describe cómo configurar el Sistema Per Cápita FONASA para diferentes entornos.

## Variables de Entorno

### Backend (.env)

```bash
# =====================
# Django Core Settings
# =====================
SECRET_KEY=django-insecure-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# =====================
# Database
# =====================
DB_NAME=percapita_db
DB_USER=percapita_user
DB_PASSWORD=strong_password_here
DB_HOST=localhost
DB_PORT=5432

# =====================
# CORS Configuration
# =====================
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# =====================
# Media & Static Files
# =====================
MEDIA_ROOT=/var/www/percapita/media
MEDIA_URL=/media/
STATIC_ROOT=/var/www/percapita/static
STATIC_URL=/static/

# =====================
# Email Configuration (Opcional)
# =====================
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=noreply@example.com
EMAIL_HOST_PASSWORD=email_password_here
DEFAULT_FROM_EMAIL=Sistema Per Cápita <noreply@example.com>

# =====================
# Logging
# =====================
LOG_LEVEL=INFO
LOG_FILE=/var/log/percapita/django.log

# =====================
# Security (Producción)
# =====================
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
```

### Frontend (.env.local)

```bash
# =====================
# API Configuration
# =====================
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# =====================
# Site Information
# =====================
NEXT_PUBLIC_SITE_NAME=Sistema Per Cápita FONASA
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_DESCRIPTION=Sistema de gestión y validación de usuarios inscritos

# =====================
# Features Flags (Opcional)
# =====================
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DARK_MODE=true

# =====================
# Environment
# =====================
NODE_ENV=development
```

## Configuración de Django

### settings.py

#### Configuración de Base de Datos

```python
from decouple import config

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
        'CONN_MAX_AGE': 600,  # Conexiones persistentes
        'OPTIONS': {
            'connect_timeout': 10,
        }
    }
}
```

#### Middleware

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # CORS
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'api.middleware.auth.TokenAuthenticationMiddleware',  # Custom
]
```

#### CORS

```python
from decouple import config

CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000'
).split(',')

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
```

#### Django REST Framework

```python
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
    'DEFAULT_FILTER_BACKENDS': [
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'EXCEPTION_HANDLER': 'api.utils.exception_handler.custom_exception_handler',
    'DATETIME_FORMAT': '%Y-%m-%d %H:%M:%S',
}
```

#### Archivos Estáticos y Media

```python
STATIC_URL = config('STATIC_URL', default='/static/')
STATIC_ROOT = config('STATIC_ROOT', default=BASE_DIR / 'staticfiles')

MEDIA_URL = config('MEDIA_URL', default='/media/')
MEDIA_ROOT = config('MEDIA_ROOT', default=BASE_DIR / 'media')

# Configuración para producción
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.ManifestStaticFilesStorage'
```

#### Logging

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'filters': {
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple'
        },
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': config('LOG_FILE', default='/var/log/percapita/django.log'),
            'maxBytes': 1024 * 1024 * 15,  # 15MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': config('LOG_LEVEL', default='INFO'),
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': config('LOG_LEVEL', default='INFO'),
            'propagate': False,
        },
        'api': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}
```

#### Seguridad (Producción)

```python
# Solo para producción (DEBUG=False)
if not DEBUG:
    SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
```

## Configuración de Next.js

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Optimización de imágenes
  images: {
    domains: ['localhost', 'percapita.example.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
  },

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
        has: [
          {
            type: 'cookie',
            key: 'auth_token',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Configuración de PostgreSQL

### postgresql.conf (Optimizaciones)

```conf
# Conexiones
max_connections = 100

# Memoria
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 16MB

# WAL
wal_buffers = 16MB
checkpoint_completion_target = 0.9

# Query Planner
random_page_cost = 1.1
effective_io_concurrency = 200

# Logging
logging_collector = on
log_directory = 'pg_log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_statement = 'mod'
log_duration = on
log_min_duration_statement = 1000
```

### pg_hba.conf (Acceso)

```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# Local connections
local   all             all                                     peer

# IPv4 local connections
host    percapita_db    percapita_user  127.0.0.1/32           md5
host    percapita_db    percapita_user  ::1/128                md5

# Production server
host    percapita_db    percapita_user  192.168.1.0/24         md5
```

## Configuración de Nginx (Producción)

### nginx.conf

```nginx
upstream django_backend {
    server 127.0.0.1:8000;
}

upstream nextjs_frontend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name percapita.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name percapita.example.com;

    ssl_certificate /etc/ssl/certs/percapita.crt;
    ssl_certificate_key /etc/ssl/private/percapita.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 20M;

    # Frontend
    location / {
        proxy_pass http://nextjs_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Static files
    location /static/ {
        alias /var/www/percapita/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /media/ {
        alias /var/www/percapita/media/;
        expires 7d;
        add_header Cache-Control "public";
    }

    # Logs
    access_log /var/log/nginx/percapita_access.log;
    error_log /var/log/nginx/percapita_error.log;
}
```

## Configuración de Supervisor (Producción)

### gunicorn.conf

```conf
[program:percapita_backend]
directory=/var/www/percapita/backend
command=/var/www/percapita/backend/venv/bin/gunicorn \
    --workers 4 \
    --bind 127.0.0.1:8000 \
    --timeout 120 \
    --access-logfile /var/log/percapita/gunicorn_access.log \
    --error-logfile /var/log/percapita/gunicorn_error.log \
    percapita.wsgi:application

user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/percapita/supervisor_backend.log
```

### nextjs.conf

```conf
[program:percapita_frontend]
directory=/var/www/percapita/frontend
command=/usr/bin/npm start
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/percapita/supervisor_frontend.log
environment=NODE_ENV="production",PORT="3000"
```

## Optimizaciones

### Cache de Django

```python
# settings.py
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'percapita',
        'TIMEOUT': 300,
    }
}

# Caché de sesiones
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
```

### Compresión

```python
# settings.py
MIDDLEWARE = [
    # ...
    'django.middleware.gzip.GZipMiddleware',  # Comprimir respuestas
    # ...
]
```

## Backup y Recuperación

### Script de Backup (backup.sh)

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/percapita"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup de base de datos
pg_dump -U percapita_user -h localhost percapita_db | \
    gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"

# Backup de media files
tar -czf "$BACKUP_DIR/media_backup_$DATE.tar.gz" \
    /var/www/percapita/media/

# Limpiar backups antiguos (más de 30 días)
find "$BACKUP_DIR" -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Cron Job

```bash
# Ejecutar backup diario a las 2 AM
0 2 * * * /usr/local/bin/percapita_backup.sh
```

## Monitoreo

### Health Check Endpoint

```python
# api/views/health.py
from django.http import JsonResponse
from django.db import connection

def health_check(request):
    try:
        # Check database
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")

        return JsonResponse({
            'status': 'healthy',
            'database': 'connected'
        })
    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e)
        }, status=500)
```

## Variables por Entorno

### Desarrollo

```bash
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Staging

```bash
DEBUG=False
ALLOWED_HOSTS=staging.percapita.example.com
CORS_ALLOWED_ORIGINS=https://staging.percapita.example.com
SECURE_SSL_REDIRECT=True
```

### Producción

```bash
DEBUG=False
ALLOWED_HOSTS=percapita.example.com
CORS_ALLOWED_ORIGINS=https://percapita.example.com
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```
