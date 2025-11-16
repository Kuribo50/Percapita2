# API de Backend

Documentación completa de la API REST del Sistema Per Cápita FONASA.

## Visión General

La API está construida con Django REST Framework y proporciona endpoints para todas las operaciones del sistema.

**Base URL**: `http://localhost:8000/api/` (desarrollo)

**Formato**: JSON

**Autenticación**: Token-based

## Autenticación

Todos los endpoints (excepto login) requieren autenticación mediante token.

```http
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

[Ver documentación completa de autenticación](authentication.md)

## Estructura de Respuestas

### Éxito

```json
{
  "id": 1,
  "nombre": "Usuario",
  "email": "usuario@example.com",
  ...
}
```

### Error

```json
{
  "detail": "Mensaje de error descriptivo"
}
```

### Listado Paginado

```json
{
  "count": 150,
  "next": "http://api.example.com/usuarios/?page=2",
  "previous": null,
  "results": [...]
}
```

## Endpoints Principales

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login/` | Iniciar sesión |
| POST | `/auth/logout/` | Cerrar sesión |
| GET | `/auth/me/` | Obtener usuario actual |

[Documentación detallada](authentication.md)

### Usuarios del Sistema

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/usuarios/` | Listar usuarios |
| POST | `/usuarios/` | Crear usuario |
| GET | `/usuarios/{id}/` | Obtener usuario |
| PUT | `/usuarios/{id}/` | Actualizar usuario |
| DELETE | `/usuarios/{id}/` | Eliminar usuario |
| POST | `/usuarios/{id}/cambiar-password/` | Cambiar contraseña |
| POST | `/usuarios/{id}/restablecer-password/` | Resetear contraseña |
| POST | `/usuarios/{id}/asignar-centros/` | Asignar centros |

[Documentación detallada](endpoints/usuarios.md)

### Cortes FONASA

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/corte-fonasa/` | Cargar corte |
| GET | `/corte-fonasa/{id}/` | Obtener corte |
| GET | `/corte-fonasa/historial-mensual/` | Historial mensual |

[Documentación detallada](endpoints/cortes.md)

### HP Trakcare

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/hp-trakcare/` | Cargar datos |
| GET | `/hp-trakcare/{id}/` | Obtener registro |
| GET | `/hp-trakcare/buscar/` | Buscar usuarios |

[Documentación detallada](endpoints/hp-trakcare.md)

### Nuevos Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/nuevos-usuarios/` | Listar nuevos usuarios |
| POST | `/nuevos-usuarios/upload/` | Cargar desde Excel |
| GET | `/nuevos-usuarios/{id}/` | Obtener detalles |
| PATCH | `/nuevos-usuarios/{id}/` | Actualizar |
| POST | `/nuevos-usuarios/{id}/marcar-revisado/` | Marcar revisado |
| POST | `/nuevos-usuarios/validar-lote/` | Validar múltiples |
| GET | `/nuevos-usuarios/estadisticas/` | Estadísticas |
| GET | `/nuevos-usuarios/exportar/` | Exportar Excel |

[Documentación detallada](endpoints/nuevos-usuarios.md)

### Validaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/validaciones/` | Listar validaciones |
| POST | `/validaciones/validar-corte/` | Validar contra corte |
| GET | `/validaciones/{id}/` | Obtener validación |

[Documentación detallada](endpoints/validaciones.md)

### Catálogos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/catalogos/all/` | Todos los catálogos |
| GET/POST | `/catalogos/etnias/` | Etnias |
| GET/POST | `/catalogos/nacionalidades/` | Nacionalidades |
| GET/POST | `/catalogos/sectores/` | Sectores |
| GET/POST | `/catalogos/subsectores/` | Subsectores |
| GET/POST | `/catalogos/establecimientos/` | Establecimientos |

[Documentación detallada](endpoints/catalogos.md)

### Búsqueda

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/buscar-usuario/` | Buscar usuario |
| GET | `/buscar-familia/` | Buscar familia |
| GET | `/busqueda-global/` | Búsqueda global |

[Documentación detallada](endpoints/busqueda.md)

### Auditoría

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/logs/` | Listar logs |
| GET | `/logs/{id}/` | Obtener log |
| GET | `/logs/acciones/` | Acciones disponibles |
| GET | `/logs/modulos/` | Módulos disponibles |

[Documentación detallada](endpoints/auditoria.md)

### Notificaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/notificaciones/` | Listar notificaciones |
| POST | `/notificaciones/{id}/marcar-leida/` | Marcar como leída |
| POST | `/notificaciones/marcar-todas-leidas/` | Marcar todas |
| GET | `/notificaciones/count/` | Contador no leídas |

[Documentación detallada](endpoints/notificaciones.md)

### Reportes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/reportes/estadisticas/` | Reporte de estadísticas (PDF) |
| GET | `/reportes/usuarios/` | Reporte de usuarios (PDF) |
| GET | `/reportes/logs/` | Reporte de logs (PDF) |

[Documentación detallada](endpoints/reportes.md)

## Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado |
| 204 | No Content - Éxito sin contenido |
| 400 | Bad Request - Error en la solicitud |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |
| 503 | Service Unavailable - Servicio no disponible |

## Filtros Comunes

### Paginación

```http
GET /api/usuarios/?page=2&page_size=50
```

### Búsqueda

```http
GET /api/usuarios/?search=juan
```

### Ordenamiento

```http
GET /api/usuarios/?ordering=-fecha_creacion
GET /api/usuarios/?ordering=nombre_completo
```

### Filtros Específicos

```http
GET /api/nuevos-usuarios/?centro_salud_id=5
GET /api/nuevos-usuarios/?estado_inscripcion=VALIDADO
GET /api/nuevos-usuarios/?fecha_desde=2025-01-01&fecha_hasta=2025-01-31
```

## Rate Limiting

Para proteger el servidor, se aplican límites:

- **Anónimo**: 100 solicitudes/hora
- **Autenticado**: 1000 solicitudes/hora
- **Admin**: Sin límite

Headers de respuesta:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642533600
```

## Versionado

La API actualmente está en versión 1.

Versiones futuras se indicarán en la URL:

```
/api/v2/usuarios/
```

## CORS

Los siguientes orígenes están permitidos:

- `http://localhost:3000` (desarrollo)
- `https://percapita.example.com` (producción)

Headers permitidos:

```http
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
```

## Ejemplos de Uso

### cURL

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@example.com","password":"password123"}'

# Listar usuarios
curl -X GET http://localhost:8000/api/usuarios/ \
  -H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
```

### JavaScript (Axios)

```javascript
// Login
const response = await axios.post('http://localhost:8000/api/auth/login/', {
  username: 'admin@example.com',
  password: 'password123'
});

const token = response.data.token;

// Listar usuarios
const usuarios = await axios.get('http://localhost:8000/api/usuarios/', {
  headers: {
    'Authorization': `Token ${token}`
  }
});
```

### Python (requests)

```python
import requests

# Login
response = requests.post('http://localhost:8000/api/auth/login/', json={
    'username': 'admin@example.com',
    'password': 'password123'
})

token = response.json()['token']

# Listar usuarios
headers = {'Authorization': f'Token {token}'}
usuarios = requests.get('http://localhost:8000/api/usuarios/', headers=headers)
```

## WebSocket (Futuro)

Planeado para notificaciones en tiempo real:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/notificaciones/');

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('Nueva notificación:', notification);
};
```

## Recursos Adicionales

- [Modelos de Datos](models.md)
- [Permisos y Autorización](permissions.md)
- [Manejo de Errores](errors.md)
- [Mejores Prácticas](best-practices.md)

## Soporte

Para reportar problemas o solicitar features:

- 📧 Email: dev@percapita.example.com
- 🐛 Issues: GitHub Issues
- 📖 Docs: Esta documentación
