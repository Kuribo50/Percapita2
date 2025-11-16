# Arquitectura del Sistema

Esta página describe la arquitectura técnica del Sistema Per Cápita FONASA.

## Visión General

El sistema sigue una arquitectura cliente-servidor moderna con separación clara entre frontend y backend.

```mermaid
graph TB
    subgraph "Cliente"
        A[Navegador Web]
    end

    subgraph "Frontend - Next.js"
        B[React Components]
        C[TypeScript Services]
        D[Tailwind CSS]
        E[State Management]
    end

    subgraph "Backend - Django"
        F[Django REST API]
        G[Authentication]
        H[Business Logic]
        I[ORM Models]
    end

    subgraph "Almacenamiento"
        J[(PostgreSQL)]
        K[Media Files]
        L[Static Files]
    end

    A -->|HTTPS| B
    B --> C
    C -->|REST API| F
    F --> G
    G --> H
    H --> I
    I -->|SQL| J
    F -->|Write/Read| K
    F -->|Serve| L
```

## Arquitectura del Frontend

### Tecnologías

- **Next.js 16.0**: Framework React con Server-Side Rendering
- **React 19.2**: Biblioteca de UI con componentes funcionales
- **TypeScript 5**: Tipado estático para JavaScript
- **Tailwind CSS 4**: Framework utility-first para estilos
- **shadcn/ui**: Componentes UI accesibles y personalizables

### Estructura de Directorios

```
frontend/
├── app/                      # App Router de Next.js 16
│   ├── dashboard/           # Páginas del dashboard
│   │   ├── admin/          # Páginas de administrador
│   │   ├── page.tsx        # Dashboard principal (routing por rol)
│   │   └── layout.tsx      # Layout compartido
│   ├── login/              # Página de login
│   └── layout.tsx          # Root layout
│
├── components/              # Componentes React
│   ├── ui/                 # Componentes base de shadcn/ui
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── dashboard/          # Componentes de dashboard
│   │   ├── AdminDashboard.tsx
│   │   ├── InformaticoDashboard.tsx
│   │   ├── AdministrativoDashboard.tsx
│   │   └── widgets/        # Widgets reutilizables
│   ├── busqueda/           # Búsqueda global
│   ├── notificaciones/     # Sistema de notificaciones
│   ├── reportes/           # Diálogos de reportes
│   ├── navigation/         # Navegación y menús
│   └── ...
│
├── services/                # Servicios de API
│   ├── api.ts              # Cliente Axios configurado
│   ├── auth.ts             # Autenticación
│   ├── usuarios.ts         # API de usuarios
│   ├── cortes.ts           # API de cortes
│   ├── auditoria.ts        # API de logs
│   ├── notificaciones.ts   # API de notificaciones
│   ├── busqueda.ts         # API de búsqueda
│   ├── reportes.ts         # API de reportes
│   └── ...
│
├── types/                   # Definiciones TypeScript
│   └── index.ts            # Tipos compartidos
│
├── hooks/                   # Custom React hooks
│   ├── use-auth.ts         # Hook de autenticación
│   ├── use-toast.ts        # Hook de toast notifications
│   └── ...
│
├── lib/                     # Utilidades
│   └── utils.ts            # Funciones auxiliares
│
└── public/                  # Archivos estáticos
    └── images/
```

### Flujo de Datos

```mermaid
sequenceDiagram
    participant U as Usuario
    participant C as Componente React
    participant S as Service
    participant A as API Backend

    U->>C: Interacción (click, input)
    C->>S: Llamada a servicio
    S->>A: HTTP Request
    A->>S: HTTP Response
    S->>C: Datos procesados
    C->>U: UI actualizada
```

### Patrones de Diseño

#### 1. Componentes Presentacionales vs Contenedores

**Presentacionales** (Dumb Components):
```typescript
// components/ui/button.tsx
export function Button({ children, onClick, variant }) {
  return (
    <button className={cn(variants[variant])} onClick={onClick}>
      {children}
    </button>
  );
}
```

**Contenedores** (Smart Components):
```typescript
// app/dashboard/admin/usuarios/page.tsx
export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    loadUsuarios();
  }, []);

  return <UsuariosTable data={usuarios} />;
}
```

#### 2. Custom Hooks

```typescript
// hooks/use-auth.ts
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  return { user, loading, login, logout };
}
```

#### 3. Service Layer

```typescript
// services/usuarios.ts
export async function getUsuarios(filtros?: FiltrosUsuario) {
  const response = await api.get('/usuarios/', { params: filtros });
  return response.data;
}
```

## Arquitectura del Backend

### Tecnologías

- **Django 5.1+**: Framework web de alto nivel
- **Django REST Framework 3.15+**: Toolkit para construir APIs
- **PostgreSQL**: Base de datos relacional
- **ReportLab**: Generación de PDFs
- **openpyxl**: Procesamiento de Excel

### Estructura de Directorios

```
backend/
├── api/                     # Aplicación principal
│   ├── models/             # Modelos de datos
│   │   ├── __init__.py     # Exporta todos los modelos
│   │   ├── usuario.py      # Modelo de usuarios del sistema
│   │   ├── corte.py        # Modelos de cortes FONASA
│   │   ├── hp_trakcare.py  # Modelos HP Trakcare
│   │   ├── nuevo_usuario.py # Nuevos usuarios
│   │   ├── catalogos.py    # Catálogos maestros
│   │   ├── validacion.py   # Validaciones
│   │   └── auditoria.py    # Logs y notificaciones
│   │
│   ├── views/              # Vistas de API
│   │   ├── __init__.py     # Exporta todas las vistas
│   │   ├── usuarios.py     # CRUD de usuarios
│   │   ├── busqueda.py     # Búsqueda de usuarios/familias
│   │   ├── busqueda_global.py # Búsqueda global
│   │   ├── auditoria.py    # Logs y notificaciones
│   │   ├── reportes.py     # Generación de PDFs
│   │   └── views_old.py    # Vistas legacy (en refactor)
│   │
│   ├── serializers/        # Serializadores DRF
│   │   └── ...
│   │
│   ├── utils/              # Utilidades
│   │   ├── __init__.py
│   │   ├── validators.py   # Validadores personalizados
│   │   ├── pdf_generator.py # Generador de PDFs
│   │   └── utils.py        # Funciones auxiliares
│   │
│   ├── middleware/         # Middleware personalizado
│   │   └── auth.py         # Autenticación por token
│   │
│   ├── migrations/         # Migraciones de base de datos
│   ├── urls.py             # Rutas de API
│   └── admin.py            # Configuración del admin
│
├── percapita/              # Configuración del proyecto
│   ├── settings.py         # Configuración principal
│   ├── urls.py             # URLs raíz
│   └── wsgi.py             # WSGI para deployment
│
└── manage.py               # CLI de Django
```

### Modelos de Datos

#### Diagrama ER Simplificado

```mermaid
erDiagram
    Usuario ||--o{ LogActividad : registra
    Usuario ||--o{ Notificacion : recibe
    Usuario }o--o{ Establecimiento : "asignado a"

    NuevoUsuario }o--|| Establecimiento : "inscrito en"
    CorteFonasa }o--|| Establecimiento : "pertenece a"
    HPTrakcare }o--|| Establecimiento : "atendido en"

    NuevoUsuario ||--o{ UsuarioNoValidado : "puede ser"
    NuevoUsuario ||--o{ Validacion : "validado por"

    Etnia ||--o{ NuevoUsuario : "tiene"
    Nacionalidad ||--o{ NuevoUsuario : "tiene"
    Sector ||--o{ Subsector : "contiene"
    Subsector ||--o{ Establecimiento : "contiene"
```

#### Modelo de Usuario del Sistema

```python
class Usuario(models.Model):
    ROL_ADMIN = 'ADMIN'
    ROL_INFORMATICO = 'INFORMATICO'
    ROL_ADMINISTRATIVO = 'ADMINISTRATIVO'

    ROLES = [
        (ROL_ADMIN, 'Administrador'),
        (ROL_INFORMATICO, 'Informático'),
        (ROL_ADMINISTRATIVO, 'Administrativo'),
    ]

    username = models.EmailField(unique=True)
    nombre_completo = models.CharField(max_length=200)
    rol = models.CharField(max_length=20, choices=ROLES)
    centros = models.ManyToManyField('Establecimiento')
    activo = models.BooleanField(default=True)
    token = models.CharField(max_length=255, unique=True)
```

#### Modelo de Nuevo Usuario

```python
class NuevoUsuario(models.Model):
    run = models.CharField(max_length=12)
    nombre_completo = models.CharField(max_length=200)
    fecha_nacimiento = models.DateField()
    centro_salud = models.ForeignKey('Establecimiento')
    estado_inscripcion = models.CharField(max_length=20)
    etnia = models.ForeignKey('Etnia', null=True)
    nacionalidad = models.ForeignKey('Nacionalidad', null=True)
    fecha_inscripcion = models.DateTimeField()
    revisado = models.BooleanField(default=False)
```

### API REST

#### Convenciones de Endpoints

```
GET    /api/resource/           # Listar (con paginación)
POST   /api/resource/           # Crear
GET    /api/resource/{id}/      # Detalle
PUT    /api/resource/{id}/      # Actualizar completo
PATCH  /api/resource/{id}/      # Actualizar parcial
DELETE /api/resource/{id}/      # Eliminar
```

#### Autenticación

**Token-based authentication**:

```http
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

**Middleware personalizado**:

```python
class TokenAuthenticationMiddleware:
    def __call__(self, request):
        token = request.headers.get('Authorization', '').replace('Token ', '')
        if token:
            try:
                usuario = Usuario.objects.get(token=token, activo=True)
                request.usuario = usuario
            except Usuario.DoesNotExist:
                pass
        return self.get_response(request)
```

#### Paginación

```python
# settings.py
REST_FRAMEWORK = {
    'PAGE_SIZE': 50,
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
}
```

**Response**:
```json
{
  "count": 150,
  "next": "http://api.example.com/usuarios/?page=2",
  "previous": null,
  "results": [...]
}
```

### Auditoría Automática

Todas las vistas de modificación incluyen logging automático:

```python
@api_view(['POST'])
def usuarios_list(request):
    # ... crear usuario ...

    LogActividad.registrar(
        usuario=request.usuario,
        accion=LogActividad.ACCION_CREAR,
        modulo=LogActividad.MODULO_USUARIOS,
        descripcion=f'Creó el usuario {usuario.username}',
        objeto_tipo='Usuario',
        objeto_id=usuario.id,
        cambios={'after': {...}},
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', '')
    )
```

## Base de Datos

### PostgreSQL

**Características utilizadas**:

- **JSONField**: Almacenamiento de cambios en logs
- **Índices**: Optimización de búsquedas
- **Constraints**: Integridad referencial
- **Triggers**: (futuro) Para auditoría automática

### Esquema de Tablas Principales

```sql
-- Usuarios del Sistema
CREATE TABLE api_usuario (
    id SERIAL PRIMARY KEY,
    username VARCHAR(254) UNIQUE NOT NULL,
    nombre_completo VARCHAR(200),
    password VARCHAR(128),
    rol VARCHAR(20),
    token VARCHAR(255) UNIQUE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Nuevos Usuarios
CREATE TABLE api_nuevousuario (
    id SERIAL PRIMARY KEY,
    run VARCHAR(12),
    nombre_completo VARCHAR(200),
    fecha_nacimiento DATE,
    centro_salud_id INTEGER REFERENCES api_establecimiento(id),
    estado_inscripcion VARCHAR(20),
    fecha_inscripcion TIMESTAMP,
    revisado BOOLEAN DEFAULT FALSE
);

-- Logs de Actividad
CREATE TABLE api_logactividad (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES api_usuario(id) ON DELETE SET NULL,
    accion VARCHAR(50),
    modulo VARCHAR(50),
    descripcion TEXT,
    cambios JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_nuevousuario_run ON api_nuevousuario(run);
CREATE INDEX idx_nuevousuario_centro ON api_nuevousuario(centro_salud_id);
CREATE INDEX idx_log_timestamp ON api_logactividad(timestamp DESC);
CREATE INDEX idx_log_usuario ON api_logactividad(usuario_id);
```

## Comunicación Frontend-Backend

### Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant B as Backend
    participant DB as Database

    U->>F: Ingresa credenciales
    F->>B: POST /api/auth/login
    B->>DB: Verificar usuario
    DB->>B: Usuario válido
    B->>B: Generar token
    B->>DB: Guardar token
    B->>F: Token + datos usuario
    F->>F: Guardar token (localStorage)
    F->>U: Redirigir a dashboard

    Note over F,B: Requests subsecuentes

    F->>B: GET /api/usuarios/<br/>Header: Authorization: Token XXX
    B->>DB: Validar token
    DB->>B: Usuario autenticado
    B->>F: Datos solicitados
```

### Manejo de Errores

**Backend**:
```python
try:
    # Operación
    pass
except Exception as e:
    return Response(
        {'detail': str(e)},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
```

**Frontend**:
```typescript
try {
  const data = await getUsuarios();
  setUsuarios(data);
} catch (error: any) {
  toast({
    variant: "destructive",
    title: "Error",
    description: error.response?.data?.detail || "Error desconocido"
  });
}
```

## Seguridad

### Capas de Seguridad

1. **Transporte**: HTTPS en producción
2. **Autenticación**: Token-based
3. **Autorización**: Verificación por rol
4. **Validación**: Sanitización de inputs
5. **Auditoría**: Logging completo

### CORS (Cross-Origin Resource Sharing)

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Frontend en desarrollo
    "https://percapita.example.com",  # Producción
]

CORS_ALLOW_HEADERS = [
    'accept',
    'authorization',
    'content-type',
]
```

### Protección CSRF

```python
# Para API REST, CSRF está deshabilitado
# La protección viene por token de autorización
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
```

## Escalabilidad

### Estrategias Actuales

1. **Paginación**: Todos los listados paginados
2. **Lazy Loading**: Componentes cargados bajo demanda
3. **Debouncing**: Búsquedas optimizadas
4. **Índices DB**: Queries optimizadas

### Escalabilidad Futura

1. **Caché**: Redis para sesiones y queries frecuentes
2. **CDN**: Archivos estáticos en CDN
3. **Load Balancer**: Múltiples instancias de backend
4. **Database Replication**: Read replicas para consultas
5. **Microservicios**: Separar reportes, validaciones

## Monitoreo y Logs

### Logs del Sistema

**Backend**:
```python
import logging
logger = logging.getLogger(__name__)

logger.info(f'Usuario {usuario.username} creó corte')
logger.error(f'Error procesando archivo: {str(e)}')
```

**Frontend**:
```typescript
console.log('[Service] Fetching usuarios...');
console.error('[API] Error:', error);
```

### Métricas Importantes

- Tiempo de respuesta de API
- Tasa de errores
- Usuarios activos
- Queries lentas (> 1s)
- Espacio en disco
- Uso de memoria

## Deployment

### Arquitectura de Producción

```mermaid
graph LR
    A[Internet] -->|HTTPS| B[Nginx]
    B -->|Proxy| C[Next.js Server]
    B -->|Proxy| D[Gunicorn/Django]
    D -->|ORM| E[(PostgreSQL)]
    C -->|API Calls| D
    D -->|Read/Write| F[Media Storage]
```

### Componentes

- **Nginx**: Servidor web y reverse proxy
- **Gunicorn**: WSGI server para Django
- **Next.js Server**: SSR de React
- **PostgreSQL**: Base de datos
- **Supervisor**: Gestor de procesos

## Documentación de Código

### Backend (Python)

```python
def reporte_estadisticas_pdf(request):
    """
    Genera reporte PDF de estadísticas generales.

    Query params:
        - centro_id: Filtrar por centro específico (opcional)

    Returns:
        PDF file con estadísticas del sistema

    Raises:
        HTTP_401: Usuario no autenticado
        HTTP_503: ReportLab no disponible
    """
    pass
```

### Frontend (TypeScript)

```typescript
/**
 * Descarga reporte de usuarios en PDF
 *
 * @param filtros - Filtros opcionales (centro_id, estado, fecha_desde, fecha_hasta)
 * @throws Error si la descarga falla
 */
export async function descargarReporteUsuarios(filtros?: {
  centro_id?: number;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}): Promise<void> {
  // ...
}
```
