# Primeros Pasos

Esta guía te ayudará a familiarizarte con el Sistema Per Cápita FONASA después de la instalación.

## 1. Acceso al Sistema

### Login Inicial

1. Abre tu navegador en `http://localhost:3000/` (desarrollo) o tu URL de producción
2. Verás la página de login
3. Ingresa con el usuario administrador creado:
   - **Email**: `admin@example.com`
   - **Password**: (la contraseña que configuraste)

![Login Page](../images/login.png)

### Dashboard Principal

Después del login exitoso, serás redirigido al dashboard según tu rol:

- **Administrador**: Dashboard con estadísticas globales
- **Informático**: Dashboard enfocado en gestión de datos
- **Administrativo**: Dashboard para revisión de usuarios

## 2. Crear Usuarios del Sistema

Los usuarios del sistema son las personas que operarán la aplicación.

### Pasos

1. **Navegar a Gestión de Usuarios**
   - Sidebar → Administración → Gestión de usuarios
   - O buscar con Ctrl+K: "usuarios"

2. **Crear Nuevo Usuario**
   - Click en "Nuevo Usuario"
   - Completar formulario:
     ```
     Email: informatico1@hospital.cl
     Nombre Completo: Juan Pérez
     Rol: INFORMATICO
     Contraseña: (generar segura)
     ```

3. **Asignar Centros de Salud**
   - Después de crear, click en "Asignar Centros"
   - Seleccionar uno o más establecimientos
   - Guardar

### Roles Disponibles

| Rol | Permisos | Uso Típico |
|-----|----------|------------|
| ADMIN | Acceso total | Administrador del sistema |
| INFORMATICO | Gestión de cortes y datos | Personal de TI de CESFAM |
| ADMINISTRATIVO | Revisión de usuarios | Personal administrativo |

## 3. Cargar Catálogos Maestros

Antes de trabajar con usuarios, configura los catálogos base.

### Establecimientos

1. **Navegar a Catálogos**
   - Sidebar → Catálogos → Establecimientos

2. **Crear Establecimiento**
   ```
   Código: 12345
   Nombre: CESFAM Villa Norte
   Dirección: Av. Principal 123
   Comuna: Santiago
   Región: Metropolitana
   Tipo: CESFAM
   Activo: Sí
   ```

3. **Importar desde Excel** (opcional)
   - Preparar Excel con columnas requeridas
   - Click "Importar"
   - Seleccionar archivo
   - Validar y confirmar

### Otros Catálogos

De forma similar, carga:

- **Etnias**: Mapuche, Aymara, Rapa Nui, etc.
- **Nacionalidades**: Chilena, Peruana, Boliviana, etc.
- **Sectores y Subsectores**: División geográfica

## 4. Cargar Primer Corte FONASA

Los cortes FONASA contienen los usuarios validados por FONASA cada mes.

### Preparar Archivo Excel

El archivo debe tener estas columnas:

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| RUN | RUT sin puntos ni guión | 12345678 |
| Nombre | Nombre | Juan |
| Apellido Paterno | Primer apellido | Pérez |
| Apellido Materno | Segundo apellido | González |
| Fecha Nacimiento | DD/MM/YYYY | 15/03/1980 |
| Centro Salud | Código establecimiento | 12345 |

### Cargar Archivo

1. **Navegar a Cortes FONASA**
   - Sidebar → Gestión de Datos → Cortes FONASA

2. **Subir Archivo**
   - Click "Subir Corte"
   - Seleccionar archivo Excel
   - Indicar mes y año (ej: Enero 2025)
   - Click "Procesar"

3. **Verificar Resultados**
   - Verás resumen de registros procesados
   - Total de usuarios cargados
   - Errores (si los hay)

### Validación Automática

El sistema automáticamente:

- Normaliza RUTs (quita puntos y guión)
- Valida formato de fechas
- Verifica existencia de establecimientos
- **Cuenta duplicados correctamente**

## 5. Cargar Datos HP Trakcare

HP Trakcare es el sistema de gestión hospitalaria.

### Formato del Archivo

Similar al corte FONASA, pero puede incluir:

- Diagnósticos
- Atenciones
- Última visita
- Información médica adicional

### Proceso de Carga

1. **Navegar a HP Trakcare**
   - Sidebar → Gestión de Datos → HP Trakcare

2. **Subir Archivo**
   - Click "Subir HP Trakcare"
   - Seleccionar archivo
   - Validar mapeo de columnas
   - Procesar

3. **Buscar Usuarios**
   - Usar la búsqueda integrada
   - Filtrar por RUN, nombre, centro

## 6. Validar Usuarios

La validación compara cortes FONASA con HP Trakcare.

### Proceso de Validación

1. **Navegar a Validaciones**
   - Sidebar → Validaciones → Validar Usuarios

2. **Seleccionar Corte**
   - Elegir corte FONASA reciente
   - Elegir HP Trakcare correspondiente
   - Click "Iniciar Validación"

3. **Revisar Resultados**
   - **VALIDADO**: Usuario existe en ambas fuentes ✓
   - **NO_VALIDADO**: Discrepancias encontradas ✗
   - **PENDIENTE**: Requiere revisión manual ⏳
   - **FALLECIDO**: Usuario fallecido †

### Validación Manual

Para usuarios NO_VALIDADOS:

1. Click en el usuario
2. Revisar información de ambas fuentes
3. Agregar observaciones si es necesario
4. Cambiar estado manualmente si corresponde

## 7. Gestionar Nuevos Usuarios

Usuarios que se inscribieron pero aún no están validados.

### Revisión de Nuevos Usuarios

1. **Navegar a Nuevos Usuarios**
   - Sidebar → Usuarios → Nuevos Usuarios

2. **Filtrar**
   - Por centro de salud
   - Por estado de inscripción
   - Por rango de fechas

3. **Revisar**
   - Click en usuario
   - Verificar datos personales
   - Marcar como "Revisado" cuando esté correcto

### Validación en Lote

Para procesar múltiples usuarios:

1. Seleccionar usuarios (checkboxes)
2. Click "Validar Seleccionados"
3. Confirmar acción

## 8. Usar Búsqueda Global

Encuentra cualquier cosa en el sistema rápidamente.

### Atajo de Teclado

- **Windows/Linux**: `Ctrl + K`
- **macOS**: `Cmd + K`

### Tipos de Búsqueda

La búsqueda buscará en:

1. **Usuarios del Sistema** (solo admin)
2. **Nuevos Usuarios** - Por RUN o nombre
3. **Cortes FONASA** - Por mes/año
4. **HP Trakcare** - Por RUN
5. **Establecimientos** - Por nombre o código
6. **Logs** (solo admin) - Por acción

### Navegación por Teclado

- `↓` / `↑`: Navegar resultados
- `Enter`: Abrir resultado seleccionado
- `Esc`: Cerrar búsqueda

## 9. Generar Reportes

Crea reportes PDF profesionales.

### Tipos de Reportes

1. **Reporte de Estadísticas**
   - Estadísticas globales
   - Distribución por centro
   - Usuarios validados vs no validados

2. **Reporte de Usuarios**
   - Listado de usuarios
   - Filtros: centro, estado, fechas
   - Hasta 500 usuarios

3. **Reporte de Logs** (solo admin)
   - Auditoría del sistema
   - Filtros: fechas, acciones
   - Últimos 200 logs

### Generar Reporte

1. **Desde Dashboard**
   - Widget "Acciones Rápidas"
   - Click "Reportes"

2. **Configurar Filtros**
   - Seleccionar tipo de reporte
   - Aplicar filtros deseados
   - Click "Descargar PDF"

3. **Abrir PDF**
   - El archivo se descarga automáticamente
   - Nombre: `{tipo}_{fecha}.pdf`

## 10. Revisar Auditoría

Todos los cambios se registran automáticamente.

### Acceder a Logs (Solo Admin)

1. **Navegar a Logs**
   - Sidebar → Administración → Logs de auditoría

2. **Filtrar Logs**
   - Por usuario
   - Por acción (LOGIN, CREAR, EDITAR, etc.)
   - Por módulo (USUARIOS, CORTES, etc.)
   - Por rango de fechas

3. **Ver Detalles**
   - Click en log
   - Ver descripción completa
   - Ver cambios (before/after en JSON)
   - Ver IP y user agent

### Información Registrada

Cada log incluye:

- ✓ Usuario que realizó la acción
- ✓ Timestamp exacto
- ✓ Tipo de acción
- ✓ Módulo afectado
- ✓ Descripción textual
- ✓ Cambios en formato JSON
- ✓ IP address
- ✓ User agent del navegador

## 11. Gestionar Notificaciones

El sistema envía notificaciones automáticas.

### Ver Notificaciones

1. **Icono de Campana**
   - Navbar superior derecha
   - Badge con número de no leídas

2. **Click para Expandir**
   - Listado de últimas notificaciones
   - Colores por tipo:
     - 🔵 INFO: Azul
     - 🟢 SUCCESS: Verde
     - 🟡 WARNING: Amarillo
     - 🔴 ERROR: Rojo

3. **Marcar como Leída**
   - Click en notificación → navega y marca como leída
   - O "Marcar todas como leídas"

### Auto-refresh

Las notificaciones se actualizan automáticamente cada 30 segundos.

## 12. Cambiar Contraseña

### Cambiar Tu Propia Contraseña

1. **Navbar** → Avatar/Nombre
2. Click "Cambiar Contraseña"
3. Ingresar:
   - Contraseña actual
   - Nueva contraseña
   - Confirmar nueva contraseña
4. Guardar

### Resetear Contraseña de Usuario (Admin)

1. **Gestión de Usuarios**
2. Seleccionar usuario
3. Click "Resetear Contraseña"
4. Se genera contraseña temporal
5. Enviar al usuario (email o comunicación directa)

## 13. Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl/Cmd + K` | Abrir búsqueda global |
| `Esc` | Cerrar modal/diálogo |
| `↑` `↓` | Navegar en listas |
| `Enter` | Seleccionar/Confirmar |
| `Ctrl/Cmd + S` | Guardar (en formularios) |

## 14. Mejores Prácticas

### Carga de Datos

- ✓ Valida archivos Excel antes de subir
- ✓ Carga cortes FONASA mensualmente
- ✓ Mantén HP Trakcare actualizado
- ✓ Revisa errores inmediatamente

### Seguridad

- ✓ Usa contraseñas fuertes (min 8 caracteres)
- ✓ No compartas credenciales
- ✓ Cierra sesión en computadores compartidos
- ✓ Revisa logs de tu usuario periódicamente

### Validación

- ✓ Revisa usuarios NO_VALIDADOS semanalmente
- ✓ Agrega observaciones detalladas
- ✓ No cambies estados sin justificación
- ✓ Usa validación en lote cuando sea apropiado

### Mantenimiento

- ✓ Genera backups regularmente (admin)
- ✓ Limpia archivos antiguos
- ✓ Monitorea espacio en disco
- ✓ Revisa logs de errores

## 15. Próximos Pasos

Ahora que conoces lo básico:

1. **Lee tu guía de usuario según rol**:
   - [Guía del Administrador](../user-guide/admin.md)
   - [Guía del Informático](../user-guide/informatico.md)
   - [Guía del Administrativo](../user-guide/administrativo.md)

2. **Explora la API**:
   - [Documentación de API](../api/index.md)
   - [Endpoints](../api/endpoints/usuarios.md)

3. **Configuración avanzada**:
   - [Deployment](../deployment/production.md)
   - [Seguridad](../deployment/security.md)

## Recursos de Ayuda

- 📚 [FAQ](../reference/faq.md)
- 🔧 [Solución de Problemas](../reference/troubleshooting.md)
- 📖 [Glosario](../reference/glossary.md)
- 📧 Email: soporte@percapita.example.com
