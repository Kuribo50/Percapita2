# Documentación del Sistema Per Cápita FONASA

Esta carpeta contiene la documentación completa del sistema generada con MkDocs Material.

## Instalación

Para trabajar con la documentación localmente:

```bash
# Instalar dependencias
pip install -r docs-requirements.txt
```

## Desarrollo

Para ver la documentación en modo desarrollo con auto-reload:

```bash
# Desde la raíz del proyecto
mkdocs serve

# La documentación estará disponible en:
# http://localhost:8000
```

## Build

Para generar los archivos HTML estáticos:

```bash
mkdocs build

# Los archivos se generarán en: site/
```

## Deployment

### GitHub Pages

```bash
# Deploy automático a gh-pages branch
mkdocs gh-deploy
```

### Manual

```bash
# 1. Build
mkdocs build

# 2. Copiar contenido de site/ al servidor web
scp -r site/* user@server:/var/www/docs/
```

## Estructura

```
docs/
├── index.md                    # Homepage
├── features.md                 # Características detalladas
├── architecture.md             # Arquitectura técnica
│
├── getting-started/           # Guías de inicio
│   ├── installation.md
│   ├── configuration.md
│   └── first-steps.md
│
├── user-guide/                # Guías de usuario
│   ├── index.md
│   ├── admin.md
│   ├── informatico.md
│   └── administrativo.md
│
├── api/                       # Documentación de API
│   ├── index.md
│   ├── authentication.md
│   ├── models.md
│   ├── permissions.md
│   └── endpoints/            # Documentación de endpoints
│       ├── usuarios.md
│       ├── cortes.md
│       ├── hp-trakcare.md
│       ├── nuevos-usuarios.md
│       ├── validaciones.md
│       ├── catalogos.md
│       ├── auditoria.md
│       ├── notificaciones.md
│       ├── busqueda.md
│       └── reportes.md
│
├── developer/                 # Guías para desarrolladores
│   ├── setup.md
│   ├── structure.md
│   ├── contributing.md
│   ├── testing.md
│   └── best-practices.md
│
├── deployment/                # Guías de deployment
│   ├── production.md
│   ├── docker.md
│   ├── environment.md
│   └── security.md
│
├── reference/                 # Material de referencia
│   ├── glossary.md
│   ├── faq.md
│   ├── troubleshooting.md
│   └── changelog.md
│
├── stylesheets/              # CSS personalizado
│   └── extra.css
│
└── javascripts/              # JS personalizado
    └── mathjax.js
```

## Características de MkDocs Material

La documentación incluye:

- ✅ Tema moderno y responsive
- ✅ Búsqueda instantánea
- ✅ Modo oscuro/claro
- ✅ Navegación con tabs
- ✅ Tabla de contenidos integrada
- ✅ Syntax highlighting
- ✅ Diagramas Mermaid
- ✅ Admonitions (notes, warnings, etc.)
- ✅ Keyboard shortcuts
- ✅ Code copy button
- ✅ Feedback widgets

## Personalización

### Colores

Los colores corporativos están definidos en `docs/stylesheets/extra.css`:

```css
:root {
  --percapita-primary: #1e40af;
  --percapita-secondary: #3b82f6;
  --percapita-accent: #60a5fa;
}
```

### Logo

Para agregar un logo, coloca la imagen en `docs/images/logo.png` y actualiza `mkdocs.yml`:

```yaml
theme:
  logo: images/logo.png
  favicon: images/favicon.ico
```

## Contribuir a la Documentación

### Agregar Nueva Página

1. Crea el archivo `.md` en la carpeta apropiada
2. Agrega la entrada en `mkdocs.yml` bajo `nav:`
3. Usa la plantilla estándar:

```markdown
# Título de la Página

Descripción breve.

## Sección 1

Contenido...

## Sección 2

Contenido...
```

### Usar Admonitions

```markdown
!!! note "Nota"
    Este es un cuadro de nota.

!!! warning "Advertencia"
    Ten cuidado con esto.

!!! tip "Consejo"
    Aquí hay un consejo útil.
```

### Incluir Código

```markdown
​```python
def hello_world():
    print("Hello, World!")
​```

​```javascript
console.log("Hello, World!");
​```
```

### Crear Diagramas

```markdown
​```mermaid
graph LR
    A[Inicio] --> B[Proceso]
    B --> C[Fin]
​```
```

### Tablas

```markdown
| Columna 1 | Columna 2 |
|-----------|-----------|
| Dato 1    | Dato 2    |
| Dato 3    | Dato 4    |
```

## Comandos Útiles

```bash
# Iniciar servidor de desarrollo
mkdocs serve

# Iniciar en puerto específico
mkdocs serve -a localhost:8080

# Build
mkdocs build

# Build limpio (borra site/ primero)
mkdocs build --clean

# Deploy a GitHub Pages
mkdocs gh-deploy

# Ver versión
mkdocs --version
```

## Recursos

- [MkDocs](https://www.mkdocs.org/)
- [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)
- [Markdown Guide](https://www.markdownguide.org/)
- [Mermaid Diagrams](https://mermaid.js.org/)

## Licencia

Esta documentación es parte del Sistema Per Cápita FONASA.
Todos los derechos reservados.
