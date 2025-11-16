# Autenticación

La API utiliza autenticación basada en tokens para asegurar los endpoints.

## Flujo de Autenticación

```mermaid
sequenceDiagram
    participant C as Cliente
    participant API as API Backend
    participant DB as Database

    C->>API: POST /api/auth/login/<br/>{username, password}
    API->>DB: Verificar credenciales
    DB->>API: Usuario válido
    API->>API: Generar/recuperar token
    API->>C: {token, usuario}

    Note over C: Guardar token

    C->>API: GET /api/usuarios/<br/>Authorization: Token XXX
    API->>DB: Validar token
    DB->>API: Usuario autenticado
    API->>C: Datos solicitados
```

## Login

### Endpoint

```
POST /api/auth/login/
```

### Request

```json
{
  "username": "admin@example.com",
  "password": "your_password"
}
```

### Response (200 OK)

```json
{
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "usuario": {
    "id": 1,
    "username": "admin@example.com",
    "nombre_completo": "Administrador del Sistema",
    "rol": "ADMIN",
    "rol_display": "Administrador",
    "centros": [
      {
        "id": 1,
        "nombre": "CESFAM Villa Norte",
        "codigo": "12345"
      }
    ],
    "activo": true,
    "fecha_creacion": "2025-01-01T00:00:00Z"
  }
}
```

### Errores

**401 Unauthorized**:
```json
{
  "detail": "Credenciales inválidas"
}
```

**400 Bad Request**:
```json
{
  "username": ["Este campo es requerido"],
  "password": ["Este campo es requerido"]
}
```

### Ejemplo

=== "JavaScript"

    ```javascript
    import axios from 'axios';

    const login = async (username, password) => {
      try {
        const response = await axios.post('/api/auth/login/', {
          username,
          password
        });

        // Guardar token
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.usuario));

        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.detail || 'Error al iniciar sesión');
      }
    };
    ```

=== "Python"

    ```python
    import requests

    def login(username, password):
        response = requests.post(
            'http://localhost:8000/api/auth/login/',
            json={'username': username, 'password': password}
        )

        if response.status_code == 200:
            data = response.json()
            token = data['token']
            return token
        else:
            raise Exception('Login fallido')
    ```

=== "cURL"

    ```bash
    curl -X POST http://localhost:8000/api/auth/login/ \
      -H "Content-Type: application/json" \
      -d '{
        "username": "admin@example.com",
        "password": "your_password"
      }'
    ```

## Uso del Token

Una vez obtenido el token, inclúyelo en todas las solicitudes:

### Header

```http
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

### Ejemplo

=== "JavaScript"

    ```javascript
    // Configurar axios con token
    import axios from 'axios';

    const api = axios.create({
      baseURL: 'http://localhost:8000/api',
    });

    // Interceptor para agregar token
    api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
      return config;
    });

    // Usar
    const usuarios = await api.get('/usuarios/');
    ```

=== "Python"

    ```python
    import requests

    token = "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"

    headers = {
        'Authorization': f'Token {token}'
    }

    response = requests.get(
        'http://localhost:8000/api/usuarios/',
        headers=headers
    )
    ```

=== "cURL"

    ```bash
    curl -X GET http://localhost:8000/api/usuarios/ \
      -H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
    ```

## Obtener Usuario Actual

### Endpoint

```
GET /api/auth/me/
```

### Headers

```http
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

### Response (200 OK)

```json
{
  "id": 1,
  "username": "admin@example.com",
  "nombre_completo": "Administrador del Sistema",
  "rol": "ADMIN",
  "rol_display": "Administrador",
  "centros": [...],
  "activo": true
}
```

### Ejemplo

```javascript
const getCurrentUser = async () => {
  const response = await api.get('/auth/me/');
  return response.data;
};
```

## Logout

### Endpoint

```
POST /api/auth/logout/
```

### Headers

```http
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

### Response (200 OK)

```json
{
  "detail": "Sesión cerrada exitosamente"
}
```

### Ejemplo

=== "JavaScript"

    ```javascript
    const logout = async () => {
      try {
        await api.post('/auth/logout/');

        // Limpiar almacenamiento local
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');

        // Redirigir a login
        window.location.href = '/login';
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    };
    ```

=== "Python"

    ```python
    def logout(token):
        headers = {'Authorization': f'Token {token}'}
        response = requests.post(
            'http://localhost:8000/api/auth/logout/',
            headers=headers
        )
        return response.status_code == 200
    ```

## Cambiar Contraseña

### Endpoint

```
POST /api/usuarios/{id}/cambiar-password/
```

### Headers

```http
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

### Request

```json
{
  "password_actual": "old_password",
  "password_nueva": "new_password",
  "password_confirmacion": "new_password"
}
```

### Response (200 OK)

```json
{
  "detail": "Contraseña actualizada exitosamente"
}
```

### Errores

**400 Bad Request**:
```json
{
  "detail": "La contraseña actual es incorrecta"
}
```

```json
{
  "detail": "Las contraseñas nuevas no coinciden"
}
```

### Ejemplo

```javascript
const cambiarPassword = async (passwordActual, passwordNueva) => {
  const response = await api.post(`/usuarios/${userId}/cambiar-password/`, {
    password_actual: passwordActual,
    password_nueva: passwordNueva,
    password_confirmacion: passwordNueva
  });
  return response.data;
};
```

## Resetear Contraseña (Admin)

Solo administradores pueden resetear contraseñas de otros usuarios.

### Endpoint

```
POST /api/usuarios/{id}/restablecer-password/
```

### Headers

```http
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

### Response (200 OK)

```json
{
  "detail": "Contraseña restablecida",
  "password_temporal": "TempPass123!"
}
```

### Permisos

- Solo `ADMIN` puede usar este endpoint
- Devuelve error 403 si no es admin

### Ejemplo

```javascript
const resetearPassword = async (usuarioId) => {
  const response = await api.post(`/usuarios/${usuarioId}/restablecer-password/`);
  return response.data.password_temporal;
};
```

## Middleware de Autenticación

El sistema usa un middleware personalizado para verificar tokens:

```python
# api/middleware/auth.py
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

## Seguridad

### Almacenamiento del Token

**Frontend**:

- ✓ `localStorage`: Simple, pero vulnerable a XSS
- ✓ `sessionStorage`: Se borra al cerrar tab
- ⚠️ `Cookie httpOnly`: Más seguro, requiere configuración backend

**Recomendación**: En producción, usar cookies httpOnly con SameSite.

### Expiración de Token

Actualmente los tokens no expiran. Para implementar expiración:

```python
# models.py
class Usuario(models.Model):
    token = models.CharField(max_length=255)
    token_created_at = models.DateTimeField(auto_now_add=True)

    def token_is_valid(self):
        from datetime import timedelta
        from django.utils import timezone

        expiry = timedelta(days=7)
        return timezone.now() < self.token_created_at + expiry
```

### Renovación de Token

Para renovar un token próximo a expirar:

```
POST /api/auth/refresh-token/
```

### HTTPS

En producción, **siempre** usar HTTPS para proteger tokens en tránsito:

```python
# settings.py
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
```

## Permisos por Rol

Después de la autenticación, se validan permisos:

| Rol | Puede Crear Usuarios | Puede Ver Logs | Acceso a Todos los Centros |
|-----|---------------------|----------------|----------------------------|
| ADMIN | ✓ | ✓ | ✓ |
| INFORMATICO | ✗ | ✗ | ✗ (solo asignados) |
| ADMINISTRATIVO | ✗ | ✗ | ✗ (solo asignados) |

Ver más en [Documentación de Permisos](permissions.md).

## Manejo de Errores

### Token Inválido

```json
{
  "detail": "Token inválido o expirado"
}
```

**Solución**: Redirigir a login y solicitar credenciales nuevamente.

### Token Faltante

```json
{
  "detail": "No autenticado"
}
```

**Solución**: Incluir header `Authorization`.

### Usuario Inactivo

```json
{
  "detail": "Usuario inactivo"
}
```

**Solución**: Contactar al administrador para reactivar cuenta.

## Ejemplos Completos

### React Hook

```typescript
// hooks/use-auth.ts
import { useState, useEffect } from 'react';
import { api } from '@/services/api';

interface User {
  id: number;
  username: string;
  nombre_completo: string;
  rol: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me/');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await api.post('/auth/login/', { username, password });
    localStorage.setItem('auth_token', response.data.token);
    setUser(response.data.usuario);
    return response.data;
  };

  const logout = async () => {
    await api.post('/auth/logout/');
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return { user, loading, login, logout };
}
```

### Protected Route (Next.js)

```typescript
// components/ProtectedRoute.tsx
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
```

## Testing

### Pytest

```python
import pytest
from rest_framework.test import APIClient

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def authenticated_client(api_client, user):
    api_client.credentials(HTTP_AUTHORIZATION=f'Token {user.token}')
    return api_client

def test_login(api_client):
    response = api_client.post('/api/auth/login/', {
        'username': 'admin@example.com',
        'password': 'password123'
    })
    assert response.status_code == 200
    assert 'token' in response.data

def test_protected_endpoint(authenticated_client):
    response = authenticated_client.get('/api/usuarios/')
    assert response.status_code == 200
```
