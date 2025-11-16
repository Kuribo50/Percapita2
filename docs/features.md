# Características del Sistema

Esta página describe en detalle todas las características y funcionalidades del Sistema Per Cápita FONASA.

## 🎯 Gestión de Usuarios

### Roles y Permisos

El sistema implementa un modelo de control de acceso basado en roles (RBAC) con tres niveles:

#### Administrador (ADMIN)

**Permisos completos**:

- Gestión de usuarios del sistema (crear, editar, eliminar)
- Asignación de centros de salud a usuarios
- Reseteo de contraseñas
- Acceso a logs de auditoría
- Generación de reportes PDF
- Acceso a todos los centros de salud

**Dashboard personalizado** con:

- Estadísticas globales del sistema
- Distribución de usuarios por centro
- Actividad reciente
- Acciones rápidas: gestión de usuarios, cargas, logs, configuración

#### Informático (INFORMATICO)

**Permisos de gestión de datos**:

- Carga de cortes FONASA
- Carga de archivos HP Trakcare
- Validación de usuarios
- Gestión de nuevos usuarios
- Acceso limitado a centros asignados

**Dashboard personalizado** con:

- Estadísticas de centros asignados
- Progreso de validaciones
- Listado de centros con contadores
- Acciones rápidas: carga de cortes, validaciones, búsqueda

#### Administrativo (ADMINISTRATIVO)

**Permisos de revisión**:

- Revisión de nuevos usuarios
- Validación manual de usuarios
- Gestión de observaciones
- Búsqueda de usuarios y familias
- Acceso limitado a centros asignados

**Dashboard personalizado** con:

- Resumen de usuarios por centro
- Tareas de revisión pendientes
- Estadísticas de estados de validación
- Acciones rápidas: nuevos usuarios, no validados, búsqueda

### Autenticación

- **Token-based authentication**: Sistema seguro basado en tokens
- **Sesiones persistentes**: Renovación automática de tokens
- **Protección CSRF**: Prevención de ataques Cross-Site Request Forgery
- **Validación de permisos**: Verificación en cada request

## 📊 Cortes FONASA

### Carga de Archivos

El sistema permite cargar archivos Excel con cortes mensuales de FONASA:

**Formato esperado**:

- Columnas: RUN, Nombre, Apellido Paterno, Apellido Materno, Fecha Nacimiento, etc.
- Validación automática de formato
- Detección de errores en datos

**Procesamiento**:

- Normalización de RUTs (sin puntos ni guión)
- Validación de fechas
- Creación automática de registros
- **Conteo de duplicados**: Los duplicados de RUN se cuentan correctamente

### Historial Mensual

- Vista de todos los cortes cargados
- Agrupación por mes y año
- Estadísticas por corte: total de registros, fecha de carga
- Descargar archivo original

### Validación contra Base Interna

- Comparación automática con HP Trakcare
- Detección de coincidencias y discrepancias
- Generación de reportes de validación

## 🏥 HP Trakcare

### Importación de Datos

Integración con el sistema HP Trakcare:

- Carga de archivos Excel desde HP
- Mapeo de campos personalizables
- Validación de datos de salud

### Búsqueda de Usuarios

Motor de búsqueda optimizado:

- Búsqueda por RUN, nombre, apellidos
- Filtros por centro de salud
- Resultados paginados
- Vista detallada de información médica

## ✅ Validación de Usuarios

### Estados de Validación

El sistema reconoce 4 estados:

1. **VALIDADO**: Usuario confirmado en ambas fuentes
2. **NO_VALIDADO**: Discrepancias encontradas
3. **PENDIENTE**: En proceso de revisión
4. **FALLECIDO**: Usuario fallecido

### Proceso de Validación

**Automática**:

```python
# El sistema compara automáticamente:
- RUN (identificador único)
- Nombre completo
- Fecha de nacimiento
- Centro de salud
- Dirección
```

**Manual**:

- Revisión caso por caso
- Adición de observaciones
- Cambio de estado con justificación
- Validación en lote

### Sistema de Observaciones

Para usuarios NO_VALIDADOS:

- Historial completo de observaciones
- Fecha y usuario que realizó la observación
- Categorización por tipo
- Seguimiento de resolución

## 📁 Catálogos Maestros

### Gestión de Tablas Maestras

El sistema mantiene catálogos actualizados de:

#### Etnias

- Códigos oficiales FONASA
- Nombres de pueblos originarios
- Estado activo/inactivo

#### Nacionalidades

- Códigos de países
- Nombres en español
- Validación ISO

#### Sectores y Subsectores

- Jerarquía geográfica
- Sectores urbanos/rurales
- Subsectores por sector

#### Establecimientos

Información completa:

- Código único de establecimiento
- Nombre oficial
- Dirección completa
- Comuna y región
- Tipo de establecimiento
- Estado de funcionamiento

### CRUD Completo

Cada catálogo permite:

- **Crear**: Nuevos registros con validación
- **Leer**: Listado paginado con búsqueda
- **Actualizar**: Edición de registros existentes
- **Eliminar**: Borrado lógico o físico

## 🔍 Búsqueda Global

### Características

**Búsqueda unificada** en 6 categorías:

1. Usuarios del Sistema (solo admin)
2. Nuevos Usuarios
3. Cortes FONASA
4. HP Trakcare
5. Establecimientos
6. Logs de Auditoría (solo admin)

**Funcionalidades**:

- Búsqueda en tiempo real con debouncing (300ms)
- Mínimo 2 caracteres para buscar
- Resultados agrupados por categoría
- Iconos y colores por tipo de resultado
- Navegación por teclado (↑↓ Enter Esc)

**Atajos de teclado**:

- `Ctrl + K` / `Cmd + K`: Abrir búsqueda
- `↑` / `↓`: Navegar resultados
- `Enter`: Seleccionar resultado
- `Esc`: Cerrar búsqueda

### Seguridad

- Respeta permisos por rol
- Filtra automáticamente por centros asignados
- Sanitización de queries
- Límite de resultados por categoría

## 📝 Sistema de Auditoría

### Logs de Actividad

**11 tipos de acciones rastreadas**:

- LOGIN / LOGOUT
- CREAR / EDITAR / ELIMINAR
- SUBIR_ARCHIVO
- VALIDAR
- GENERAR_REPORTE
- CAMBIO_PASSWORD
- ASIGNAR_CENTRO
- BUSQUEDA

**7 módulos del sistema**:

- USUARIOS
- CORTES
- NUEVOS_USUARIOS
- HP_TRAKCARE
- VALIDACIONES
- CATALOGOS
- REPORTES

### Información Registrada

Cada log contiene:

```json
{
  "usuario": "admin@example.com",
  "accion": "EDITAR",
  "modulo": "USUARIOS",
  "descripcion": "Editó el usuario john.doe@example.com",
  "timestamp": "2025-01-16T10:30:00Z",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "cambios": {
    "before": {"rol": "INFORMATICO"},
    "after": {"rol": "ADMIN"}
  }
}
```

### Visualización

Panel de administración con:

- Tabla paginada de logs
- Filtros por usuario, acción, módulo, fechas
- Búsqueda por texto
- Vista detallada con JSON formateado
- Exportación a PDF

## 🔔 Notificaciones

### Tipos de Notificaciones

4 niveles de importancia:

- **INFO**: Información general (azul)
- **SUCCESS**: Acciones exitosas (verde)
- **WARNING**: Advertencias (amarillo)
- **ERROR**: Errores críticos (rojo)

### Sistema de Entrega

**Características**:

- Notificaciones en tiempo real
- Auto-refresh cada 30 segundos
- Contador de no leídas en navbar
- Popover con últimas notificaciones
- Marcado individual o masivo como leído

**Estructura**:

```typescript
interface Notificacion {
  id: number;
  tipo: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  titulo: string;
  mensaje: string;
  leida: boolean;
  url?: string;  // URL de navegación opcional
  datos?: any;   // Metadata adicional
  fecha_creacion: string;
}
```

### Uso desde Backend

```python
from api.models import Notificacion

# Crear notificación
Notificacion.crear_para_usuario(
    usuario=usuario,
    tipo=Notificacion.TIPO_SUCCESS,
    titulo="Usuario creado",
    mensaje=f"El usuario {nuevo_usuario.nombre_completo} fue creado exitosamente",
    url=f"/dashboard/admin/usuarios/{nuevo_usuario.id}"
)
```

## 📄 Reportes PDF

### Tipos de Reportes

#### 1. Reporte de Estadísticas

**Contenido**:

- Total de usuarios en el sistema
- Usuarios validados vs no validados
- Nuevos usuarios del mes
- Distribución por centro de salud

**Filtros**:

- Centro específico (opcional)

#### 2. Reporte de Usuarios

**Contenido**:

- Listado de hasta 500 usuarios
- RUN, nombre completo, centro, estado
- Información de filtros aplicados

**Filtros**:

- Centro de salud
- Estado de validación
- Rango de fechas de inscripción

#### 3. Reporte de Logs

**Contenido** (solo admin):

- Últimos 200 logs del sistema
- Timestamp, usuario, acción, descripción
- Información de filtros aplicados

**Filtros**:

- Rango de fechas
- Tipo de acción

### Características Técnicas

**Diseño profesional**:

- Colores corporativos (#1e40af, #3b82f6)
- Logo y header personalizado
- Tablas con alternancia de colores
- Bordes y márgenes consistentes
- Footer con fecha de generación

**Implementación**:

- Backend: ReportLab (Python)
- Frontend: Descarga automática de blob
- Formato: PDF (application/pdf)
- Nombres: `{tipo}_{fecha}.pdf`

## 📈 Dashboards Personalizados

### Widgets Reutilizables

#### QuickActionsWidget

Acciones rápidas según rol:

- Botones grandes con iconos
- Navegación directa
- Indicadores visuales

#### RecentActivityWidget

Actividad reciente del sistema:

- Últimos 5 logs del usuario
- Timestamps relativos
- Iconos por tipo de acción

#### PendingTasksWidget

Tareas pendientes:

- Listado priorizado (alta/media/baja)
- Checkboxes interactivos
- Contadores

### Estadísticas en Tiempo Real

Cada dashboard muestra:

- **Tarjetas de métricas**: Números grandes con tendencias
- **Gráficos**: Charts de distribución
- **Tablas**: Datos tabulares
- **Indicadores**: Progress bars

## 🔒 Seguridad

### Medidas Implementadas

1. **Autenticación robusta**
   - Tokens con expiración
   - Renovación automática
   - Hash de contraseñas (bcrypt)

2. **Autorización por rol**
   - Verificación en cada endpoint
   - Filtrado automático por centros
   - Principio de mínimo privilegio

3. **Auditoría completa**
   - Tracking de todas las acciones
   - Registro de IP y user agent
   - Historial de cambios

4. **Validación de datos**
   - Sanitización de inputs
   - Validación de tipos en TypeScript
   - Serializers de Django REST

5. **Protección contra ataques**
   - CSRF protection
   - SQL injection prevention (ORM)
   - XSS prevention (React escape)
   - Rate limiting (configurable)

## 🚀 Rendimiento

### Optimizaciones

1. **Backend**
   - Queries optimizadas con `select_related()`
   - Paginación en todos los listados
   - Índices en campos de búsqueda
   - Cache de catálogos

2. **Frontend**
   - Code splitting automático (Next.js)
   - Lazy loading de componentes
   - Debouncing en búsquedas
   - Memoización con React.memo

3. **Base de datos**
   - Índices en RUN, email, timestamps
   - Constraints para integridad
   - Particionamiento por fecha (logs)

## 📱 Responsive Design

El sistema es completamente responsive:

- **Desktop**: Layout completo con sidebar
- **Tablet**: Layout adaptado con navegación colapsable
- **Mobile**: Vista móvil optimizada con menú hamburguesa

Breakpoints Tailwind:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px
