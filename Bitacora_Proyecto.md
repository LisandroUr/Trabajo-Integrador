# Bitácora del Proyecto: Vidriera Digital Municipal

Este archivo mantiene un seguimiento cronológico y limpio de todas las consultas, decisiones, modificaciones y avances en el desarrollo del proyecto.

---

### [2026-09-06] - Fase: Análisis Inicial de Requerimientos

**Consulta / Contexto:** 
El usuario solicitó un análisis profundo del plan de proyecto original, documentado en el archivo `vidriera-digital-municipal (1).docx`. Posteriormente solicitó generar documentos limpios con el plan actualizado y una bitácora de seguimiento.

**Análisis realizado:**
Se revisó la arquitectura propuesta (MVC, MERN stack, WebSockets, mapas) y el modelo de datos.
- Puntos fuertes detectados: Separación inteligente entre la entidad `Usuario` y sus `Perfiles`, uso de un sistema RBAC (roles y permisos en DB) dinámico, y separación entre colecciones de `Conversacion` y `Mensaje` por límites de tamaño en MongoDB.
- Puntos de mejora detectados: Falta de consideraciones para SEO, falta de soft-deletes para protección de la información, ausencia de un registro de auditoría de estados de comercios, y falta de funcionalidades transversales como recuperación de contraseñas.

**Modificaciones / Decisiones Tomadas:**
1. **Frontend:** Se cambia/recomienda cambiar React SPA puro por **Next.js** para permitir Server-Side Rendering (SSR) y mejorar drásticamente el posicionamiento local (SEO) de las vidrieras de los comerciantes.
2. **Modelo de Datos:**
   - Se añadió el campo `deletedAt` en los modelos `Comercio` y `Producto` para implementar borrado lógico (Soft Deletes).
   - Se añadió un array `historialEstados` en `Comercio` para mantener un log de auditoría municipal (quién aprueba/rechaza, cuándo y por qué).
3. **Casos de Uso Adicionales:** Se incluyeron flujos críticos transversales:
   - Recuperación de contraseña (CU-21).
   - Gestión básica de cuenta (CU-22).
   - Notificaciones transaccionales vía email (CU-23).
4. **Archivos creados:**
   - `Plan_Proyecto_Actualizado.md`: Contiene el plan robustecido en base al feedback.
   - `Bitacora_Proyecto.md` (este archivo): Para mantener el historial y orden del proyecto de aquí en adelante.
### [2026-09-06] - Fase: Etapa 0/1 - Setup del Backend

**Acciones realizadas:**
- Inicialización del proyecto Node.js en la carpeta ackend/.
- Instalación de dependencias core: express, mongoose, cors, dotenv, jsonwebtoken, bcryptjs, socket.io.
- Creación de la estructura base (directorios config, controllers, middlewares, models, routes, utils).
- Configuración inicial de variables de entorno (.env).
- Creación de src/config/db.js para la conexión a MongoDB.
- Creación de src/server.js implementando Express y un setup básico de Socket.IO para el futuro chat.

### [2026-09-06] - Fase: Etapa 1 - Modelos de Base de Datos

**Acciones realizadas:**
- Creación de todos los esquemas de Mongoose en ackend/src/models/.
- Se implementaron los 11 modelos principales: Rol, Usuario, PerfilComerciante, PerfilAdminMunicipal, PerfilCliente, Categoria, Comercio, Producto, Resena, Conversacion, Mensaje.
- Detalles de implementación aplicados según el rediseño:
  - Añadido el campo deletedAt (Soft Deletes) en Comercio, Producto y Resena.
  - Añadido el log de auditoría (historialEstados) como subesquema en Comercio.
  - Se configuró el índice 2dsphere en la ubicación de Comercio para las futuras búsquedas por cercanía.

### [2026-09-06] - Fase: Etapa 1 - Autenticación y Seguridad

**Acciones realizadas:**
- Implementación del controlador de autenticación (uthController.js) con las funciones egistrarUsuario (hashea contraseñas con bcrypt), loginUsuario (valida contraseñas y genera JWT) y getPerfil.
- Implementación de los middlewares de seguridad (uthMiddleware.js):
  - protegerRuta: Verifica el token JWT en las cabeceras HTTP.
  - equierePermiso(permiso): Función que implementa el RBAC dinámico verificando los roles del usuario contra la base de datos.
- Creación del enrutador de autenticación (uthRoutes.js).
- Modificación de server.js para montar las rutas en /api/auth.

### [2026-09-06] - Fase: Etapa 1 - Endpoints CRUD Base

**Acciones realizadas:**
- Creación de Controladores y Rutas para las entidades principales:
  - **Categorías:** ABM completo protegido por el permiso gestionar_categorias (Admin municipal). GET público.
  - **Comercios:** GET con paginación integrada. Filtro para omitir comercios borrados lógicamente (deletedAt) y no aprobados. Endpoint protegido para que el Admin cambie el estado y registre el motivo (Auditoría). Soft delete para el comerciante.
  - **Productos:** ABM para comerciantes. Filtros por comercioId y paginación incluída por defecto. Soft Delete implementado.
- Se montaron todas las rutas en server.js bajo /api/categorias, /api/comercios y /api/productos.

### [2026-09-06] - Fase: Etapa 2 - Inicialización del Frontend (Next.js)

**Acciones realizadas:**
- Configuración manual de un proyecto Next.js 14+ (App Router) en la carpeta rontend/ (debido a restricciones de permisos con 
px create-next-app en el sandbox local).
- Instalación de React, React-DOM, Next.js y dependencias de desarrollo de TypeScript y Tailwind CSS.
- Creación de archivos de configuración base: 	sconfig.json, 	ailwind.config.ts, postcss.config.mjs, 
ext.config.mjs.
- Creación de la estructura de rutas (App Router): src/app/layout.tsx (con fuente Inter), src/app/globals.css (con directivas de Tailwind) y src/app/page.tsx (con la landing page provisional del portal).
- Scripts de ejecución de Next (dev, uild, start) configurados en el package.json.

### [2026-09-06] - Fase: Etapa 2 - Autenticación en el Frontend

**Acciones realizadas:**
- Creación del cliente API nativo (fetch wrapper) en src/lib/api.ts para conectar con Express e inyectar el JWT automáticamente.
- Creación del Layout (src/app/(auth)/layout.tsx) con diseño Tailwind para unificar el aspecto de las pantallas de acceso.
- Creación de la pantalla de Login (src/app/(auth)/login/page.tsx) con formulario controlado, manejo de errores, y redirección inteligente (al backoffice o al panel) según los roles del JWT.
- Creación de la pantalla de Registro (src/app/(auth)/registro/page.tsx).

### [2026-09-06] - Fase: Etapa 2 - Backoffice Municipal

**Acciones realizadas:**
- Modificación del backend (comercioController.js y comercioRoutes.js) para exponer la ruta protegida GET /api/comercios/admin/all que permite a los administradores ver todos los comercios (incluyendo pendientes y rechazados) para moderación.
- Creación del Layout del Backoffice en el Frontend (src/app/backoffice/layout.tsx). Incorpora validación de seguridad frontend (redirección a /login si no tiene token o si su rol no es superadmin/moderador) y un navbar de navegación.
- Creación del Dashboard Municipal (src/app/backoffice/page.tsx). Consiste en una tabla reactiva que lista los comercios. Implementa los botones de "Aprobar", "Rechazar" y "Suspender", comunicándose con el endpoint de estados de la API.

### [2026-09-06] - Fase: Etapa 2 - Panel del Comerciante

**Acciones realizadas:**
- Modificación en el backend del controlador createComercio para vincular inteligentemente el comercio recién creado al documento PerfilComerciante del usuario que hace la petición.
- Creación del endpoint GET /api/comercios/me/mis-tiendas en el backend para listar únicamente los comercios de un usuario específico.
- Construcción en el Frontend del Layout del Panel del Comerciante (src/app/panel/layout.tsx) con diseño en tonos índigo, navbar propia y lógica de protección de rutas.
- Construcción del Dashboard del Comerciante (src/app/panel/page.tsx):
  - Formulario de solicitud de nueva vidriera (crea un Comercio en estado 'pendiente').
  - Grilla responsiva (CSS Grid + Tailwind) que muestra el estado en tiempo real (Pendiente, Aprobado, Rechazado) de las tiendas solicitadas.

### [2026-09-06] - Fase: Etapa 3 - Buscador Público

**Acciones realizadas:**
- Modificación del index (/page.tsx) para bifurcar visualmente el ingreso: Vecinos (Buscador) vs Comerciantes/Admin (Login).
- Construcción del portal público de búsqueda (src/app/buscar/page.tsx):
  - Integración con el endpoint público (GET /api/comercios) que trae **únicamente** los comercios aprobados.
  - Implementación de un buscador (input) que filtra en tiempo real los resultados obtenidos en base al nombre o descripción.
  - Diseño de tarjetas (cards) responsivas para mostrar cada comercio con su respectiva calificación promedio y botón hacia la vidriera interna.

### [2026-09-06] - Fase: Etapa 3 - Catálogos y Vidrieras Individuales

**Acciones realizadas:**
- Construcción de la **Gestión de Catálogo (Panel Comerciante)** (src/app/panel/comercio/[id]/page.tsx): 
  - Permite al comerciante dueño del comercio crear nuevos productos (definiendo precio y descripción) y eliminar los existentes (soft-delete).
  - La ruta se enlazó desde el botón "Gestionar Catálogo" en el dashboard de Mis Tiendas.
- Construcción de la **Vidriera Pública Individual** (src/app/comercio/[id]/page.tsx):
  - Diseño inmersivo (Hero Header azul municipal).
  - Muestra la información del local, su calificación y el catálogo completo de productos con sus respectivos precios listos para el cliente final.

### [2026-09-14] - Fase: Culminación de Etapas 3, 4, 5 y 6 (Entrega Completa del Sistema)

**Acciones realizadas:**
1. **Etapa 3 - Observatorio y Ranking de Precios + Mapas Geoespaciales:**
   - Backend:
     - Creación de endpoint `/api/productos/ranking` con cálculo de métricas estadísticas (mejor precio, precio promedio, ahorro potencial en $ y %).
     - Creación de endpoint geoespacial `/api/comercios/cercanos` con índice `2dsphere` y cálculo por coordenadas (`$near`).
   - Frontend:
     - Creación de página `/ranking` con tarjetas de KPI, filtros por término/categoría y comparador visual.
     - Creación de `/mapa` y componente interactivo `MapaComercios.tsx` integrando OpenStreetMap y Leaflet.
2. **Etapa 4 - Chat en Tiempo Real vía WebSockets (Socket.IO):**
   - Backend:
     - Módulo `src/sockets/chatSocket.js` implementando salas por conversación (`room_{id}`), guardado en MongoDB y emisión en vivo.
     - Endpoints REST en `/api/conversaciones` para historial, listado de chats y envío asíncrono.
   - Frontend:
     - Componente `ChatWidget.tsx` flotante en la vidriera individual (`/comercio/[id]`) conectado a Socket.IO.
     - Página de bandeja de entrada para comerciantes en `/panel/mensajes`.
3. **Etapa 5 - Calificaciones y Reseñas:**
   - Backend:
     - Controlador y rutas en `/api/resenas` con cálculo dinámico de `calificacionPromedio` y `cantidadResenas`.
     - Flujo de respuestas del comerciante y reporte de comentarios ofensivos.
     - Endpoints de moderación para administradores municipales.
   - Frontend:
     - Sección de opiniones con selector de estrellas (1-5) en la vidriera pública.
     - Pestaña de moderación de reseñas reportadas en `/backoffice`.
4. **Etapa 6 - Testing, Seed Completo y Documentación de Entrega:**
   - Script `seed.js` ejecutado exitosamente poblando roles, permisos, comercios geolocalizados en Bahía Blanca, productos comparables, reseñas y chats.
   - Script de prueba `test_endpoints.js` con 14 pruebas de integración pasadas con 100% de éxito.
   - Compilación exitosa de Next.js (`npm run build`) verificando todas las rutas estáticas y dinámicas.
   - Elaboración de `documentacion-de-entrega.md` exhaustivo y detallado para la presentación académica del Trabajo Final Integrador (TFI).

