# Servicios de API - Frontend

Este directorio contiene todos los servicios centralizados para interactuar con la API del backend. Todos los servicios utilizan un cliente HTTP unificado con manejo de autenticación automático y gestión de errores.

## Estructura de Servicios

```
services/
├── api.ts                  # Cliente HTTP centralizado (ApiClient)
├── auth.service.ts        # Servicio de autenticación
├── usuarios.service.ts    # Servicio de nuevos usuarios
├── cortes.service.ts      # Servicio de cortes FONASA
├── catalogos.service.ts   # Servicio de catálogos (CRUD completo)
├── historial.service.ts   # Servicio de historial de cargas
├── index.ts              # Exportaciones centralizadas
└── README.md             # Esta documentación
```

## Configuración

### Variable de Entorno

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Si no se configura, usa por defecto: `http://localhost:8000/api`

## Uso Básico

### Importación

```typescript
// Importar servicio específico
import { authService, usuariosService, cortesService } from '@/services';

// Importar tipos
import type { NuevoUsuario, ApiResponse } from '@/services';
```

### Respuestas de API

Todas las llamadas devuelven un objeto `ApiResponse<T>`:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    status: number;
    data?: unknown;
  };
}
```

### Ejemplo de Uso

```typescript
const response = await usuariosService.getNuevosUsuarios({ page: 1 });

if (response.success) {
  console.log('Datos:', response.data);
} else {
  console.error('Error:', response.error?.message);
}
```

## Servicios Disponibles

### 1. ApiClient (`api.ts`)

Cliente HTTP base con métodos:
- `get<T>(endpoint, options?)`
- `post<T>(endpoint, body?, options?)`
- `put<T>(endpoint, body?, options?)`
- `patch<T>(endpoint, body?, options?)`
- `delete<T>(endpoint, options?)`
- `uploadFile<T>(endpoint, file, additionalData?)`

**Características:**
- Añade automáticamente el token de autenticación desde localStorage
- Manejo unificado de errores
- Soporte para uploads de archivos

### 2. Auth Service (`auth.service.ts`)

#### Métodos Disponibles

```typescript
// Login
await authService.login({ rut: '12345678-9', password: '***' });

// Registro
await authService.register({
  rut: '12345678-9',
  nombre: 'Juan',
  apellido: 'Pérez',
  email: 'juan@example.com',
  establecimiento: 'Hospital',
  password: '***'
});

// Logout
authService.logout();

// Refrescar token
await authService.refreshToken();

// Obtener usuario actual
await authService.getCurrentUser();

// Verificar si está autenticado
const isAuth = authService.isAuthenticated();

// Obtener token de acceso
const token = authService.getAccessToken();

// Obtener usuario guardado
const user = authService.getStoredUser();
```

### 3. Usuarios Service (`usuarios.service.ts`)

Gestión de nuevos usuarios del sistema.

#### Métodos Disponibles

```typescript
// Listar usuarios con paginación y filtros
await usuariosService.getNuevosUsuarios({
  page: 1,
  page_size: 20,
  revisado: false,
  centro_inscripcion: 1,
  search: 'juan'
});

// Obtener usuario por ID
await usuariosService.getUsuarioById(123);

// Crear usuario
await usuariosService.createUsuario({
  run: '12345678-9',
  nombres: 'Juan',
  apellido_paterno: 'Pérez',
  // ... más campos
});

// Actualizar usuario
await usuariosService.updateUsuario(123, { telefono: '912345678' });

// Eliminar usuario
await usuariosService.deleteUsuario(123);

// Marcar como revisado
await usuariosService.marcarRevisado(123);

// Subir archivo de usuarios
await usuariosService.uploadUsuarios(file);

// Obtener estadísticas
await usuariosService.getEstadisticas();

// Exportar a Excel
const response = await usuariosService.exportarUsuarios({ revisado: true });
if (response.success && response.data) {
  const url = URL.createObjectURL(response.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'usuarios.xlsx';
  a.click();
}

// Validar usuarios en lote
await usuariosService.validarLote([1, 2, 3, 4]);
```

### 4. Cortes Service (`cortes.service.ts`)

Gestión de cortes FONASA.

#### Métodos Disponibles

```typescript
// Listar cortes con paginación y filtros
await cortesService.getCortes({
  page: 1,
  page_size: 20,
  fecha_corte: '2024-01',
  centro_salud: 1,
  motivo_normalizado: 'cambio_domicilio'
});

// Obtener corte por ID
await cortesService.getCorteById(123);

// Subir archivo de cortes
await cortesService.uploadCorte(file);

// Buscar por RUN
await cortesService.buscarPorRun('12345678-9');
```

### 5. Catálogos Service (`catalogos.service.ts`)

Gestión completa CRUD de todos los catálogos del sistema.

#### Obtener Todos los Catálogos

```typescript
// Obtener todos los catálogos en una sola llamada
const response = await catalogosService.getAllCatalogos();
if (response.success) {
  const { etnias, nacionalidades, sectores, subsectores, establecimientos, centros_salud } = response.data;
}
```

#### Etnias

```typescript
// Listar
await catalogosService.getEtnias();

// Obtener por ID
await catalogosService.getEtniaById(1);

// Crear
await catalogosService.createEtnia({
  nombre: 'Mapuche',
  codigo: 'MAP',
  activo: true,
  orden: 1
});

// Actualizar
await catalogosService.updateEtnia(1, { nombre: 'Mapuche Actualizado' });

// Eliminar
await catalogosService.deleteEtnia(1);
```

#### Nacionalidades

```typescript
await catalogosService.getNacionalidades();
await catalogosService.getNacionalidadById(1);
await catalogosService.createNacionalidad({ nombre: 'Chilena', codigo: 'CL' });
await catalogosService.updateNacionalidad(1, { nombre: 'Chile' });
await catalogosService.deleteNacionalidad(1);
```

#### Sectores

```typescript
await catalogosService.getSectores();
await catalogosService.getSectorById(1);
await catalogosService.createSector({ nombre: 'Sector Norte', color: '#FF0000' });
await catalogosService.updateSector(1, { nombre: 'Sector Norte Actualizado' });
await catalogosService.deleteSector(1);
```

#### Subsectores

```typescript
await catalogosService.getSubsectores();
await catalogosService.getSubsectorById(1);
await catalogosService.createSubsector({ nombre: 'Subsector A', sector: 1 });
await catalogosService.updateSubsector(1, { nombre: 'Subsector A Modificado' });
await catalogosService.deleteSubsector(1);
```

#### Establecimientos

```typescript
await catalogosService.getEstablecimientos();
await catalogosService.getEstablecimientoById(1);
await catalogosService.createEstablecimiento({
  nombre: 'Hospital Regional',
  codigo: 'HR01',
  tipo: 'hospital',
  direccion: 'Calle Principal 123'
});
await catalogosService.updateEstablecimiento(1, { telefono: '123456789' });
await catalogosService.deleteEstablecimiento(1);
```

#### Centros de Salud

```typescript
await catalogosService.getCentrosSalud();
await catalogosService.getCentroSaludById(1);
await catalogosService.createCentroSalud({
  nombre: 'CESFAM Centro',
  codigo: 'CS01',
  establecimiento: 1
});
await catalogosService.updateCentroSalud(1, { tipo: 'CESFAM' });
await catalogosService.deleteCentroSalud(1);

// Obtener centros disponibles (simplificado)
await catalogosService.getCentrosDisponibles();
```

### 6. Historial Service (`historial.service.ts`)

Gestión del historial de cargas de archivos.

#### Métodos Disponibles

```typescript
// Listar historial con filtros
await historialService.getHistorial({
  page: 1,
  page_size: 20,
  tipo: 'usuarios', // o 'cortes'
  estado: 'completado',
  fecha_desde: '2024-01-01',
  fecha_hasta: '2024-12-31'
});

// Obtener por ID
await historialService.getHistorialById(123);

// Eliminar registro
await historialService.deleteHistorial(123);
```

## Manejo de Errores

### Patrón Recomendado

```typescript
async function cargarUsuarios() {
  const response = await usuariosService.getNuevosUsuarios();

  if (response.success) {
    // Manejar éxito
    console.log('Usuarios:', response.data);
  } else {
    // Manejar error
    const error = response.error;
    console.error(`Error ${error?.status}: ${error?.message}`);

    // Manejo específico por código de estado
    switch (error?.status) {
      case 401:
        // Redirigir a login
        break;
      case 404:
        // Mostrar mensaje de no encontrado
        break;
      case 500:
        // Error del servidor
        break;
    }
  }
}
```

### Uso con React

```typescript
import { useState, useEffect } from 'react';
import { usuariosService, type NuevoUsuario } from '@/services';

function UsuariosComponent() {
  const [usuarios, setUsuarios] = useState<NuevoUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsuarios() {
      setLoading(true);
      const response = await usuariosService.getNuevosUsuarios();

      if (response.success) {
        setUsuarios(response.data?.results || []);
      } else {
        setError(response.error?.message || 'Error desconocido');
      }

      setLoading(false);
    }

    loadUsuarios();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {usuarios.map(u => (
        <li key={u.id}>{u.nombres} {u.apellido_paterno}</li>
      ))}
    </ul>
  );
}
```

## Autenticación Automática

Todos los servicios heredan la autenticación del `ApiClient`. El token se obtiene automáticamente de localStorage:

```typescript
// No es necesario añadir manualmente el token
// El ApiClient lo hace automáticamente
const response = await usuariosService.getNuevosUsuarios();
```

## TypeScript

Todos los servicios están completamente tipados con TypeScript. Importa los tipos necesarios:

```typescript
import type {
  // API Base
  ApiResponse,
  ApiError,

  // Auth
  User,
  LoginCredentials,
  RegisterData,

  // Usuarios
  NuevoUsuario,
  NuevosUsuariosListResponse,
  EstadisticasResponse,

  // Cortes
  CorteFonasa,
  CorteFonasaListResponse,

  // Catálogos
  Etnia,
  Nacionalidad,
  Sector,
  Subsector,
  Establecimiento,
  CentroSalud,
  AllCatalogosResponse,

  // Historial
  HistorialCarga,
  HistorialCargaListResponse,
} from '@/services';
```

## Buenas Prácticas

1. **Siempre verifica `response.success`** antes de acceder a `response.data`
2. **Maneja los errores apropiadamente** según el código de estado
3. **Usa tipos TypeScript** para mejor autocompletado y seguridad
4. **No uses fetch directo** - utiliza los servicios centralizados
5. **Importa desde el barrel export** (`@/services`) para mejor organización
6. **Crea custom hooks** para lógica reutilizable de fetching

## Ejemplo de Custom Hook

```typescript
import { useState, useEffect } from 'react';
import { usuariosService, type NuevosUsuariosListResponse, type ApiResponse } from '@/services';

export function useNuevosUsuarios(page: number = 1) {
  const [data, setData] = useState<NuevosUsuariosListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      const response = await usuariosService.getNuevosUsuarios({ page });

      if (response.success) {
        setData(response.data || null);
      } else {
        setError(response.error?.message || 'Error desconocido');
      }

      setLoading(false);
    }

    load();
  }, [page]);

  return { data, loading, error };
}
```

## Soporte

Para reportar problemas o sugerir mejoras, contacta al equipo de desarrollo.
