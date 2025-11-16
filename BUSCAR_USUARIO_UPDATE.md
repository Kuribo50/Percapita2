# Actualización: Búsqueda de Usuario - Inclusión de Nuevos Usuarios

## Cambios Realizados

Se ha actualizado la funcionalidad de **Búsqueda de Usuario** para incluir también los registros de la tabla **NuevoUsuario**, permitiendo una búsqueda más completa del usuario en el sistema.

### ✅ Mejoras Implementadas

#### Backend (Django)

**Archivo**: `backend/api/views.py` - Función `buscar_usuario()`

**Cambios**:

1. ✅ Búsqueda adicional en la tabla `NuevoUsuario`
2. ✅ Serialización completa de datos de nuevos usuarios
3. ✅ Incluye información de:
   - Datos personales completos
   - Periodo de inscripción
   - Estado (PENDIENTE, VALIDADO, NO_VALIDADO, FALLECIDO)
   - Revisión (si fue revisado, por quién y cuándo)
   - Observaciones generales y de Trakcare
   - Relaciones con catálogos (nacionalidad, etnia, sector, etc.)

**Nueva estructura de respuesta**:

```python
response_data = {
    "run": normalized_run,
    "encontrado": len(cortes) > 0 or hp_records.exists() or nuevos_usuarios.exists(),
    "cortes_por_mes": cortes_por_mes_list,
    "hp_trakcare": hp_data,
    "nuevos_usuarios": nuevos_usuarios_data,  # ← NUEVO
    "total_meses": len(cortes_por_mes_list),
    "total_nuevos_usuarios": len(nuevos_usuarios_data),  # ← NUEVO
}
```

#### Frontend (TypeScript)

**Archivo**: `frontend/services/usuarios.service.ts`

**Nuevos tipos**:

```typescript
export interface BuscarUsuarioResponse {
  run: string;
  encontrado: boolean;
  cortes_por_mes: CortesPorMes[];
  hp_trakcare: HpTrakcareData | null;
  nuevos_usuarios: NuevoUsuarioData[]; // ← NUEVO
  total_meses: number;
  total_nuevos_usuarios: number; // ← NUEVO
}

export interface NuevoUsuarioData {
  id: number;
  run: string;
  nombre_completo: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_inscripcion: string | null;
  periodo: string;
  periodo_mes: number;
  periodo_anio: number;
  nacionalidad: string | null;
  etnia: string | null;
  sector: string | null;
  subsector: string | null;
  centro: string;
  establecimiento: string | null;
  codigo_percapita: string;
  estado: string;
  estado_display: string;
  revisado: boolean;
  revisado_manualmente: boolean;
  revisado_por: string;
  revisado_el: string | null;
  observaciones: string;
  observaciones_trakcare: string;
  creado_el: string | null;
  creado_por: string;
}
```

**Archivo**: `frontend/app/dashboard/buscar-usuario/page.tsx`

**Nueva sección en la UI**:

- ✅ Card "Nuevos Usuarios" con contador
- ✅ Lista de todos los registros de inscripciones previas
- ✅ Badges de estado (Validado, No Validado, Pendiente, Fallecido)
- ✅ Indicador de revisión
- ✅ Información completa del periodo
- ✅ Observaciones generales y de Trakcare
- ✅ Datos de quién y cuándo revisó

### 📊 Información Mostrada en Nuevos Usuarios

Para cada registro de nuevo usuario se muestra:

1. **Encabezado**:

   - Nombre completo
   - Periodo (ej: "Octubre 2024")
   - Estado con badge de color
   - Indicador de revisión

2. **Datos principales**:

   - Fecha de inscripción
   - Nacionalidad
   - Etnia
   - Sector y Subsector
   - Centro de salud
   - Establecimiento
   - Código Percapita

3. **Observaciones**:

   - Observaciones generales
   - Observaciones de Trakcare

4. **Metadatos de revisión**:
   - Si fue revisado
   - Quién lo revisó
   - Cuándo fue revisado

### 🎨 Diseño Visual

**Estados con colores**:

- 🟢 **VALIDADO**: Badge verde (default)
- 🔴 **NO_VALIDADO**: Badge rojo (destructive)
- ⚪ **FALLECIDO**: Badge gris (secondary)
- 🔵 **PENDIENTE**: Badge outline

**Indicadores adicionales**:

- ✅ Badge "Revisado" con ícono CheckCircle

### 🔍 Lógica de Búsqueda Mejorada

Ahora el sistema busca en **TRES** fuentes de datos:

1. **CorteFonasa**: Registros mensuales del corte FONASA
2. **HpTrakcare**: Sistema hospitalario Trakcare
3. **NuevoUsuario**: Inscripciones previas al corte mensual ← **NUEVO**

El usuario se considera **encontrado** si aparece en **cualquiera** de las tres tablas.

### 📝 Caso de Uso

**Escenario**: Un usuario se inscribe en Diciembre 2024 pero el corte FONASA de ese mes aún no se ha cargado.

**Antes**:

- ❌ No se encontraría información del usuario
- Solo aparecería si ya existe en Trakcare o en un corte anterior

**Ahora**:

- ✅ Se muestra en la sección "Nuevos Usuarios"
- Se puede ver su información de inscripción
- Se puede verificar su estado (Pendiente, Validado, etc.)
- Se pueden leer observaciones sobre su caso

### 🎯 Ventajas de la Actualización

1. **Búsqueda más completa**: No se pierde información de usuarios recién inscritos
2. **Seguimiento temporal**: Se puede ver el historial de inscripciones por periodo
3. **Estado claro**: Badges visuales indican el estado actual del usuario
4. **Trazabilidad**: Se registra quién revisó y cuándo
5. **Observaciones contextuales**: Tanto generales como específicas de Trakcare
6. **Integración total**: Toda la información del usuario en un solo lugar

### 📂 Archivos Modificados

- ✅ `backend/api/views.py`
- ✅ `frontend/services/usuarios.service.ts`
- ✅ `frontend/app/dashboard/buscar-usuario/page.tsx`
- ✅ `BUSCAR_USUARIO_README.md` (documentación original)
- ✅ `BUSCAR_USUARIO_UPDATE.md` (este archivo)

### 🚀 Próximos Pasos Sugeridos

1. **Filtros**: Permitir filtrar nuevos usuarios por estado o periodo
2. **Orden**: Opciones para ordenar por fecha, estado, etc.
3. **Acciones rápidas**: Botones para marcar como revisado desde la búsqueda
4. **Timeline**: Visualización temporal de todos los registros del usuario
5. **Comparación**: Detectar diferencias entre Nuevos Usuarios y Cortes FONASA

---

**Fecha de actualización**: 14 de noviembre de 2025
**Versión**: 2.0
