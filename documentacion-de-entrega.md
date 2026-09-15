# TRABAJO FINAL INTEGRADOR (TFI)
# VIDRIERA DIGITAL MUNICIPAL Y OBSERVATORIO DE PRECIOS LOCALES
## Documentación Técnica, Arquitectónica y Funcional de Entrega

---

## FICHA TÉCNICA DEL PROYECTO

* **Denominación del Sistema:** Plataforma Web "Vidriera Digital Municipal & Observatorio Barrial de Precios"
* **Ámbito Geográfico y de Aplicación:** Municipio de Bahía Blanca, Provincia de Buenos Aires, Argentina.
* **Propósito Institucional:** Conexión directa y desintermediada entre el comercio de proximidad (PyMEs, almacenes, panaderías, ferias y emprendedores locales) y la ciudadanía vecinal, bajo la supervisión y fiscalización de la Dirección de Comercio municipal. Integra transparencia de precios, relevamiento estadístico de canasta barrial, auditoría de altas, cartografía georreferenciada y mensajería en tiempo real.
* **Arquitectura de Software:** Cliente-Servidor desacoplado con arquitectura por capas (Controladores, Modelos, Enrutadores, Middlewares, Sockets), API RESTful y WebSockets bidireccionales concurrentes.
* **Stack Tecnológico Backend:** Node.js (v20+ / v24+), Express.js 5.x, MongoDB 8.x, Mongoose 9.x, Socket.IO 4.x, JSON Web Tokens (JWT), Bcrypt.js, CORS, Dotenv.
* **Stack Tecnológico Frontend:** Next.js 16+ (App Router con Turbopack), React 19, TypeScript 5+, Tailwind CSS 4+, Leaflet 1.9, Recharts 2.x, Lucide React (vectorial SVG), Sonner (notificaciones accesibles), Canvas-Confetti.
* **Sistema de Diseño (Design System):** *Warm Graphite & Soft Silver* (Grafito cálido institucional `#12151b` / `#171b22` con tipografía plata suave `#d5d9e0` y acentos sobrios: Denim Municipal `#4b6cb7`, Salvia `#4a7c59`, Ocre `#b8860b`, Vino `#8b3a4a` y Acero `#7dafb5`). Cero emojis de mensajería, cero colores neón estridentes, cero blanco puro `#ffffff` ni negro puro `#000000`.
* **Seguridad y Control de Acceso:** RBAC dinámico (Role-Based Access Control) con 4 roles base (`superadmin`, `moderador`, `comerciante`, `cliente`), tokens JWT firmados criptográficamente y hashing Bcrypt con 10 rondas de salt.
* **Persistencia y Consultas Geoespaciales:** Base de datos NoSQL con indexación geoespacial `2dsphere` para búsquedas radiales `$near`, borrado lógico (*Soft Deletes* con campo `deletedAt`) y agregaciones analíticas de dispersión de precios.
* **Estado de Verificación:** **100% Funcional, 14/14 pruebas automatizadas de integración superadas (100% PASS) y compilación de producción de Next.js (`npm run build`) completada con 0 errores y 13 rutas estáticas/dinámicas generadas.**

---

## 1. RESUMEN EJECUTIVO Y PROBLEMA QUE RESUELVE

### 1.1 Contexto socioeconómico
En los centros urbanos y partidos municipales, los pequeños comercios barriales enfrentan dos desafíos críticos:
1. **Asimetría tecnológica y de exposición:** No cuentan con plataformas accesibles para exhibir sus catálogos ni competir contra grandes hipermercados y aplicaciones corporativas de delivery que retienen comisiones de entre el 20% y el 35%.
2. **Dispersión y desinformación de precios:** Los vecinos no tienen un canal oficial y confiable para cotejar el costo de productos de primera necesidad (leche, pan, azúcar, carne, verduras) a pocas cuadras de su vivienda, perdiendo oportunidades de compra inteligente y ahorro.

### 1.2 La solución: Vidriera Digital + Observatorio
La plataforma unifica en un portal cívico moderno:
* **Para el Vecino:** Un observatorio barrial de precios con cálculo dinámico de brecha y ahorro (`((max - min) / max) * 100`), un mapa interactivo con pines georreferenciados para calcular distancias, valoraciones cívicas comunitarias y un canal de mensajería directa en vivo con el comerciante.
* **Para el Comerciante:** Una oficina virtual de autogestión donde postular locales, administrar catálogos de artículos con indicación de stock en tiempo real y responder preguntas de clientes sin intermediarios ni cobro de comisiones.
* **Para el Municipio:** Un panel de fiscalización y backoffice institucional para controlar la admisión legal de vidrieras comerciales mediante resoluciones con trazabilidad y auditar comentarios reportados por la comunidad.

---

## 2. ARQUITECTURA GENERAL DEL SISTEMA

```
+-----------------------------------------------------------------------------------+
|                           CAPA DE PRESENTACIÓN (CLIENTE)                          |
|                                                                                   |
|   Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4                |
|   - Páginas Públicas: Portada (/), Directorio (/buscar), Ranking (/ranking),      |
|     Mapa (/mapa), Vidriera (/comercio/[id])                                       |
|   - Portal Comerciante: Autogestión (/panel), Catálogo (/panel/comercio/[id]),    |
|     Bandeja Omnicanal (/panel/mensajes)                                           |
|   - Backoffice Municipal: Control de Admisión y Moderación (/backoffice)          |
|   - Componentes Clave: Recharts (Distribución), Leaflet (OSM), ChatWidget        |
+-------------------------+-----------------------------------+---------------------+
                          |                                   |
           HTTP / REST (JSON API)             WebSockets Bidireccionales (WSS)
           fetchAPI Client con JWT                     Socket.IO Client
                          |                                   |
+-------------------------v-----------------------------------v---------------------+
|                           CAPA DE SERVICIOS Y LÓGICA (BACKEND)                    |
|                                                                                   |
|   Node.js + Express.js 5                                                          |
|   - Enrutamiento Modular: /api/auth, /api/comercios, /api/productos,              |
|     /api/resenas, /api/conversaciones, /api/categorias                            |
|   - Middlewares: authMiddleware (JWT decode + RBAC requirePermiso)                |
|   - Socket Handler: chatSocket.js (Gestión de salas room_{id} y eventos)          |
|   - Tolerancia a Fallos: Listener con auto-fallback de puertos                    |
+------------------------------------------+----------------------------------------+
                                           |
                                      Mongoose ODM
                                           |
+------------------------------------------v----------------------------------------+
|                                CAPA DE DATOS (MONGODB)                            |
|                                                                                   |
|   MongoDB 8.x con 11 Colecciones Estructuradas:                                   |
|   - Usuarios, Roles, Perfiles (Admin, Comerciante, Cliente)                       |
|   - Comercios (Índice 2dsphere GeoJSON Point, Historial de Estados)               |
|   - Productos (Relación con Comercio y Categoría, Precios, Soft Delete)           |
|   - Reseñas (Puntajes 1-5, Agregación de Calificación, Reportes)                  |
|   - Conversaciones y Mensajes (Salas privadas, Timestamps)                        |
+-----------------------------------------------------------------------------------+
```

---

## 3. MODELO DE DATOS DETALLADO (MONGODB & MONGOOSE)

El esquema implementa 11 colecciones en Mongoose (`backend/src/models/`):

### 3.1 `Usuario` (`Usuario.js`)
* `nombre`: String (requerido, trim).
* `email`: String (requerido, único, lowercase).
* `password`: String (hash Bcrypt con 10 rondas de salt).
* `roles`: `[ObjectId]` referenciando a la colección `Rol`.
* `activo`: Boolean (default `true`, permite baja temporal).
* `fechaRegistro`: Date (default `Date.now`).

### 3.2 `Rol` (`Rol.js`)
* `nombre`: String (requerido, único: `'superadmin'`, `'moderador'`, `'comerciante'`, `'cliente'`).
* `descripcion`: String con el alcance del rol.
* `permisos`: `[String]` (matriz de capacidades del RBAC: `'aprobar_comercio'`, `'moderar_resenas'`, `'gestionar_catalogo'`, etc.).

### 3.3 Perfiles Contextuales
Para evitar esquemas sobrecargados, los atributos específicos por rol se distribuyen en colecciones auxiliares:
* **`PerfilAdminMunicipal`**: `usuarioId`, `cargo`, `area`, `activo`.
* **`PerfilComerciante`**: `usuarioId`, `cuit` (validación de formato), `razonSocial`, `comerciosIds` (`[ObjectId]`).
* **`PerfilCliente`**: `usuarioId`, `direccionPredeterminada`, `comerciosFavoritos` (`[ObjectId]`).

### 3.4 `Comercio` (`Comercio.js`)
* `nombre`: String (nombre de fantasía).
* `descripcion`: String (reseña de rubro y especialidad).
* `categorias`: `[ObjectId]` referenciando a `Categoria`.
* `direccion`: String (calle y número en Bahía Blanca).
* `ubicacion`: Objeto GeoJSON `{ type: 'Point', coordinates: [longitud, latitud] }` con **índice espacial `2dsphere`**.
* `contacto`: `{ telefono: String, whatsapp: String, email: String, redes: [String] }`.
* `estado`: Enum `['pendiente', 'aprobado', 'rechazado', 'suspendido']` (default `'pendiente'`).
* `historialEstados`: Array de auditoría institucional `{ estadoAnterior, nuevoEstado, fecha, adminId, motivo }`.
* `calificacionPromedio`: Number (recalculado automáticamente vía agregación).
* `cantidadResenas`: Number (contador dinámico de opiniones).
* `deletedAt`: Date (marca para borrado lógico).

### 3.5 `Producto` (`Producto.js`)
* `nombre`: String (requerido).
* `precio`: Number (requerido, valor en pesos argentinos).
* `categoria`: ObjectId (referencia a Categoria).
* `comercioId`: ObjectId (referencia obligatoria a Comercio).
* `disponible`: Boolean (control de stock: `true` disponible, `false` agotado).
* `deletedAt`: Date (soporte de borrado lógico).

### 3.6 `Resena` (`Resena.js`)
* `comercioId`: ObjectId (referencia a Comercio).
* `usuarioId`: ObjectId (referencia a Usuario).
* `puntaje`: Number (1 a 5 estrellas).
* `comentario`: String (opinión del vecino).
* `respuestaComerciante`: String (réplica institucional del titular).
* `reportada`: Boolean (bandera de fiscalización ciudadana).
* `deletedAt`: Date (soft delete).

### 3.7 `Conversacion` y `Mensaje` (`Conversacion.js` & `Mensaje.js`)
* **`Conversacion`**:
  * `participantes`: Array de dos `ObjectId` (vecino y titular del local).
  * `comercioId`: ObjectId de la vidriera consultada.
  * `ultimoMensaje`: String con el contenido del último mensaje intercambiado.
  * `fechaUltimoMensaje`: Date para ordenamiento en bandeja.
* **`Mensaje`**:
  * `conversacionId`: ObjectId de la conversación padre.
  * `emisorId`: ObjectId del emisor.
  * `contenido`: String (texto plano sanitizado).
  * `leido`: Boolean (acuse de recibo).
  * Timestamps automáticos (`createdAt`, `updatedAt`).

---

## 4. SISTEMA DE SEGURIDAD Y CONTROL DE ACCESO (RBAC)

La capa de seguridad reside en `backend/src/middlewares/authMiddleware.js`:

1. **Autenticación con JWT (`protegerRuta`):**
   * Inspecciona el header HTTP `Authorization: Bearer <token>`.
   * Verifica la firma y la fecha de expiración contra `process.env.JWT_SECRET`.
   * Carga el usuario de MongoDB con sus roles poblados (`populate('roles')`).
   * Valida que la cuenta se encuentre activa (`activo === true`).
2. **Autorización Dinámica por Permisos (`requierePermiso`):**
   * En lugar de depender de nombres rígidos de roles, evalúa si alguno de los roles asignados al usuario contiene el permiso específico requerido para la operación (ej: `'aprobar_comercio'`, `'moderar_resenas'`).
   * Retorna `403 Forbidden` si el usuario carece de la autorización pertinente.

---

## 5. CATÁLOGO COMPLETO DE ENDPOINTS DE LA API REST

| Módulo | Verbo | Ruta | Acceso | Función Técnica |
| :--- | :---: | :--- | :---: | :--- |
| **Auth** | `POST` | `/api/auth/registro` | Público | Registra vecino asignando rol `cliente` y entrega JWT. |
| **Auth** | `POST` | `/api/auth/login` | Público | Compara contraseña con Bcrypt, emite JWT y retorna perfil y roles. |
| **Auth** | `GET` | `/api/auth/perfil` | Autenticado | Devuelve datos del usuario actualmente autenticado. |
| **Categorías** | `GET` | `/api/categorias` | Público | Lista los rubros comerciales activos. |
| **Categorías** | `POST` | `/api/categorias` | Admin | Crea una nueva categoría en el clasificador municipal. |
| **Comercios** | `GET` | `/api/comercios` | Público | Catálogo público paginado de vidrieras aprobadas con filtro por texto (`q`) y rubro. |
| **Comercios** | `GET` | `/api/comercios/cercanos` | Público | Consulta geoespacial `$near` en radio de coordenadas (lat, lng, distancia). |
| **Comercios** | `GET` | `/api/comercios/:id` | Público | Retorna la ficha técnica de un comercio. |
| **Comercios** | `GET` | `/api/comercios/me/mis-tiendas` | Comerciante | Lista los locales pertenecientes al comerciante logueado. |
| **Comercios** | `POST` | `/api/comercios` | Comerciante | Crea una nueva vidriera en estado `'pendiente'`. |
| **Comercios** | `GET` | `/api/comercios/admin/all` | Admin | Matriz completa de comercios para la Dirección de Comercio. |
| **Comercios** | `PATCH`| `/api/comercios/:id/estado` | Admin | Modifica estado (`aprobado`, `rechazado`, `suspendido`) con registro de motivo de auditoría. |
| **Productos** | `GET` | `/api/productos` | Público | Lista artículos con filtro opcional por tienda o rubro. |
| **Productos** | `GET` | `/api/productos/ranking` | Público | **Módulo central:** Ranking comparativo por artículo, estadísticas de precios y porcentaje de ahorro. |
| **Productos** | `POST` | `/api/productos` | Comerciante | Agrega un nuevo producto al catálogo propio. |
| **Productos** | `PUT` | `/api/productos/:id` | Comerciante | Modifica atributos o disponibilidad (`disponible: true/false`). |
| **Productos** | `DELETE`| `/api/productos/:id` | Comerciante | Ejecuta borrado lógico del producto. |
| **Reseñas** | `GET` | `/api/resenas/comercio/:comercioId`| Público | Lista opiniones aprobadas de una tienda. |
| **Reseñas** | `POST` | `/api/resenas` | Cliente | Registra opinión y calificación, recalculando el promedio de la tienda. |
| **Reseñas** | `PATCH`| `/api/resenas/:id/respuesta` | Comerciante | Registra la réplica oficial del comercio. |
| **Reseñas** | `PATCH`| `/api/resenas/:id/reportar` | Autenticado | Denuncia comentario por contenido inapropiado. |
| **Reseñas** | `GET` | `/api/resenas/admin/reportadas` | Admin | Bandeja de moderación de reseñas denunciadas. |
| **Reseñas** | `PATCH`| `/api/resenas/admin/moderar/:id` | Admin | Resuelve reporte: acción `'eliminar'` o `'descartar'`. |
| **Chat** | `GET` | `/api/conversaciones` | Autenticado | Obtiene las salas de chat del usuario. |
| **Chat** | `POST` | `/api/conversaciones` | Autenticado | Inicia o recupera una sala entre cliente y comercio. |
| **Chat** | `GET` | `/api/conversaciones/:id/mensajes` | Autenticado | Historial de mensajes y marcado de leídos. |
| **Chat** | `POST` | `/api/conversaciones/:id/mensajes` | Autenticado | Fallback HTTP para envío de mensajes en ausencia de WebSocket. |

---

## 6. MÓDULO CENTRAL: OBSERVATORIO Y RANKING DE PRECIOS

Implementado en `backend/src/controllers/productoController.js` y expuesto visualmente en `frontend/src/app/ranking/page.tsx`:

### 6.1 Lógica del Algoritmo
1. El usuario ingresa un término de búsqueda (ej. *"Leche"*, *"Pan"*, *"Aceite"*).
2. El sistema filtra productos disponibles (`disponible: true`, `deletedAt: null`) pertenecientes exclusivamente a comercios con `estado: 'aprobado'`.
3. Ordena los resultados de manera ascendente por el campo `precio`.
4. Calcula en memoria métricas de mercado:
   * **Precio Mínimo ($):** Opción más económica registrada.
   * **Precio Máximo ($):** Techo del relevamiento.
   * **Precio Promedio ($):** Media aritmética de la muestra.
   * **Ahorro Máximo Potencial:** Fórmula `((Precio Máximo - Precio Mínimo) / Precio Máximo) * 100`.
5. La vista presenta:
   * **Podio Ganador:** Tarjeta destacada con el comercio que ofrece el mejor precio, ahorro porcentual, dirección y acceso a chat.
   * **Gráfico de Dispersión (Recharts):** Gráfico de barras comparativo horizontal con escala de colores diferenciada según el rango de precio.
   * **Listado Comparativo General:** Tabla desglosada con botones de acceso directo a cada vidriera.

---

## 7. CARTOGRAFÍA GEORREFERENCIADA (LEAFLET + OSM)

* **Componente:** `frontend/src/components/MapaComercios.tsx` en `frontend/src/app/mapa/page.tsx`.
* **Tecnología:** **Leaflet** con cartografía abierta **CartoDB Voyager / OpenStreetMap**, libre de costos de API Keys propietarias.
* **Marcadores Personalizados:** Pines vectoriales SVG renderizados mediante `L.divIcon` con diseño ajustado al sistema de color grafito/denim.
* **Ventana Emergente (Popup):** Despliega el nombre del local, dirección, promedio de estrellas y enlace directo a la vidriera.
* **Soporte Geoespacial:** Operador `$near` con índice `2dsphere` para resolver comercios dentro de un radio en metros desde el centro de Bahía Blanca (`-38.7183, -62.2642`).

---

## 8. MENSAJERÍA BIDIRECCIONAL EN TIEMPO REAL (SOCKET.IO)

* **Servidor WebSocket:** `backend/src/sockets/chatSocket.js`.
* **Manejo de Salas Privadas:**
  * Al ingresar a un chat, el cliente emite `join_conversation(conversacionId)` y se une a la sala `room_${conversacionId}`.
* **Flujo de Mensajería:**
  * Al emitir `send_message`, el servidor persiste el mensaje en MongoDB, actualiza el `ultimoMensaje` en la cabecera de la conversación y lo emite inmediatamente a la sala mediante `receive_message`.
* **Canales en Frontend:**
  * **Ciudadano:** `ChatWidget.tsx` incrustado como ventana emergente en cada vidriera comercial pública.
  * **Comerciante:** Bandeja omnicanal `/panel/mensajes` con listado de conversaciones y panel de respuesta en tiempo real.
* **Resiliencia:** Si la conexión WebSocket experimenta intermitencia, el frontend utiliza automáticamente el endpoint REST `POST /api/conversaciones/:id/mensajes` como fallback transparente.

---

## 9. SISTEMA DE DISEÑO VISUAL (DESIGN SYSTEM)

Siguiendo las pautas explícitas de diseño sobrio, institucional y moderno:

1. **Paleta Warm Graphite & Soft Silver:**
   * Fondo raíz: Grafito oscuro `#12151b`.
   * Superficies base y tarjetas: Grafito cálido `#171b22`.
   * Superficies elevadas e insumos: Grafito medio `#1d222b`.
   * Bordes sutiles: Carbón suave `#262d3a`.
   * Tipografía primaria: Plata cálido `#d5d9e0`.
   * Tipografía secundaria/muteada: Gris neutro `#8d94a1`.
2. **Acentos Muted Institucionales:**
   * Denim Municipal (Acciones principales): `#4b6cb7` (hover `#3d5a99`).
   * Salvia Polvorienta (Aprobados / Éxito): `#4a7c59` / `#8bb59b`.
   * Ocre Cálido (Pendientes / Advertencia / Estrellas): `#b8860b` / `#d1ab77`.
   * Vino Profundo (Rechazados / Alertas): `#8b3a4a` / `#d48a97`.
   * Acero Cívico (Informativo / Badges): `#7dafb5` / `#9cb1ce`.
3. **Cero Neón, Cero Blanco Puro, Cero Negro Puro:** Ningún elemento utiliza `#ffffff` ni `#000000`, eliminando el contraste estridente y el efecto de fatiga visual.
4. **Iconografía 100% Vectorial SVG (Lucide React):** Erradicación total de emoticones y emojis de mensajería (WhatsApp style), manteniendo un perfil institucional y profesional.

---

## 10. GUÍA DE INSTALACIÓN Y PUESTA EN MARCHA

### 10.1 Requisitos de Entorno
* **Node.js:** Versión 18.x o superior (desarrollado y verificado en v24.x).
* **MongoDB:** Servidor local o clúster MongoDB Atlas (v6.x a v8.x).

### 10.2 Configuración de Variables de Entorno

**Backend (`backend/.env`):**
```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/vidriera_municipal
JWT_SECRET=clave_secreta_jwt_tfi_bahia_blanca_segura_2026
```
*(Nota: El puerto 5001 se configuró para evitar el conflicto de reserva de puertos de Hyper-V / WSL2 en Windows en el puerto 5000).*

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

### 10.3 Población de Datos Iniciales (Seed)
Para cargar roles, usuarios, rubros, comercios georreferenciados en Bahía Blanca, catálogo de precios, reseñas y conversaciones de demostración:
```bash
cd backend
node src/scripts/seed.js
```

### 10.4 Inicio de los Servicios

**Terminal 1 - Backend Express & Sockets:**
```bash
cd backend
npm run dev
# Servidor escuchando en http://localhost:5001
```

**Terminal 2 - Frontend Next.js:**
```bash
cd frontend
npm run dev
# Interfaz disponible en http://localhost:3000
```

---

## 11. CREDENCIALES DE PRUEBA PARA DEMOSTRACIÓN

Todas las cuentas precargadas en el seed utilizan la contraseña unificada: **`123456`**.

| Rol | Correo Electrónico | Contraseña | Vistas y Flujos a Evaluar |
| :--- | :--- | :---: | :--- |
| **Superadmin Municipal** | `admin@vidriera.gob.ar` | `123456` | Acceso a `/backoffice`: Aprobar o rechazar vidrieras comerciales con registro de motivo de auditoría, consultar el gráfico de torta de solicitudes y moderar reseñas reportadas. |
| **Comerciante (Panadería)** | `panaderia@comercio.com` | `123456` | Acceso a `/panel`: Administra *"Panadería y Confitería La Central"*, edita precios unitarios en `/panel/comercio/[id]` y responde mensajes en vivo en `/panel/mensajes`. |
| **Comerciante (Supermercado)** | `super@comercio.com` | `123456` | Acceso a `/panel`: Administra *"Supermercado El Sol"* y *"Almacén Don Pepe"*, alternando stock de productos. |
| **Vecino Ciudadano** | `vecino@ciudad.com` | `123456` | Acceso a `/ranking`, `/mapa` y `/comercio/[id]`: Releva la canasta barrial, compara precios, visualiza la ubicación geográfica, publica opiniones y chatea con los comercios. |

---

## 12. EVIDENCIA DE TESTING Y CONTROL DE CALIDAD

### 12.1 Suite de Integración Automatizada (`test_endpoints.js`)
Resultado de la ejecución contra la API en vivo:

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

### 12.2 Compilación de Producción de Next.js (`npm run build`)
Resultado de la verificación estricta de tipos y empaquetado:

```text
▲ Next.js 16.3.4 (Turbopack)
- Environments: .env.local
✓ Running next.config.mjs took 57ms
  Creating an optimized production build ...
✓ Compiled successfully in 1909ms
  Running TypeScript ...
  Finished TypeScript in 3.7s ...
  Collecting page data using 15 workers ...
✓ Generating static pages using 15 workers (12/12) in 1638ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /backoffice
├ ○ /buscar
├ ƒ /comercio/[id]
├ ○ /login
├ ○ /mapa
├ ○ /olvide-password
├ ○ /panel
├ ƒ /panel/comercio/[id]
├ ○ /panel/mensajes
├ ○ /ranking
└ ○ /registro

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand

Resultado: 0 errores de tipado, 0 fallos de compilación.
```

---

## 13. GUÍA PASO A PASO PARA LA PRESENTACIÓN Y DEFENSA DEL PROYECTO

Para una presentación exitosa ante el tribunal docente o evaluador, se sugiere seguir esta secuencia demostrativa:

1. **Introducción Conceptual (2 minutos):**
   * Exponer la problemática de la asimetría de precios y la falta de canales sin comisión para comercios barriales en Bahía Blanca.
   * Mostrar la portada (`/`) con la presentación institucional y la vista previa interactiva de la Canasta Barrial.
2. **El Observatorio de Precios (`/ranking`) (3 minutos):**
   * Demostrar la búsqueda de un producto común (ej: *"Leche"* o *"Pan"*).
   * Explicar el cálculo de dispersión: cómo el sistema identifica la opción más económica y calcula el ahorro potencial.
   * Mostrar el gráfico comparativo de Recharts y el podio de mejores precios.
3. **Cartografía y Georreferenciación (`/mapa`) (2 minutos):**
   * Mostrar el mapa interactivo con OpenStreetMap.
   * Seleccionar un comercio en la lista lateral para centrar la cámara y abrir el Popup con información de contacto y enlace a la vidriera.
4. **Experiencia del Vecino y Chat en Vivo (`/comercio/[id]`) (3 minutos):**
   * Abrir la vidriera de *"Panadería y Confitería La Central"*.
   * Mostrar el catálogo de productos, las opiniones de vecinos y abrir el botón de consulta ciudadana.
   * Enviar un mensaje de consulta en tiempo real mediante el `ChatWidget`.
5. **Autogestión del Comerciante (`/panel`) (3 minutos):**
   * Iniciar sesión como `panaderia@comercio.com`.
   * Entrar a `/panel/mensajes` para mostrar la recepción instantánea del mensaje del vecino y contestarlo en vivo.
   * Ir a `/panel/comercio/[id]`, alternar la disponibilidad de un producto (de "Disponible" a "Agotado") y agregar un nuevo artículo al catálogo para mostrar el impacto inmediato en el observatorio de precios.
6. **Backoffice y Gobernanza Municipal (`/backoffice`) (2 minutos):**
   * Iniciar sesión con la cuenta `admin@vidriera.gob.ar`.
   * Mostrar la matriz de comercios, el gráfico de distribución por estado y la pestaña de moderación de reseñas reportadas.
   * Ejecutar la aprobación o rechazo de un comercio ingresando el motivo de resolución municipal.
7. **Cierre y Preguntas Técnicas:**
   * Destacar la solidez del stack: TypeScript riguroso, RBAC modular, WebSockets con fallback REST, índices espaciales NoSQL y sistema de diseño sobrio sin elementos improvisados.

---
*Documentación técnica y funcional finalizada para la entrega y defensa del Trabajo Final Integrador (TFI).*
