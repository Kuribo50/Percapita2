# Preguntas Frecuentes (FAQ)

Respuestas a las preguntas más comunes sobre el Sistema Per Cápita FONASA.

## General

### ¿Qué es el Sistema Per Cápita FONASA?

Es una plataforma web para gestionar y validar usuarios inscritos en el sistema de financiamiento per cápita de FONASA. Permite cargar cortes mensuales, validar usuarios y generar reportes.

### ¿Quién puede usar el sistema?

Personal autorizado de centros de salud adscritos al sistema per cápita:
- Administradores del sistema
- Personal de informática
- Personal administrativo

### ¿Necesito instalar algo en mi computador?

No. El sistema funciona completamente en el navegador web. Solo necesitas:
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet
- Credenciales de acceso

### ¿Funciona en celular o tablet?

Sí. El sistema es responsive y se adapta a:
- Computadores de escritorio
- Tablets
- Smartphones

Algunas funciones complejas son más fáciles en pantallas grandes.

## Acceso y Seguridad

### ¿Cómo obtengo acceso al sistema?

Contacta al administrador de tu centro de salud para que:
1. Cree tu usuario
2. Te asigne el rol apropiado
3. Te asigne los centros de salud
4. Te proporcione las credenciales iniciales

### Olvidé mi contraseña, ¿qué hago?

Contacta al administrador para que restablezca tu contraseña. Recibirás una contraseña temporal que deberás cambiar al primer login.

### ¿Cada cuánto debo cambiar mi contraseña?

Recomendamos cambiarla cada 3 meses por seguridad.

### ¿Puedo compartir mi usuario con compañeros?

**No**. Cada persona debe tener su propio usuario. El sistema registra todas las acciones con tu usuario para auditoría.

### ¿Qué hago si detecto actividad sospechosa?

1. Cambia tu contraseña inmediatamente
2. Reporta al administrador
3. Revisa tus logs de actividad

## Roles y Permisos

### ¿Cuál es la diferencia entre los roles?

**ADMIN (Administrador)**:
- Acceso total al sistema
- Gestiona usuarios del sistema
- Ve logs de auditoría
- Accede a todos los centros

**INFORMATICO (Informático)**:
- Carga cortes FONASA y HP Trakcare
- Ejecuta validaciones
- Accede solo a centros asignados

**ADMINISTRATIVO (Administrativo)**:
- Revisa nuevos usuarios
- Valida usuarios manualmente
- Agrega observaciones
- Accede solo a centros asignados

### ¿Puedo tener más de un rol?

No. Cada usuario tiene un solo rol. Si necesitas permisos diferentes, solicita cambio de rol al administrador.

### ¿Cómo sé qué centros tengo asignados?

En tu perfil (click en tu nombre en navbar) o en el dashboard verás tus centros asignados.

### No veo un centro que necesito, ¿qué hago?

Solicita al administrador que te asigne ese centro.

## Cortes FONASA

### ¿Cada cuánto se cargan los cortes?

Mensualmente, cuando FONASA los envía (típicamente los primeros días del mes siguiente).

### ¿Qué formato debe tener el archivo Excel?

Debe incluir columnas:
- RUN (sin puntos ni guión)
- Nombre
- Apellido Paterno
- Apellido Materno
- Fecha Nacimiento
- Centro Salud

Ver [guía de formato completa](../getting-started/first-steps.md#cargar-primer-corte-fonasa).

### ¿Qué hago si hay errores al cargar el corte?

1. Lee el mensaje de error
2. Corrige el archivo Excel
3. Vuelve a intentar
4. Si persiste, contacta soporte

### ¿Puedo editar un corte después de cargarlo?

No directamente. Si hay errores, carga el corte corregido nuevamente. El sistema reemplazará los datos.

### ¿Los duplicados de RUN se cuentan?

**Sí**. El sistema cuenta correctamente todos los registros, incluyendo duplicados de RUN, ya que FONASA paga por cada inscripción.

## Validación

### ¿Qué significa cada estado de validación?

- **VALIDADO**: Usuario existe en corte FONASA y HP Trakcare con datos coincidentes
- **NO_VALIDADO**: Discrepancias entre fuentes o falta en una de ellas
- **PENDIENTE**: En proceso de revisión manual
- **FALLECIDO**: Usuario registrado como fallecido

### ¿Por qué un usuario está NO_VALIDADO?

Puede ser por:
- No aparece en HP Trakcare
- Datos diferentes entre corte y HP (nombre, fecha nacimiento, etc.)
- Error de digitación
- Usuario no ha visitado el centro aún

### ¿Cómo cambio un usuario de NO_VALIDADO a VALIDADO?

1. Revisa los datos en detalle
2. Verifica la causa de la discrepancia
3. Si es un error, corrígelo
4. Si los datos son correctos, cámbialo manualmente
5. **Siempre agrega una observación** explicando el cambio

### ¿Puedo validar varios usuarios a la vez?

Sí, usa la función "Validar en Lote":
1. Selecciona usuarios (checkboxes)
2. Click "Validar Seleccionados"
3. Confirma

Úsala solo cuando estés seguro de que todos cumplen criterios.

## HP Trakcare

### ¿Qué es HP Trakcare?

Sistema de gestión hospitalaria que registra atenciones, diagnósticos y datos médicos.

### ¿Cada cuánto actualizo HP Trakcare en el sistema?

Idealmente, cada mes junto con el corte FONASA, o cuando haya cambios significativos.

### ¿El sistema se sincroniza automáticamente con HP?

No. Debes exportar desde HP Trakcare e importar al sistema manualmente.

## Búsqueda

### La búsqueda no encuentra nada

Verifica:
- Escribiste al menos 2 caracteres
- El término de búsqueda es correcto
- Tienes permisos para ver esos datos
- Los datos existen en el sistema

### ¿Qué puedo buscar?

- Usuarios del sistema (solo admin)
- Nuevos usuarios (por RUN o nombre)
- Cortes FONASA (por mes/año)
- HP Trakcare (por RUN)
- Establecimientos (por nombre o código)
- Logs (solo admin)

### ¿Puedo usar búsqueda avanzada?

Actualmente no. La búsqueda es por texto simple. Para filtros complejos, usa los listados con filtros.

## Reportes

### ¿Qué tipos de reportes puedo generar?

1. **Estadísticas**: Resumen general del sistema
2. **Usuarios**: Listado detallado con filtros
3. **Logs**: Auditoría de acciones (solo admin)

### ¿Los reportes se actualizan en tiempo real?

No. Los reportes muestran datos al momento de generación. Genera uno nuevo para datos actualizados.

### ¿Puedo programar reportes automáticos?

Actualmente no. Debes generarlos manualmente cuando los necesites.

### ¿En qué formato se generan?

PDF profesional con:
- Encabezados corporativos
- Tablas formateadas
- Fecha de generación

### ¿Hay límite de registros en reportes?

Sí:
- Usuarios: Máximo 500
- Logs: Máximo 200

Si necesitas más, genera múltiples reportes con filtros diferentes.

## Notificaciones

### ¿Cómo recibo notificaciones?

Aparecen en el ícono de campana (navbar superior derecha) con un número indicando cuántas no leídas tienes.

### ¿Las notificaciones son en tiempo real?

Casi. Se actualizan automáticamente cada 30 segundos.

### ¿Puedo desactivar notificaciones?

No directamente, pero puedes marcarlas todas como leídas para limpiar la lista.

### No veo notificaciones

Verifica:
- Tu conexión a internet
- Que no haya errores en la consola del navegador
- Que el backend esté funcionando

## Datos y Archivos

### ¿Qué pasa con los archivos que cargo?

Se procesan y los datos se guardan en la base de datos. Los archivos originales se pueden descargar nuevamente desde el historial.

### ¿Puedo exportar datos del sistema?

Sí:
- Reportes en PDF
- Exportación de nuevos usuarios a Excel
- (Más formatos en desarrollo)

### ¿Los datos están seguros?

Sí. El sistema implementa:
- Autenticación robusta
- Permisos por rol
- Auditoría completa
- Backups regulares (responsabilidad del admin)

### ¿Cuánto tiempo se guardan los datos?

Indefinidamente, a menos que se eliminen explícitamente. Los logs se pueden archivar periódicamente.

## Problemas Técnicos

### El sistema está lento

Puede ser por:
- Mala conexión a internet
- Servidor sobrecargado
- Navegador con muchas pestañas abiertas

Soluciones:
- Recarga la página
- Cierra pestañas innecesarias
- Verifica tu conexión
- Contacta soporte si persiste

### Veo un error 500

Error del servidor. Contacta al administrador inmediatamente. Incluye:
- Qué estabas haciendo
- Captura de pantalla del error
- Hora exacta

### No puedo subir archivos

Verifica:
- El archivo no sea muy grande (máx 20MB)
- El formato sea correcto (.xlsx)
- Tu conexión esté estable

### Los cambios no se guardan

1. Verifica que completaste todos los campos requeridos
2. Lee mensajes de error
3. Intenta nuevamente
4. Si persiste, contacta soporte

## Capacitación y Soporte

### ¿Hay manuales de usuario?

Sí, esta documentación cubre todo:
- [Guía de Usuario](../user-guide/index.md)
- [Primeros Pasos](../getting-started/first-steps.md)
- [Solución de Problemas](troubleshooting.md)

### ¿Puedo solicitar capacitación?

Sí. Contacta al administrador para programar sesiones de:
- Inducción inicial
- Funciones avanzadas
- Resolución de dudas

### ¿Cómo reporto un bug?

1. Email a soporte con:
   - Descripción detallada
   - Pasos para reproducir
   - Capturas de pantalla
   - Navegador y sistema operativo

### ¿Puedo solicitar nuevas funcionalidades?

Sí. Envía tu solicitud a:
- 📧 dev@percapita.example.com

Incluye:
- Descripción de la función
- Caso de uso
- Beneficios esperados

## Desarrollo y API

### ¿Hay una API disponible?

Sí. Ver [Documentación de API](../api/index.md).

### ¿Puedo integrar otros sistemas?

Sí, mediante la API REST. Contacta al equipo de desarrollo para coordinar.

### ¿El código es open source?

No. El sistema es privado y de uso exclusivo para centros de salud autorizados.

## Otros

### ¿El sistema funciona offline?

No. Requiere conexión a internet constante.

### ¿Puedo usar el sistema desde casa?

Depende de la configuración de tu centro. Algunos permiten VPN, otros solo desde la red interna. Consulta con tu administrador de TI.

### ¿Hay versión móvil (app)?

No hay app nativa. Usa el navegador web en tu dispositivo móvil.

### ¿Se planean nuevas funciones?

Sí. El sistema está en desarrollo continuo. Ver [Changelog](changelog.md) para novedades.

---

## ¿No encuentras tu pregunta?

Contacta soporte:

- 📧 Email: soporte@percapita.example.com
- 📞 Teléfono: +56 2 XXXX XXXX
- 📚 Documentación: Esta misma documentación
- 🔧 [Solución de Problemas](troubleshooting.md)
