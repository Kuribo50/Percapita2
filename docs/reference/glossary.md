# Glosario

Definiciones de términos técnicos y acrónimos usados en el Sistema Per Cápita FONASA.

## A

**Admin / Administrador**
: Usuario del sistema con permisos completos. Puede crear usuarios, ver logs, acceder a todos los centros y configurar el sistema.

**API (Application Programming Interface)**
: Interfaz de programación que permite la comunicación entre el frontend y backend del sistema.

**Auditoría**
: Sistema de registro de todas las acciones realizadas en la plataforma para trazabilidad y seguridad.

## B

**Backend**
: Parte del sistema que se ejecuta en el servidor. Gestiona la lógica de negocio, base de datos y API. Desarrollado en Django.

**Blob**
: Binary Large Object. Formato de datos usado para descargar archivos PDF.

## C

**CESFAM**
: Centro de Salud Familiar. Establecimiento de atención primaria de salud.

**Corte FONASA**
: Archivo mensual enviado por FONASA con la lista de usuarios validados para cada centro de salud.

**CORS (Cross-Origin Resource Sharing)**
: Mecanismo de seguridad que permite solicitudes entre diferentes dominios.

**CRUD**
: Create, Read, Update, Delete. Operaciones básicas sobre datos.

**CSRF (Cross-Site Request Forgery)**
: Tipo de ataque web que el sistema previene mediante tokens.

## D

**Dashboard**
: Panel de control personalizado según el rol del usuario con estadísticas y acciones rápidas.

**Debouncing**
: Técnica para optimizar búsquedas esperando que el usuario termine de escribir.

**Django**
: Framework web de Python usado en el backend.

**DRF (Django REST Framework)**
: Biblioteca de Django para construir APIs REST.

## E

**Endpoint**
: URL específica de la API que realiza una operación (ej: `/api/usuarios/`).

**Establecimiento**
: Centro de salud (CESFAM, hospital, consultorio, etc.) registrado en el sistema.

**Etnia**
: Pueblo originario al que pertenece un usuario (Mapuche, Aymara, etc.).

## F

**FONASA (Fondo Nacional de Salud)**
: Organismo público que administra el sistema de seguro de salud en Chile.

**Frontend**
: Parte del sistema que se ejecuta en el navegador. Interfaz de usuario. Desarrollado en Next.js y React.

## G

**Gunicorn**
: Servidor WSGI de Python usado en producción para servir Django.

## H

**HP Trakcare**
: Sistema de gestión hospitalaria. Los datos se importan al sistema para validación.

**HTTP (Hypertext Transfer Protocol)**
: Protocolo de comunicación entre cliente y servidor.

**HTTPS**
: Versión segura de HTTP con encriptación SSL/TLS.

## I

**Informático**
: Rol de usuario enfocado en gestión de datos. Carga cortes y ejecuta validaciones.

**IP Address**
: Dirección única que identifica un dispositivo en la red. Se registra en logs.

## J

**JSON (JavaScript Object Notation)**
: Formato de datos usado para comunicación API y almacenamiento de cambios.

**JSONField**
: Tipo de campo en PostgreSQL que almacena datos JSON.

**JWT (JSON Web Token)**
: Estándar de tokens de autenticación (no usado actualmente, se usa Token simple).

## L

**Log / Log de Actividad**
: Registro de una acción realizada en el sistema con timestamp, usuario, IP, etc.

**Logout**
: Cerrar sesión en el sistema.

## M

**Middleware**
: Capa intermedia de software que procesa requests antes de llegar a las vistas.

**Migración (Migration)**
: Archivo que define cambios en la estructura de la base de datos.

## N

**Next.js**
: Framework de React usado en el frontend con Server-Side Rendering.

**Nginx**
: Servidor web usado como reverse proxy en producción.

**Notificación**
: Mensaje del sistema para informar al usuario sobre eventos importantes.

**Nuevo Usuario**
: Persona inscrita en el sistema per cápita que requiere validación.

## O

**ORM (Object-Relational Mapping)**
: Técnica para interactuar con la base de datos usando objetos en lugar de SQL directo.

**Observación**
: Comentario agregado a un usuario NO_VALIDADO explicando la discrepancia.

## P

**Paginación**
: División de listados largos en páginas de N elementos.

**Per Cápita**
: Sistema de financiamiento donde FONASA paga por cada usuario inscrito en un centro.

**PostgreSQL**
: Sistema de base de datos relacional usado por el sistema.

**PDF (Portable Document Format)**
: Formato de archivo usado para reportes. Generado con ReportLab.

## R

**React**
: Biblioteca de JavaScript para construir interfaces de usuario.

**ReportLab**
: Biblioteca de Python para generar archivos PDF.

**REST (Representational State Transfer)**
: Arquitectura para APIs web. Usa métodos HTTP (GET, POST, PUT, DELETE).

**ROL**
: Nivel de permisos asignado a un usuario del sistema (ADMIN, INFORMATICO, ADMINISTRATIVO).

**RUN (Rol Único Nacional)**
: Identificador único de personas en Chile (equivalente al RUT).

## S

**Serializer**
: Componente de DRF que convierte modelos Django a JSON y viceversa.

**SSR (Server-Side Rendering)**
: Renderizado de React en el servidor antes de enviar al cliente.

**shadcn/ui**
: Colección de componentes UI accesibles usados en el frontend.

## T

**Tailwind CSS**
: Framework de CSS utility-first usado para estilos.

**Token**
: Cadena de caracteres usada para autenticación en cada request.

**TypeScript**
: Superset de JavaScript con tipado estático usado en el frontend.

## U

**User Agent**
: String que identifica el navegador y sistema operativo del usuario.

**Usuario del Sistema**
: Persona que opera la aplicación (admin, informático, administrativo).

**Usuario No Validado**
: Nuevo usuario con discrepancias que requiere revisión manual.

## V

**Validación**
: Proceso de verificar que datos de un usuario coincidan entre fuentes.

**Variable de Entorno**
: Configuración externa al código (ej: DB_NAME, SECRET_KEY).

**Vista (View)**
: Función de Django que procesa un request y devuelve un response.

## W

**Widget**
: Componente reutilizable del dashboard (Acciones Rápidas, Actividad Reciente, etc.).

**WSGI (Web Server Gateway Interface)**
: Estándar de Python para comunicación entre servidor web y aplicación.

## X

**XSS (Cross-Site Scripting)**
: Tipo de ataque web que el sistema previene mediante escape de HTML.

## Acrónimos Comunes

| Acrónimo | Significado |
|----------|-------------|
| API | Application Programming Interface |
| CESFAM | Centro de Salud Familiar |
| CORS | Cross-Origin Resource Sharing |
| CRUD | Create, Read, Update, Delete |
| CSRF | Cross-Site Request Forgery |
| DB | Database (Base de Datos) |
| DRF | Django REST Framework |
| FONASA | Fondo Nacional de Salud |
| HTML | HyperText Markup Language |
| HTTP(S) | HyperText Transfer Protocol (Secure) |
| IP | Internet Protocol |
| JSON | JavaScript Object Notation |
| JWT | JSON Web Token |
| ORM | Object-Relational Mapping |
| PDF | Portable Document Format |
| REST | Representational State Transfer |
| RUN | Rol Único Nacional |
| SQL | Structured Query Language |
| SSR | Server-Side Rendering |
| UI | User Interface |
| URL | Uniform Resource Locator |
| UX | User Experience |
| WSGI | Web Server Gateway Interface |
| XSS | Cross-Site Scripting |

## Estados de Validación

| Estado | Descripción |
|--------|-------------|
| VALIDADO | Usuario existe en ambas fuentes con datos coincidentes |
| NO_VALIDADO | Discrepancias encontradas entre fuentes |
| PENDIENTE | En proceso de revisión manual |
| FALLECIDO | Usuario registrado como fallecido |

## Roles del Sistema

| Rol | Descripción |
|-----|-------------|
| ADMIN | Administrador con acceso completo |
| INFORMATICO | Gestión de datos y cortes |
| ADMINISTRATIVO | Revisión y validación de usuarios |

## Tipos de Acciones (Logs)

| Acción | Descripción |
|--------|-------------|
| LOGIN | Inicio de sesión |
| LOGOUT | Cierre de sesión |
| CREAR | Creación de registro |
| EDITAR | Modificación de registro |
| ELIMINAR | Eliminación de registro |
| SUBIR_ARCHIVO | Carga de archivo Excel |
| VALIDAR | Ejecución de validación |
| GENERAR_REPORTE | Generación de PDF |
| CAMBIO_PASSWORD | Cambio de contraseña |
| ASIGNAR_CENTRO | Asignación de centros a usuario |
| BUSQUEDA | Búsqueda en el sistema |

## Módulos del Sistema

| Módulo | Descripción |
|--------|-------------|
| USUARIOS | Gestión de usuarios del sistema |
| CORTES | Cortes FONASA |
| NUEVOS_USUARIOS | Nuevos usuarios inscritos |
| HP_TRAKCARE | Datos de HP Trakcare |
| VALIDACIONES | Proceso de validación |
| CATALOGOS | Catálogos maestros |
| REPORTES | Generación de reportes |

## Tipos de Notificaciones

| Tipo | Descripción | Color |
|------|-------------|-------|
| INFO | Información general | Azul |
| SUCCESS | Acción exitosa | Verde |
| WARNING | Advertencia | Amarillo |
| ERROR | Error crítico | Rojo |

---

¿No encuentras un término? [Contacta soporte](mailto:soporte@percapita.example.com) para agregarlo.
