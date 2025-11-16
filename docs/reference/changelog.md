# Changelog

Todos los cambios notables del Sistema Per Cápita FONASA serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.0.0] - 2025-01-16

### Características Principales

#### ✨ Funcionalidades Implementadas

- **Sistema de Logs y Auditoría**
  - Registro completo de todas las acciones del sistema
  - 11 tipos de acciones rastreadas (LOGIN, CREAR, EDITAR, etc.)
  - 7 módulos del sistema
  - Captura de IP address y user agent
  - Historial de cambios en formato JSON (before/after)
  - Panel de administración con filtros avanzados

- **Sistema de Notificaciones**
  - Notificaciones push para usuarios
  - 4 tipos: INFO, SUCCESS, WARNING, ERROR
  - Auto-refresh cada 30 segundos
  - Contador de no leídas en navbar
  - Marcado individual y masivo como leída

- **Búsqueda Global Unificada**
  - Búsqueda en 6 categorías simultáneamente
  - Debouncing optimizado (300ms)
  - Navegación por teclado (↑↓ Enter Esc)
  - Atajo global: Ctrl/Cmd + K
  - Resultados agrupados con iconos y colores

- **Dashboards Personalizados por Rol**
  - Dashboard específico para ADMIN
  - Dashboard específico para INFORMATICO
  - Dashboard específico para ADMINISTRATIVO
  - Widgets reutilizables:
    - Quick Actions
    - Recent Activity
    - Pending Tasks
  - Estadísticas en tiempo real

- **Sistema de Reportes PDF**
  - Reporte de estadísticas generales
  - Listado de usuarios con filtros
  - Logs de auditoría (solo admin)
  - Diseño profesional con ReportLab
  - Descarga automática desde navegador

#### 🔐 Autenticación y Seguridad

- Token-based authentication
- Role-Based Access Control (RBAC)
  - ADMIN: Acceso completo
  - INFORMATICO: Gestión de datos
  - ADMINISTRATIVO: Revisión de usuarios
- Middleware de autenticación personalizado
- Hash seguro de contraseñas
- Protección CSRF
- Prevención XSS
- Validación de datos en frontend y backend

#### 📊 Gestión de Datos

- **Cortes FONASA**
  - Carga masiva desde Excel
  - Validación automática de formato
  - Historial mensual completo
  - **Conteo correcto de duplicados por RUN**

- **HP Trakcare**
  - Importación de datos médicos
  - Búsqueda optimizada
  - Integración con validaciones

- **Nuevos Usuarios**
  - Carga desde Excel
  - Validación en lote
  - Sistema de observaciones
  - Estados: VALIDADO, NO_VALIDADO, PENDIENTE, FALLECIDO

#### 📁 Catálogos Maestros

- Etnias
- Nacionalidades
- Sectores y subsectores
- Establecimientos
- CRUD completo para todos

#### 🎨 Interfaz de Usuario

- **Frontend Moderno**
  - Next.js 16.0 con React 19.2
  - TypeScript 5 para tipado estático
  - Tailwind CSS 4 para estilos
  - shadcn/ui para componentes
  - Framer Motion para animaciones

- **Responsive Design**
  - Funciona en desktop, tablet, mobile
  - Navegación adaptativa
  - Touch-friendly

- **UX Mejorado**
  - Debouncing en búsquedas
  - Loading states
  - Error handling
  - Toast notifications
  - Keyboard shortcuts

#### 🛠️ Backend

- Django 5.1+ con Python 3.11+
- Django REST Framework 3.15+
- PostgreSQL 14+ como base de datos
- Arquitectura modular:
  - api/models/
  - api/views/
  - api/serializers/
  - api/utils/

#### 📄 Documentación

- **MkDocs Material** completo
- Guías de instalación y configuración
- Documentación de API REST
- Guías de usuario por rol
- FAQ y solución de problemas
- Glosario de términos
- Arquitectura del sistema

### Optimizaciones

- Paginación en todos los listados (50 items)
- Índices en campos de búsqueda frecuente
- Select_related() en queries complejas
- Code splitting en Next.js
- Lazy loading de componentes
- Cache de catálogos (futuro: Redis)

### Seguridad

- HTTPS en producción
- Secure cookies
- HSTS headers
- Content Security Policy
- Rate limiting configurableDependencies instaladas
- Sanitización de inputs
- SQL injection prevention (ORM)

### Deployment

- Configuración para Nginx
- Scripts de Supervisor
- Variables de entorno
- Logging configurado
- Health check endpoint

## [0.9.0] - 2025-01-15

### Añadido

- Refactorización de estructura de código
- Separación de vistas en módulos
- Optimización de tipos TypeScript
- Capa de servicios en frontend

### Modificado

- Mejora de performance en listados
- Actualización de dependencias
- Optimización de queries

## [0.8.0] - 2025-01-10

### Añadido

- Gestión de usuarios del sistema
- Asignación de centros de salud
- Cambio y reseteo de contraseñas
- Panel de administración

### Corregido

- Bug en validación de RUTs
- Error en carga de archivos grandes
- Problema con fechas en diferentes zonas horarias

## [0.7.0] - 2025-01-05

### Añadido

- Sistema de validaciones
- Comparación entre fuentes
- Estados de validación
- Observaciones para usuarios NO_VALIDADOS

## [0.6.0] - 2024-12-20

### Añadido

- Carga de HP Trakcare
- Búsqueda de usuarios en HP
- Integración con cortes FONASA

## [0.5.0] - 2024-12-15

### Añadido

- Carga de cortes FONASA desde Excel
- Procesamiento de archivos
- Validación de formato
- Historial de cargas

## [0.4.0] - 2024-12-10

### Añadido

- Catálogos maestros (etnias, nacionalidades, sectores, etc.)
- CRUD completo para establecimientos

## [0.3.0] - 2024-12-05

### Añadido

- Autenticación básica
- Login/logout
- Gestión de sesiones

## [0.2.0] - 2024-12-01

### Añadido

- Configuración inicial del proyecto
- Setup de Django y Next.js
- Configuración de PostgreSQL
- Estructura base

## [0.1.0] - 2024-11-25

### Añadido

- Repositorio inicial
- README básico
- Licencia

---

## Tipos de Cambios

- `Añadido` - Para nuevas funcionalidades
- `Modificado` - Para cambios en funcionalidades existentes
- `Obsoleto` - Para funcionalidades que pronto se eliminarán
- `Eliminado` - Para funcionalidades eliminadas
- `Corregido` - Para corrección de bugs
- `Seguridad` - En caso de vulnerabilidades

## Roadmap

### Próximas Versiones

#### v1.1.0 (Planeado: Feb 2025)

- [ ] WebSocket para notificaciones en tiempo real
- [ ] Dashboard con gráficos interactivos (Chart.js)
- [ ] Exportación a múltiples formatos (CSV, Excel)
- [ ] Importación con validación previa
- [ ] Sistema de comentarios en validaciones

#### v1.2.0 (Planeado: Mar 2025)

- [ ] API pública con documentación OpenAPI
- [ ] Rate limiting avanzado
- [ ] Cache con Redis
- [ ] Métricas y analytics
- [ ] Reportes programados

#### v2.0.0 (Planeado: Abr 2025)

- [ ] Microservicios (separar reportes, validaciones)
- [ ] Kubernetes deployment
- [ ] CI/CD completo
- [ ] Tests automatizados (cobertura > 80%)
- [ ] Modo offline

## Contribuciones

Para contribuir al proyecto:

1. Lee [CONTRIBUTING.md](../developer/contributing.md)
2. Crea una rama feature/fix
3. Haz commit de cambios
4. Abre Pull Request
5. Espera code review

## Soporte

Para reportar bugs o solicitar features:

- 📧 Email: dev@percapita.example.com
- 🐛 Issues: GitHub
- 📚 Docs: Esta documentación
