# Solución de Problemas

Guía para resolver problemas comunes en el Sistema Per Cápita FONASA.

## Problemas de Acceso

### No puedo iniciar sesión

**Síntoma**: Error "Credenciales inválidas" al intentar login.

**Causas posibles**:

1. Email o contraseña incorrectos
2. Cuenta inactiva
3. Problemas de conectividad

**Soluciones**:

```markdown
1. ✓ Verifica que el email sea correcto (sin espacios extra)
2. ✓ Asegúrate de que Caps Lock esté desactivado
3. ✓ Intenta copiar/pegar la contraseña desde un lugar seguro
4. ✓ Si olvidaste la contraseña, contacta al administrador
5. ✓ Verifica tu conexión a internet
```

**Ejemplo**:
```
✗ Incorrecto: "admin@example.com " (espacio al final)
✓ Correcto: "admin@example.com"
```

---

### La sesión expira muy rápido

**Síntoma**: El sistema te desconecta frecuentemente.

**Soluciones**:

- Verifica que el navegador permita cookies
- Desactiva modo incógnito/privado
- Limpia caché y cookies del sitio
- Actualiza el navegador

**Comandos útiles** (DevTools - F12):
```javascript
// Ver si hay token guardado
console.log(localStorage.getItem('auth_token'));

// Ver cookies
document.cookie
```

---

## Problemas con Archivos

### Error al subir archivo Excel

**Síntoma**: "Error procesando archivo" o archivo no se carga.

**Verificaciones**:

| Aspecto | Requisito |
|---------|-----------|
| Formato | `.xlsx` (Excel 2007+) |
| Tamaño | Máximo 20 MB |
| Columnas | Todas las requeridas presentes |
| Datos | Sin celdas vacías en campos requeridos |
| Codificación | UTF-8 |

**Solución paso a paso**:

1. **Verificar formato**:
   ```
   ✓ archivo.xlsx
   ✗ archivo.xls (formato antiguo)
   ✗ archivo.csv
   ```

2. **Verificar columnas** (para Cortes FONASA):
   ```
   - RUN
   - Nombre
   - Apellido Paterno
   - Apellido Materno
   - Fecha Nacimiento
   - Centro Salud
   ```

3. **Verificar datos**:
   ```
   ✗ RUN con puntos: 12.345.678-9
   ✓ RUN sin formato: 12345678

   ✗ Fecha incorrecta: 32/13/2025
   ✓ Fecha correcta: 15/01/2025
   ```

4. **Reducir tamaño**:
   - Eliminar columnas innecesarias
   - Comprimir imágenes si las hay
   - Dividir en múltiples archivos

**Consejo**: Abre el archivo en Excel y usa "Guardar como" → Xlsx para asegurar formato correcto.

---

### El archivo se carga pero hay muchos errores

**Síntoma**: El sistema procesa el archivo pero reporta errores en múltiples filas.

**Causas comunes**:

1. **RUTs inválidos**
   ```
   ✗ 00000000
   ✗ 12345678-K (con guión)
   ✓ 12345678
   ```

2. **Fechas mal formateadas**
   ```
   ✗ 2025-01-15 (ISO)
   ✗ January 15, 2025
   ✓ 15/01/2025 (DD/MM/YYYY)
   ```

3. **Centro de salud no existe**
   - Verifica que el código del centro esté registrado
   - Carga catálogo de establecimientos primero

**Solución**:

1. Descarga archivo de ejemplo del sistema
2. Copia tus datos al formato correcto
3. Valida en Excel antes de subir
4. Carga en modo de prueba primero (si disponible)

---

## Problemas de Búsqueda

### La búsqueda global no encuentra resultados

**Síntoma**: Búsqueda devuelve "Sin resultados" aunque sabes que existen.

**Verificaciones**:

1. **Longitud mínima**: Debes escribir al menos 2 caracteres

2. **Permisos**: Solo encuentras datos de centros asignados (excepto admin)

3. **Ortografía**: Verifica que esté correctamente escrito

4. **Espacios**: Evita espacios al inicio/final

**Ejemplos**:

```
✗ "j" → Muy corto (< 2 caracteres)
✓ "ju" → OK

✗ " juan " → Espacios extra
✓ "juan" → Correcto

✗ "Joan" → Ortografía incorrecta
✓ "Juan" → Correcto
```

**Consejo**: Si buscas por RUN, usa solo números sin guión ni puntos.

---

## Problemas con Validaciones

### Todos los usuarios aparecen como NO_VALIDADOS

**Síntoma**: Después de validar, todos quedan NO_VALIDADOS.

**Causas posibles**:

1. **Formato de datos diferente**
   - Nombres con/sin tildes
   - Mayúsculas vs minúsculas
   - Espacios dobles

2. **Corte y HP de períodos diferentes**

3. **Datos faltantes en HP Trakcare**

**Solución**:

1. **Normalizar datos**:
   ```python
   # El sistema debería hacer esto automáticamente
   # Si no, reporta al administrador
   nombre = nombre.upper().strip()
   run = run.replace('.', '').replace('-', '')
   ```

2. **Verificar fechas**:
   - Corte: Enero 2025
   - HP: Enero 2025
   - ✗ No comparar Enero vs Diciembre

3. **Revisar casos manualmente**:
   - Selecciona algunos usuarios
   - Compara datos detalladamente
   - Busca patrones en los errores

---

### No puedo cambiar el estado de un usuario

**Síntoma**: Al intentar cambiar estado, aparece error o no se guarda.

**Verificaciones**:

- [ ] Tienes permisos (no todos los roles pueden cambiar estados)
- [ ] Agregaste una observación (puede ser requerida)
- [ ] Los datos obligatorios están completos
- [ ] No hay problemas de conectividad

**Solución**:

1. Refresca la página (F5)
2. Vuelve a intentar
3. Verifica consola del navegador (F12) por errores
4. Si persiste, contacta soporte

---

## Problemas de Rendimiento

### El sistema está muy lento

**Síntoma**: Las páginas tardan mucho en cargar o las acciones son lentas.

**Diagnóstico**:

1. **Verifica tu conexión**:
   ```bash
   # Windows
   ping percapita.example.com

   # Ver velocidad
   speedtest-cli
   ```

2. **Verifica uso de recursos**:
   - Abre Task Manager (Ctrl+Shift+Esc en Windows)
   - Revisa uso de CPU y memoria
   - Cierra programas innecesarios

3. **Verifica el navegador**:
   - ¿Cuántas pestañas tienes abiertas?
   - ¿Cuántas extensiones activas?
   - ¿Cuándo fue la última vez que lo reiniciaste?

**Soluciones**:

```markdown
1. ✓ Cierra pestañas innecesarias
2. ✓ Desactiva extensiones no esenciales
3. ✓ Limpia caché del navegador:
   - Chrome: Ctrl+Shift+Del
   - Firefox: Ctrl+Shift+Del
   - Edge: Ctrl+Shift+Del
4. ✓ Reinicia el navegador
5. ✓ Reinicia el computador
6. ✓ Prueba en otro navegador
```

**Navegadores recomendados** (en orden):
1. Google Chrome (versión reciente)
2. Mozilla Firefox (versión reciente)
3. Microsoft Edge (versión reciente)
4. Safari (solo Mac)

---

### La carga de archivos es muy lenta

**Síntoma**: Subir un corte FONASA tarda muchos minutos.

**Causas**:

- Archivo muy grande (> 10MB)
- Conexión lenta
- Servidor ocupado

**Soluciones**:

1. **Optimiza el archivo**:
   - Elimina columnas innecesarias
   - Elimina hojas extras del Excel
   - Guarda solo como `.xlsx` sin macros

2. **Mejora conexión**:
   - Usa conexión por cable (no WiFi)
   - Evita horas peak (8-10 AM)
   - Cierra descargas/streams

3. **Divide el archivo**:
   - Si tiene > 10,000 filas, divídelo
   - Carga en partes
   - Ejemplo: Enero parte 1, Enero parte 2

---

## Problemas con Reportes

### El PDF no se descarga

**Síntoma**: Click en "Descargar PDF" pero no pasa nada.

**Verificaciones**:

1. **Bloqueador de pop-ups**:
   - Revisa si el navegador bloqueó la descarga
   - Mira la barra de direcciones (ícono de bloqueador)
   - Permite pop-ups para este sitio

2. **Carpeta de descargas**:
   - Verifica que tengas permisos de escritura
   - Revisa que no esté llena el disco
   - Cambia carpeta de descargas

3. **Navegador**:
   - Actualiza a última versión
   - Prueba en otro navegador

**Consejo**: Algunos navegadores preguntan dónde guardar. Revisa si hay un diálogo minimizado.

---

### El PDF está vacío o incompleto

**Síntoma**: El PDF se descarga pero no tiene datos o falta información.

**Causas**:

- No hay datos que cumplan los filtros
- Error en la generación (backend)
- Límite de registros excedido

**Solución**:

1. **Revisa filtros**:
   - Elimina algunos filtros
   - Amplía el rango de fechas
   - Selecciona "Todos" en desplegables

2. **Verifica que haya datos**:
   - Ve a la lista normal (no PDF)
   - Confirma que existen registros

3. **Reporta error**:
   - Si debería haber datos pero el PDF está vacío
   - Contacta soporte con:
     - Filtros usados
     - Tipo de reporte
     - Captura de pantalla

---

## Problemas de Notificaciones

### No recibo notificaciones

**Síntoma**: El contador de notificaciones siempre muestra 0.

**Verificaciones**:

- Backend funcionando (¿otras funciones funcionan?)
- No hay errores en consola del navegador
- El auto-refresh está activo (30s)

**Solución**:

1. Refresca la página (F5)
2. Cierra sesión y vuelve a entrar
3. Verifica en DevTools (F12):
   ```javascript
   // Ver si hay errores en consola
   // Debería ver requests a /api/notificaciones/count/ cada 30s
   ```

4. Si persiste, reporta al administrador

---

## Problemas de Base de Datos

### "Error de conexión a base de datos"

**Síntoma**: Mensaje de error al intentar cualquier operación.

**Causa**: El backend no puede conectarse a PostgreSQL.

**Solución** (solo para administradores):

1. **Verifica que PostgreSQL esté corriendo**:
   ```bash
   # Linux
   sudo systemctl status postgresql

   # Windows
   # Services → PostgreSQL
   ```

2. **Verifica credenciales** (`.env`):
   ```bash
   DB_NAME=percapita_db
   DB_USER=percapita_user
   DB_PASSWORD=correct_password
   DB_HOST=localhost
   DB_PORT=5432
   ```

3. **Prueba conexión**:
   ```bash
   psql -U percapita_user -d percapita_db -h localhost
   ```

4. **Revisa logs**:
   ```bash
   # Django logs
   tail -f /var/log/percapita/django.log

   # PostgreSQL logs
   tail -f /var/log/postgresql/postgresql-14-main.log
   ```

---

## Problemas de Desarrollo

### "Module not found" en frontend

**Síntoma**: Error al iniciar Next.js.

**Solución**:

```bash
# Eliminar node_modules
rm -rf node_modules package-lock.json

# Reinstalar
npm install

# O con cache limpio
npm cache clean --force
npm install
```

---

### Migraciones de Django no se aplican

**Síntoma**: Error al ejecutar `python manage.py migrate`.

**Solución**:

```bash
# 1. Verifica que la base de datos esté corriendo
psql -U percapita_user -d percapita_db

# 2. Elimina archivos .pyc
find . -name "*.pyc" -delete

# 3. Crea migraciones
python manage.py makemigrations

# 4. Aplica migraciones
python manage.py migrate

# 5. Si falla, revisa SQL
python manage.py sqlmigrate api 0001

# 6. Si es necesario, aplica manualmente
python manage.py migrate --fake-initial
```

---

## Logs y Debugging

### Cómo ver logs del sistema

**Frontend (Navegador)**:

1. Abre DevTools: `F12` o `Ctrl+Shift+I`
2. Pestaña "Console"
3. Busca errores en rojo

**Backend (Servidor)**:

```bash
# Logs de Django
tail -f /var/log/percapita/django.log

# Logs de Gunicorn
tail -f /var/log/percapita/gunicorn_error.log

# Logs de Nginx
tail -f /var/log/nginx/percapita_error.log
```

**PostgreSQL**:

```bash
tail -f /var/log/postgresql/postgresql-14-main.log
```

---

## Contactar Soporte

Si ninguna solución funciona:

### Información a incluir

1. **Descripción del problema**
   - ¿Qué estabas haciendo?
   - ¿Qué esperabas que pasara?
   - ¿Qué pasó en realidad?

2. **Pasos para reproducir**
   - Paso 1: ...
   - Paso 2: ...
   - Paso 3: Error

3. **Información técnica**
   - Navegador y versión
   - Sistema operativo
   - Captura de pantalla
   - Errores de consola (F12)

4. **Momento del error**
   - Fecha y hora exacta
   - ¿Primera vez o recurrente?

### Canales de soporte

- 📧 **Email**: soporte@percapita.example.com
- 📞 **Teléfono**: +56 2 XXXX XXXX
- 🐛 **Issues**: GitHub (para desarrolladores)

---

## Recursos Adicionales

- [FAQ](faq.md) - Preguntas frecuentes
- [Glosario](glossary.md) - Términos técnicos
- [Documentación de API](../api/index.md) - Para desarrolladores
