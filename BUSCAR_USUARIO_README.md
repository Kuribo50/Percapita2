# Funcionalidad de Búsqueda de Usuario

## Descripción

Nueva funcionalidad implementada que permite buscar un usuario por RUT y visualizar toda su información histórica en el sistema, incluyendo:

- Datos de **HP Trakcare**
- Historial mensual de **Cortes FONASA**
- **Observaciones** asociadas a cada mes
- Estado de **validación** por mes

## Componentes Implementados

### Backend (Django)

#### 1. Vista: `buscar_usuario` (`backend/api/views.py`)

- **Endpoint**: `GET /api/buscar-usuario/?run=<RUT>`
- **Funcionalidad**:
  - Busca el usuario por RUT normalizado
  - Obtiene todos los registros de CorteFonasa agrupados por mes
  - Obtiene datos de HpTrakcare
  - Incluye observaciones de cada corte
  - Calcula el estado de validación por mes

#### 2. URL: `backend/api/urls.py`

```python
path("buscar-usuario/", views.buscar_usuario, name="buscar-usuario")
```

### Frontend (Next.js + TypeScript)

#### 1. Servicio: `usuariosService.buscarUsuario()` (`frontend/services/usuarios.service.ts`)

- Método para consumir el endpoint de búsqueda
- Tipos TypeScript completos para la respuesta:
  - `BuscarUsuarioResponse`
  - `CortesPorMes`
  - `CorteRegistro`
  - `ObservacionData`
  - `HpTrakcareData`

#### 2. Página: `/dashboard/buscar-usuario` (`frontend/app/dashboard/buscar-usuario/page.tsx`)

Componentes de UI utilizados:

- Input para ingresar el RUT
- Card para mostrar datos de HP Trakcare
- Collapsible para expandir/colapsar información mensual
- Badges para indicar estado de validación
- Alert para mensajes de error
- Skeleton para loading states

#### 3. Navegación: Sidebar actualizado (`frontend/components/navigation/data.ts`)

- Nueva entrada "Buscar usuario" en la sección "Bases de Datos"
- Icono: UserSearch (lucide-react)
- Color: text-emerald-500

## Estructura de Datos

### Respuesta del Endpoint

```typescript
{
  run: string;                    // RUT normalizado
  encontrado: boolean;            // Si se encontraron registros
  total_meses: number;            // Cantidad de meses con registros
  hp_trakcare: {                  // Datos de HP Trakcare (puede ser null)
    id: number;
    run: string;
    nombre_completo: string;
    fecha_nacimiento: string;
    genero: string;
    edad: number;
    direccion: string;
    telefono: string;
    telefono_celular: string;
    etnia: string;
    nacionalidad: string;
    centro_inscripcion: string;
    sector: string;
    prevision: string;
    fecha_incorporacion: string;
    fecha_defuncion: string | null;
    esta_vivo: boolean;
  };
  cortes_por_mes: [               // Array de registros agrupados por mes
    {
      mes_key: string;            // Formato: "YYYY-MM"
      mes: string;                // Formato legible: "Octubre 2024"
      fecha_corte: string;
      validado: boolean;          // Estado de validación del mes
      registros: [                // Registros de ese mes
        {
          id: number;
          run: string;
          nombre_completo: string;
          fecha_nacimiento: string;
          genero: string;
          tramo: string;
          centro_salud: string;
          centro_procedencia: string;
          comuna_procedencia: string;
          centro_actual: string;
          comuna_actual: string;
          aceptado_rechazado: string;
          motivo: string;
          validado: boolean;
        }
      ];
      observaciones: [            // Observaciones del mes
        {
          id: number;
          corte_id: number;
          titulo: string;
          texto: string;
          estado_revision: string;
          tipo: string;
          autor_nombre: string;
          created_at: string;
          adjunto: string | null;
        }
      ];
    }
  ];
}
```

## Uso

### En la Aplicación

1. Acceder al sidebar y seleccionar "Buscar usuario" en la sección "Bases de Datos"
2. Ingresar el RUT del usuario a buscar (con o sin formato)
3. Presionar "Buscar" o Enter
4. Visualizar los resultados:
   - Información general de HP Trakcare
   - Historial mensual de cortes FONASA (expandible)
   - Estado de validación por mes
   - Observaciones asociadas

### Características de la UI

- **Búsqueda**: Input con validación de RUT
- **Loading states**: Skeleton mientras carga
- **Error handling**: Mensajes de error claros
- **Responsive**: Diseño adaptable a diferentes tamaños de pantalla
- **Collapsible**: Secciones mensuales que se pueden expandir/colapsar
- **Badges**: Indicadores visuales de estado (Validado/No Validado)
- **Formato de fechas**: Fechas en formato español (dd/mm/yyyy)

## Validación de Usuario

La lógica de validación (`_is_validated_corte` en views.py) determina si un registro está validado:

1. Si `aceptado_rechazado == "ACEPTADO"` → **Validado**
2. Si `aceptado_rechazado` contiene "RECHAZADO" o "RECHAZO" → **No Validado**
3. Si el motivo está en `NON_VALIDATED_MOTIVOS` → **No Validado**
   - "TRASLADO NEGATIVO"
   - "RECHAZADO PREVISIONAL"
   - "RECHAZADO FALLECIDO"
4. Si el motivo contiene "FALLECIDO" → **No Validado**
5. Por defecto → **Validado**

## Navegación

Ubicación en el sidebar:

```
Bases de Datos
  ├── Panel de bases
  ├── HP Trakcare
  └── Buscar usuario  ← NUEVA FUNCIONALIDAD
```

## Archivos Modificados/Creados

### Backend

- ✅ `backend/api/views.py` - Nueva vista `buscar_usuario`
- ✅ `backend/api/urls.py` - Nueva ruta

### Frontend

- ✅ `frontend/app/dashboard/buscar-usuario/page.tsx` - Nueva página
- ✅ `frontend/services/usuarios.service.ts` - Nuevo método y tipos
- ✅ `frontend/components/navigation/data.ts` - Nueva entrada en navegación
- ✅ `frontend/components/ui/collapsible.tsx` - Componente UI reutilizable

## Próximas Mejoras Sugeridas

1. **Exportar resultados**: Agregar botón para exportar la información del usuario a PDF o Excel
2. **Gráficos**: Visualización temporal del estado de validación
3. **Comparación**: Detectar cambios entre meses automáticamente
4. **Búsqueda avanzada**: Permitir búsqueda por nombre, no solo RUT
5. **Historial de búsquedas**: Guardar búsquedas recientes
6. **Notificaciones**: Alertas cuando cambie el estado de un usuario
