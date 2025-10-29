# Percapita2

Sistema de gestión de usuarios con aplicación full-stack desarrollada con Next.js y Django REST Framework.

## Tecnologías

### Frontend
- **Next.js** (latest stable) con TypeScript
- **Tailwind CSS** para estilos
- **React Context** para manejo de estado

### Backend
- **Django REST Framework** (latest stable)
- **Python 3.x**
- **SQLite** (desarrollo)

## Estructura del Proyecto

```
Percapita2/
├── frontend/          # Aplicación Next.js
│   ├── app/          # Páginas y rutas
│   ├── components/   # Componentes reutilizables
│   ├── contexts/     # Context providers
│   ├── lib/          # Utilidades
│   └── types/        # Definiciones TypeScript
├── backend/          # API Django REST Framework
│   ├── api/          # Aplicación principal
│   ├── config/       # Configuración Django
│   └── manage.py
└── .github/          # Configuración del proyecto
```

## Requisitos Previos

- Node.js (v18 o superior)
- Python 3.x
- npm o yarn

## Instalación

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # En Windows
# source venv/bin/activate  # En Linux/Mac
pip install -r requirements.txt
python manage.py migrate
python manage.py poblar_catalogos
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Variables de Entorno

### Frontend
Crear archivo `.env.local` en la carpeta `frontend`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend
Crear archivo `.env` en la carpeta `backend` (si es necesario):
```
DEBUG=True
SECRET_KEY=tu-secret-key
```

## Uso

1. Inicia el servidor backend: `python manage.py runserver` (puerto 8000)
2. Inicia el servidor frontend: `npm run dev` (puerto 3000)
3. Accede a la aplicación en `http://localhost:3000`

## Funcionalidades

- Gestión de usuarios
- Dashboard con múltiples módulos
- Sistema de autenticación
- Manejo de cortes FONASA
- Certificados (inscripción, residencia, renuncia)
- Gestión de traslados
- Sistema de validación de usuarios

## Desarrollo

- El frontend se conecta al backend mediante API REST
- CORS está configurado para desarrollo local
- Autenticación mediante tokens

## Licencia

[Especificar licencia]

## Contacto

[Información de contacto]
