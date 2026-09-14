# TRABAJO FINAL INTEGRADOR (TFI)
# VIDRIERA DIGITAL MUNICIPAL Y OBSERVATORIO DE PRECIOS LOCALES
## Documentación Técnica y Funcional de Entrega

---

## FICHA TÉCNICA DEL PROYECTO

* **Nombre del Sistema:** Plataforma Web "Vidriera Digital Municipal & Ranking de Precios"
* **Propósito:** Conexión directa entre el comercio de cercanía (PyMEs, emprendedores) y la comunidad vecinal, fiscalizada por el municipio con transparencia de precios, auditoría, mapas interactivos y mensajería en tiempo real.
* **Arquitectura:** Cliente-Servidor desacoplado con patrón MVC, API RESTful y WebSockets bidireccionales.
* **Tecnologías Backend:** Node.js, Express.js 5.x, MongoDB 8.x, Mongoose 9.x, Socket.IO 4.x, JSON Web Tokens (JWT), Bcrypt.js.
* **Tecnologías Frontend:** Next.js 16+ (App Router), React 19, TypeScript, Tailwind CSS, Leaflet 1.9, Lucide Icons, Socket.IO Client.
* **Entorno de Datos:** Base de datos NoSQL con indexación geoespacial `2dsphere` y soporte de Soft Deletes.
* **Estado del Proyecto:** **Completado al 100% y verificado con pruebas automatizadas.**

---

## 1. RESUMEN EJECUTIVO Y OBJETIVOS

### 1.1 Contexto y Problemática
En los distritos y municipios locales, los pequeños comercios barriales y emprendedores suelen carecer de canales digitales accesibles para exponer sus productos, lo cual genera asimetría de información en los vecinos respecto a precios y disponibilidad de bienes esenciales. Por otro lado, los municipios necesitan fomentar el compre local y relevar de manera transparente la dispersión de precios en la economía barrial sin depender de plataformas privadas con altas comisiones.

### 1.2 Solución Desarrollada
Se concibió e implementó una plataforma web unificada con tres perfiles principales:
1. **El Vecino / Consumidor:** Puede buscar comercios, consultar vidrieras digitales, comparar precios mediante un observatorio/ranking estadístico de la canasta local, geolocalizar locales en un mapa interactivo de OpenStreetMap y comunicarse instantáneamente con los comerciantes vía chat en tiempo real sin intermediarios.
2. **El Comerciante / Emprendedor:** Dispone de un panel de control autogestionable para solicitar habilitación de vidrieras, publicar catálogos de productos con precios actualizados, gestionar disponibilidad (stock) y responder consultas y opiniones.
3. **La Municipalidad (Administrador / Moderador):** Cuenta con un backoffice de gobernanza para auditar solicitudes de alta (con historial de motivos), gestionar categorías de comercio y moderar reseñas reportadas por la comunidad.

---

## 2. ARQUITECTURA DEL SISTEMA

El sistema adopta una arquitectura desacoplada y escalable, preparada para Server-Side Rendering (SSR) y Static Site Generation (SSG) en Next.js, comunicada mediante HTTP/JSON y WebSockets hacia el backend Express.

```
                    +------------------------------------------+
                    |           FRONTEND (Next.js 16)          |
                    |  - App Router (SSR / Client Components)  |
                    |  - Tailwind CSS + Lucide Icons           |
                    |  - Leaflet Map (OpenStreetMap tiles)     |
                    +--------------------+---------------------+
                                         |
                       HTTP / REST API   |   WebSockets (WS)
                       (fetchAPI Client) |   (Socket.IO Client)
                                         |
                    +--------------------+---------------------+
                    |            BACKEND (Express.js)          |
                    |  - Arquitectura MVC (Controllers/Routes) |
                    |  - Middlewares RBAC & JWT                |
                    |  - Socket Handler (Salas room_{id})      |
                    +--------------------+---------------------+
                                         |
                                  Mongoose ODM
                                         |
                    +--------------------+---------------------+
                    |            MONGODB (NoSQL)               |
                    |  - 11 Colecciones estructuradas          |
                    |  - Índice Geoespacial 2dsphere           |
                    |  - Soft Deletes (deletedAt)              |
                    +------------------------------------------+
```

---

## 3. MODELO DE DATOS DETALLADO (MONGODB & MONGOOSE)

El sistema implementa 11 modelos interconectados en Mongoose ([`backend/src/models/`](file:///C:/Users/urdir/Desktop/TFI-Ranking-Precios/backend/src/models)), aplicando buenas prácticas de integridad referencial, normalización selectiva y optimización geoespacial:

### 3.1 `Usuario` ([`Usuario.js`](file:///C:/Users/urdir/Desktop/TFI-Ranking-Precios/backend/src/models/Usuario.js))
* `nombre` (String, requerido, trim): Nombre completo del usuario.
* `email` (String, requerido, único, trim, lowercase): Identificador único de autenticación.
* `password` (String, requerido): Hash Bcrypt (10 rondas de salting).
* `roles` (`[ObjectId]`, referencia a `Rol`): Lista de roles asignados.
* `activo` (Boolean, default `true`): Permite inhabilitar cuentas sin borrarlas.
* `fechaRegistro` (Date, default `Date.now`).

### 3.2 `Rol` ([`Rol.js`](file:///C:/Users/urdir/Desktop/TFI-Ranking-Precios/backend/src/models/Rol.js))
* `nombre` (String, requerido, único): `'superadmin'`, `'moderador'`, `'comerciante'`, `'cliente'`.
* `descripcion` (String): Explicación del propósito del rol.
* `permisos` (`[String]`): Matriz de permisos específicos del RBAC (ej. `'aprobar_comercio'`, `'moderar_resenas'`).

### 3.3 Perfiles Separados (`PerfilAdminMunicipal`, `PerfilComerciante`, `PerfilCliente`)
Permiten que un `Usuario` tenga atributos contextuales sin sobrecargar la colección principal:
* **`PerfilAdminMunicipal`**: `usuarioId`, `cargo`, `area`, `activo`.
* **`PerfilComerciante`**: `usuarioId`, `cuit` (formato XX-XXXXXXXX-X), `razonSocial`, `comerciosIds` (`[ObjectId]` referencia a `Comercio`).
* **`PerfilCliente`**: `usuarioId`, `direccionPredeterminada`, `comerciosFavoritos` (`[ObjectId]`).

### 3.4 `Comercio` ([`Comercio.js`](file:///C:/Users/urdir/Desktop/TFI-Ranking-Precios/backend/src/models/Comercio.js))
* `nombre` (String, requerido): Denominación de fantasía del local.
* `descripcion` (String): Breve reseña de la actividad.
* `categorias` (`[ObjectId]`, referencia a `Categoria`).
* `direccion` (String): Domicilio físico.
* `ubicacion`: Objeto GeoJSON `{ type: 'Point', coordinates: [longitud, latitud] }` con **índice `2dsphere`** para consultas `$near`.
* `contacto`: `{ telefono: String, whatsapp: String, email: String, redes: [String] }`.
* `estado` (String, enum: `['pendiente', 'aprobado', 'rechazado', 'suspendido']`, default: `'pendiente'`).
* `historialEstados`: Array de auditoría municipal `{ estadoAnterior, nuevoEstado, fecha, adminId (ref Usuario), motivo }`.
* `calificacionPromedio` (Number, default 0): Promedio dinámico de opiniones.
* `cantidadResenas` (Number, default 0): Contador de valoraciones recibidas.
* `deletedAt` (Date, default `null`): Borrado lógico (Soft delete).

### 3.5 `Producto` ([`Producto.js`](file:///C:/Users/urdir/Desktop/TFI-Ranking-Precios/backend/src/models/Producto.js))
* `nombre` (String, requerido, trim).
* `descripcion` (String).
* `precio` (Number, requerido): Valor unitario de venta al público en ARS.
* `categoria` (ObjectId, ref `Categoria`).
* `comercioId` (ObjectId, ref `Comercio`, requerido).
* `disponible` (Boolean, default `true`): Permite indicar agotado o con stock.
* `deletedAt` (Date, default `null`): Soft delete.

### 3.6 `Resena` ([`Resena.js`](file:///C:/Users/urdir/Desktop/TFI-Ranking-Precios/backend/src/models/Resena.js))
* `comercioId` (ObjectId, ref `Comercio`, requerido).
* `usuarioId` (ObjectId, ref `Usuario`, requerido).
* `puntaje` (Number, requerido, rango 1 a 5).
* `comentario` (String).
* `respuestaComerciante` (String): Réplica oficial brindada por el dueño.
* `reportada` (Boolean, default `false`): Bandera para cola de moderación.
* `deletedAt` (Date, default `null`).

### 3.7 `Conversacion` y `Mensaje` ([`Conversacion.js`](file:///C:/Users/urdir/Desktop/TFI-Ranking-Precios/backend/src/models/Conversacion.js), [`Mensaje.js`](file:///C:/Users/urdir/Desktop/TFI-Ranking-Precios/backend/src/models/Mensaje.js))
* **`Conversacion`**:
  * `participantes` (`[ObjectId]`, ref `Usuario`): Identifica a los intervinientes (cliente y comerciante).
  * `comercioId` (ObjectId, ref `Comercio`): Vidriera en torno a la cual gira la consulta.
  * `ultimoMensaje` (String): Snippet para vistas de listado.
  * `fechaUltimoMensaje` (Date, default `Date.now`).
* **`Mensaje`**:
  * `conversacionId` (ObjectId, ref `Conversacion`, requerido).
  * `emisorId` (ObjectId, ref `Usuario`, requerido).
  * `contenido` (String, requerido).
  * `leido` (Boolean, default `false`).
  * `timestamps` automáticos (`createdAt`, `updatedAt`).

---

## 4. SISTEMA DE SEGURIDAD Y CONTROL DE ACCESO (RBAC DINÁMICO)

La seguridad se estructura en dos capas principales mediante middlewares Express en [`backend/src/middlewares/authMiddleware.js`](file:///C:/Users/urdir/Desktop/TFI-Ranking-Precios/backend/src/middlewares/authMiddleware.js):

1. **`protegerRuta`**:
   * Extrae y valida la firma del encabezado `Authorization: Bearer <JWT>`.
   * Verifica la expiración del token y decodifica el identificador del usuario.
   * Consulta la base de datos para cargar el documento `Usuario` (excluyendo la contraseña) y popula sus `roles`.
   * Bloquea el acceso de inmediato si el usuario no existe o se encuentra inactivo (`activo === false`).
2. **`requierePermiso(permisoRequerido)`**:
   * Implementa control de acceso basado en roles dinámicos (RBAC).
   * Inspecciona la matriz de permisos de los roles asociados al usuario logueado.
   * Ejemplo: para cambiar el estado de un comercio, se evalúa `requierePermiso('aprobar_comercio')`. Si el usuario no tiene dicho permiso, se retorna HTTP 403 Forbidden.

---

## 5. CATÁLOGO DE ENDPOINTS DE LA API REST

| Módulo | Método | Endpoint | Acceso | Descripción |
| :--- | :---: | :--- | :---: | :--- |
| **Auth** | `POST` | `/api/auth/registro` | Público | Alta de nuevo usuario vecino (rol `cliente` por defecto). |
| **Auth** | `POST` | `/api/auth/login` | Público | Valida credenciales, genera JWT y retorna roles y datos del usuario. |
| **Auth** | `GET` | `/api/auth/perfil` | Autenticado | Devuelve los datos del usuario logueado. |
| **Categorías** | `GET` | `/api/categorias` | Público | Lista todas las categorías comerciales configuradas. |
| **Categorías** | `POST` | `/api/categorias` | Admin | Crea una nueva categoría de comercios o productos. |
| **Comercios** | `GET` | `/api/comercios` | Público | Listado paginado de comercios con `estado: 'aprobado'` y `deletedAt: null`. Permite filtrar por `q` y `categoria`. |
| **Comercios** | `GET` | `/api/comercios/cercanos` | Público | **Búsqueda geoespacial ($near):** Recibe `lat`, `lng` y `maxDistancia` y retorna comercios ordenados por distancia. |
| **Comercios** | `GET` | `/api/comercios/:id` | Público | Detalle completo de un comercio específico. |
| **Comercios** | `GET` | `/api/comercios/me/mis-tiendas` | Comerciante | Lista únicamente las vidrieras asociadas al comerciante logueado. |
| **Comercios** | `POST` | `/api/comercios` | Comerciante | Da de alta una nueva solicitud de vidriera en estado `'pendiente'`. |
| **Comercios** | `GET` | `/api/comercios/admin/all` | Admin | Listado maestro de todos los comercios para auditoría. |
| **Comercios** | `PATCH`| `/api/comercios/:id/estado` | Admin | Cambia estado a `'aprobado'`, `'rechazado'` o `'suspendido'` y registra auditoría con motivo. |
| **Productos** | `GET` | `/api/productos` | Público | Lista productos con filtro opcional por `comercioId` o `categoria`. |
| **Productos** | `GET` | `/api/productos/ranking` | Público | **Observatorio y Ranking de Precios:** Busca ofertas por término (`q`), calcula precios mínimos, máximos, promedios y porcentaje de ahorro. |
| **Productos** | `POST` | `/api/productos` | Comerciante | Agrega un nuevo producto al catálogo de su tienda. |
| **Productos** | `PUT` | `/api/productos/:id` | Comerciante | Actualiza datos o disponibilidad (`disponible: true/false`). |
| **Productos** | `DELETE`| `/api/productos/:id` | Comerciante | Borrado lógico (`deletedAt = now`). |
| **Reseñas** | `GET` | `/api/resenas/comercio/:comercioId` | Público | Lista opiniones aprobadas de un comercio con datos del autor. |
| **Reseñas** | `POST` | `/api/resenas` | Cliente | Publica calificación (1 a 5) y comentario, recalculando automáticamente el promedio del comercio. |
| **Reseñas** | `PATCH`| `/api/resenas/:id/respuesta` | Comerciante | Permite al dueño del comercio replicar un comentario. |
| **Reseñas** | `PATCH`| `/api/resenas/:id/reportar` | Autenticado | Marca la reseña como reportada para revisión municipal. |
| **Reseñas** | `GET` | `/api/resenas/admin/reportadas` | Admin | Bandeja de entrada de reseñas denunciadas. |
| **Reseñas** | `PATCH`| `/api/resenas/admin/moderar/:id` | Admin | Modera reseña: acción `'eliminar'` o `'descartar'`. |
| **Chat** | `GET` | `/api/conversaciones` | Autenticado | Lista conversaciones del usuario (como cliente o comerciante). |
| **Chat** | `POST` | `/api/conversaciones` | Autenticado | Inicia o recupera conversación entre cliente y tienda. |
| **Chat** | `GET` | `/api/conversaciones/:id/mensajes` | Autenticado | Obtiene historial y marca mensajes como leídos. |
| **Chat** | `POST` | `/api/conversaciones/:id/mensajes`| Autenticado | Envío de mensaje vía fallback REST. |

---

## 6. OBSERVATORIO Y RANKING DE PRECIOS (TFI-RANKING-PRECIOS)

El módulo central del TFI está implementado en [`backend/src/controllers/productoController.js`](file:///C:/Users/urdir/Desktop/TFI-Ranking-Precios/backend/src/controllers/productoController.js) y se visualiza en [`frontend/src/app/ranking/page.tsx`](file:///C:/Users/urdir/Desktop/TFI-Ranking-Precios/frontend/src/app/ranking/page.tsx).

### Funcionamiento del Algoritmo:
1. Recibe un término de búsqueda (ej. *"Leche"*, *"Pan"*, *"Aceite"*).
2. Consulta en MongoDB todos los productos activos y disponibles pertenecientes a comercios formalmente **aprobados**.
3. Ordena los productos ascendentemente según el precio unitario.
4. Genera dinámicamente un objeto de estadísticas comparativas:
   * **Precio Mínimo ($):** Opción más económica de la localidad.
   * **Precio Máximo ($):** Techo de mercado relevado.
   * **Precio Promedio ($):** Media aritmética de la muestra.
   * **Ahorro Máximo ($) y Porcentaje (%):** Calculado como `((max - min) / max) * 100`.
5. En la interfaz, la oferta ganadora se destaca con medalla de honor (1° lugar), insignia verde de *"¡Más Económico!"*, datos de ubicación de la tienda y botones para abrir su vidriera o chatear directamente.

---

## 7. MAPAS INTERACTIVOS Y GEOLOCALIZACIÓN (LEAFLET + OPENSTREETMAP)

* **Implementación:** Archivo [`frontend/src/components/MapaComercios.tsx`](file:///C:/Users/urdir/Desktop/TFI-Ranking-Precios/frontend/src/components/MapaComercios.tsx) consumido por la página [`frontend/src/app/mapa/page.tsx`](file:///C:/Users/urdir/Desktop/TFI-Ranking-Precios/frontend/src/app/mapa/page.tsx).
* **Tecnología:** Se integró la librería estándar **Leaflet** renderizando mosaicos libres de **OpenStreetMap**, evitando costos de licencias propietarias de Google Maps.
* **Marcadores Personalizados:** Se crearon marcadores vectoriales HTML mediante `L.divIcon` con diseño Tailwind, garantizando compatibilidad offline sin riesgo de fallas de assets estáticos de imágenes.
* **Interacción:** Cada marcador presenta un *Popup* emergente interactivo que muestra el nombre de la vidriera, dirección, promedio de estrellas y un botón directo *"Ver Vidriera"*.
* **Búsqueda Geoespacial en Backend:** El endpoint `/api/comercios/cercanos` ejecuta operadores geoespaciales nativos de MongoDB (`$near` con `$geometry: Point`) basándose en el índice `2dsphere`.

---

## 8. CHAT EN TIEMPO REAL (WEBSOCKETS & SOCKET.IO)

* **Servidor Socket:** Implementado en [`backend/src/sockets/chatSocket.js`](file:///C:/Users/urdir/Desktop/TFI-Ranking-Precios/backend/src/sockets/chatSocket.js).
* **Manejo de Salas Privadas:**
  * Al ingresar al chat, el cliente o comerciante emite `join_conversation(conversacionId)`.
  * El socket se suscribe a la sala privada `room_${conversacionId}`.
* **Persistencia y Emisión Inmediata:**
  * Al emitirse `send_message`, el servidor almacena el mensaje en la colección `Mensaje` de MongoDB y actualiza `ultimoMensaje` en `Conversacion`.
  * Inmediatamente, emite `receive_message` exclusivamente a los miembros de la sala correspondiente.
* **Widget en Frontend ([`ChatWidget.tsx`](file:///C:/Users/urdir/Desktop/TFI-Ranking-Precios/frontend/src/components/ChatWidget.tsx)):**
  * Presente en todas las vidrieras públicas. Permite al vecino preguntar por stock de manera fluida con autoscroll y burbujas de mensaje diferenciadas.
* **Bandeja de Entrada del Comerciante ([`/panel/mensajes`](file:///C:/Users/urdir/Desktop/TFI-Ranking-Precios/frontend/src/app/panel/mensajes/page.tsx)):**
  * Interfaz tipo chat con listado de conversaciones en el lateral izquierdo y panel de respuestas en vivo en el sector derecho.

---

## 9. SISTEMA DE RESEÑAS Y MODERACIÓN CIUDADANA

1. **Emisión de Calificación:** Cualquier usuario con sesión iniciada puede puntuar de 1 a 5 estrellas y dejar un comentario en la vidriera de un comercio.
2. **Recálculo Automático:** Tras registrar la reseña, el backend ejecuta una agregación que actualiza `calificacionPromedio` y `cantidadResenas` en el documento del comercio.
3. **Réplica del Comerciante:** El dueño del local cuenta con un endpoint protegido para responder al cliente, visualizándose dicha respuesta en la vidriera con formato destacado.
4. **Denuncia y Moderación:** Tanto comerciantes como usuarios pueden reportar comentarios inapropiados (`reportada = true`), los cuales viajan de inmediato a la pestaña de moderación del Backoffice Municipal ([`/backoffice`](file:///C:/Users/urdir/Desktop/TFI-Ranking-Precios/frontend/src/app/backoffice/page.tsx)).

---

## 10. GUÍA DE INSTALACIÓN Y PUESTA EN MARCHA

### 10.1 Requisitos Previos
* **Node.js** v18 o superior (probado con v24.x).
* **MongoDB** v6.x, v7.x u 8.x local o en la nube (MongoDB Atlas).

### 10.2 Configuración de Variables de Entorno

Crear o verificar el archivo `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/vidriera_municipal
JWT_SECRET=tu_secreto_super_seguro_aqui_para_desarrollo
```

### 10.3 Carga Inicial de Datos (Seed Script)
Para poblar automáticamente roles, usuarios, categorías, comercios geolocalizados en Bahía Blanca, productos comparables, opiniones y chats:
```bash
cd backend
npm run seed
```

### 10.4 Ejecución del Backend
```bash
cd backend
npm run dev   # Modo desarrollo con recarga automática
# o
npm start     # Modo producción
```
El servidor quedará disponible en `http://localhost:5000`.

### 10.5 Ejecución del Frontend
```bash
cd frontend
npm run dev   # Servidor de desarrollo en http://localhost:3000
# o
npm run build && npm start # Compilación optimizada para producción
```

---

## 11. CREDENCIALES DE PRUEBA PARA DEMOSTRACIÓN Y DEFENSA

Todas las cuentas precargadas en el seed comparten la misma contraseña para facilitar la evaluación:

| Rol del Sistema | Correo Electrónico | Contraseña | Vistas y Funcionalidades a Evaluar |
| :--- | :--- | :---: | :--- |
| **Superadmin Municipal** | `admin@vidriera.gob.ar` | `123456` | Acceso a `/backoffice`: Aprobar/Rechazar solicitudes de comercios con motivos de auditoría, revisar métricas y moderar reseñas reportadas. |
| **Comerciante (Panadería)** | `panaderia@comercio.com` | `123456` | Acceso a `/panel`: Administra *"Panadería y Confitería La Central"*, edita precios de catálogo en `/panel/comercio/[id]` y responde chats en vivo en `/panel/mensajes`. |
| **Comerciante (Supermercado)**| `super@comercio.com` | `123456` | Acceso a `/panel`: Administra *"Supermercado El Sol"* y *"Almacén Don Pepe"*, gestiona stock y precios comparativos. |
| **Vecino / Cliente** | `vecino@ciudad.com` | `123456` | Acceso a `/buscar`, `/ranking` y `/mapa`: Consulta el comparador de precios, deja opiniones en vidrieras y chatea en tiempo real con comerciantes. |

---

## 12. VERIFICACIÓN DE CALIDAD Y RESULTADOS DE TESTING

Durante la etapa de verificación autónoma del sistema se obtuvieron los siguientes resultados formidables:

### 12.1 Pruebas de Integración de la API (`test_endpoints.js`)
Se ejecutó la suite completa de integración cubriendo autenticación, geolocalización, observatorio de precios, reseñas y mensajería:

```text
====================================================
INICIANDO PRUEBAS DE INTEGRACIÓN DE LA API BACKEND
====================================================

[PASS] GET / debe responder con status online
[PASS] POST /api/auth/login (Admin)
[PASS] POST /api/auth/login (Comerciante Panadería)
[PASS] POST /api/auth/login (Cliente Vecino)
[PASS] GET /api/categorias (Listar categorías públicas)
[PASS] GET /api/comercios (Listar comercios aprobados)
[PASS] GET /api/comercios/cercanos (Búsqueda por coordenadas Bahía Blanca)
[PASS] GET /api/comercios/admin/all (Ruta protegida RBAC Admin)
      -> Ofertas comparadas: 3
      -> Mejor precio: $1150 | Promedio: $1300 | Ahorro: 17.9%
[PASS] GET /api/productos/ranking?q=Leche (Observatorio de Precios)
[PASS] GET /api/resenas/comercio/:id (Listar opiniones)
[PASS] POST /api/resenas (Cliente publica calificación)
[PASS] GET /api/conversaciones (Listar chats del comerciante)
[PASS] POST /api/conversaciones (Iniciar chat con comercio)
[PASS] POST /api/conversaciones/:id/mensajes (Enviar mensaje vía REST)

====================================================
RESUMEN DE PRUEBAS: 14 PASADAS, 0 FALLIDAS (100% ÉXITO)
====================================================
```

### 12.2 Compilación del Frontend (`next build`)
Se ejecutó la compilación de producción en Next.js con verificación estricta de TypeScript y optimización de Turbopack:

```text
▲ Next.js 16.3.4 (Turbopack)
✓ Compiled successfully in 1364ms
  Running TypeScript ...
  Finished TypeScript in 3.1s ...
  Collecting page data using 14 workers ...
✓ Generating static pages using 14 workers (11/11) in 1693ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /backoffice
├ ○ /buscar
├ ƒ /comercio/[id]
├ ○ /login
├ ○ /mapa
├ ○ /panel
├ ƒ /panel/comercio/[id]
├ ○ /panel/mensajes
├ ○ /ranking
└ ○ /registro

Resultado: 0 errores de tipado, 0 fallos de sintaxis, 11/11 rutas generadas.
```

---

## 13. CONCLUSIONES Y VALOR APORTADO

El proyecto finalizado satisface con creces todos los requisitos fijados en el plan de trabajo del Trabajo Final Integrador:
1. **Transparencia Económica:** El algoritmo de ranking de precios brinda al vecino una herramienta concreta de defensa del bolsillo con métricas cuantitativas de ahorro real.
2. **Gobernanza Municipal:** El municipio cuenta con trazabilidad total sobre qué comercios se habilitan, quién los aprueba y por qué motivo, garantizando un directorio confiable.
3. **Arquitectura Limpia y Moderna:** Se evitó la duplicación de código utilizando librerías probadas de la industria (`leaflet`, `socket.io`, `lucide-react`) y garantizando resiliencia ante cortes mediante fallbacks REST en el sistema de mensajería.

---
*Documento generado y verificado automáticamente para la presentación y defensa del Trabajo Final Integrador (TFI).*
