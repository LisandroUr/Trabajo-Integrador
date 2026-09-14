# Vidriera Digital Municipal
## Plan de proyecto, modelo de datos y casos de uso (Revisión 1)

### 1. Descripción general
La aplicación conecta a emprendedores y PyMEs de la localidad con vecinos que buscan productos o servicios, a través de una "vidriera digital" personalizable. La municipalidad gestiona el alta y aprobación de los comercios desde un backoffice, mientras que los usuarios finales pueden buscar por categoría, comparar precios y calificaciones, ubicar el comercio en el mapa y chatear en tiempo real con el encargado.

**Actores del sistema**
*   **Municipalidad (admin):** da de alta y aprueba comercios, modera reseñas, gestiona categorías.
*   **Comerciante:** administra su vidriera digital, productos, precios y chat con clientes.
*   **Cliente/usuario final:** busca, compara, ubica en el mapa y contacta a los comercios.

### 2. Arquitectura
Arquitectura cliente-servidor con patrón MVC en el backend:

```text
[Next.js (SSR)]  <-- HTTP/REST -->  [Express API]  <-->  [MongoDB]
      |                                   |
      |<------ WebSocket (chat) --------->|
      |                                   |
      |<--- Mapa / Geolocalización ------>|
```

**Stack tecnológico (Actualizado)**
*   **Backend:** Node.js + Express, patrón MVC (models / controllers / routes / middlewares / sockets)
*   **Base de datos:** MongoDB + Mongoose
*   **Frontend:** Next.js (React) - *Recomendado sobre React SPA para soportar Server-Side Rendering (SSR) y optimizar el SEO de las vidrieras.*
*   **Tiempo real:** Socket.IO para el chat comercio-cliente
*   **Mapas:** Leaflet + OpenStreetMap (Evita costos de Google Maps)
*   **Almacenamiento de imágenes/banners:** Cloudinary o Amazon S3
*   **Notificaciones (Nuevo):** Integración con servicio de emails (SendGrid, Resend) para avisos transaccionales.

### 3. Plan de acción por etapas
*   **Etapa 0 – Preparación:** Wireframes, modelado definitivo, setup de repositorios.
*   **Etapa 1 – Backend base:** Auth JWT, CRUD base, endpoints backoffice municipal.
*   **Etapa 2 – Frontend base:** Login/registro, panel backoffice, panel vidriera.
*   **Etapa 3 – Búsqueda, ranking y mapa:** Buscador con filtros, algoritmo ranking, mapa con geolocalización. *(Nota: Implementar paginación desde el inicio).*
*   **Etapa 4 – Chat y Notificaciones:** Servidor Socket.IO, UI chat, notificaciones por email de mensajes no leídos.
*   **Etapa 5 – Reseñas y calificaciones.**
*   **Etapa 6 – Testing, pulido UX y deploy:** Deploy backend (Render/Railway), frontend (Vercel/Netlify), DB (MongoDB Atlas).

### 4. Modelo de datos (MongoDB / Mongoose)

**4.1 Usuario**
```javascript
{ 
  nombre: String, 
  email: String (único), 
  password: String (hasheado), 
  roles: [ObjectId] (ref Rol), 
  activo: Boolean, 
  fechaRegistro: Date 
}
```

**4.2 Rol**
```javascript
{ 
  nombre: String (único), 
  descripcion: String, 
  permisos: [String] 
}
```

**4.3 Perfiles** (Tres esquemas separados apuntando a Usuario)
*   `PerfilComerciante`: { usuarioId, cuit, razonSocial, comerciosIds, fechaAlta }
*   `PerfilAdminMunicipal`: { usuarioId, cargo, area, activo }
*   `PerfilCliente`: { usuarioId, comerciosFavoritos, direccionPredeterminada }

**4.4 Comercio (Actualizado)**
```javascript
{ 
  // ... (campos originales: nombre, descripción, categorías, dirección, ubicación 2dsphere, contacto, horarios, vidriera, calificación) ...
  estado: String, // 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido'
  // NUEVO: Historial de auditoría para el municipio
  historialEstados: [{
    estadoAnterior: String,
    nuevoEstado: String,
    fecha: Date,
    adminId: ObjectId (ref Usuario),
    motivo: String
  }],
  deletedAt: Date // NUEVO: Soft delete
}
```

**4.5 Producto (Actualizado)**
```javascript
{ 
  // ... (campos originales) ...
  deletedAt: Date // NUEVO: Soft delete para no perder métricas si un comercio lo borra
}
```

**4.6 Categoria, Resena, Conversacion, Mensaje** 
*(Se mantienen como en el plan original, separando Conversación de Mensajes para escalar)*

### 5. Casos de uso (Actualizados)

**5.1 Admin municipal**
*   **CU-01 a CU-06:** Alta/rechazo/suspensión de comercio, gestión de categorías, moderación de reseñas, métricas.

**5.2 Comerciante**
*   **CU-07 a CU-13:** Registro, editar vidriera, ABM productos, chat, estadísticas, responder reseñas.

**5.3 Cliente / usuario final**
*   **CU-14 a CU-20:** Buscar, mapa, ver vidriera, chat, dejar reseñas, favoritos.

**5.4 Transversales / Nuevos**
*   **CU-21 Recuperar contraseña:** Flujo de solicitud de reseteo, envío de token por email y cambio de clave.
*   **CU-22 Gestión de cuenta:** Editar datos básicos del perfil (nombre, email).
*   **CU-23 Notificaciones del sistema:** El sistema notifica al comerciante sobre la aprobación de su tienda o mensajes no leídos.

### 6. Notas de implementación
*   Índice `2dsphere` en Comercio para consultas geoespaciales eficientes.
*   Middleware de autorización dinámico basado en permisos (`requierePermiso('aprobar_comercio')`).
*   **Paginación:** Obligatoria en listados de comercios y productos (CU-14, CU-15).
*   **Soft Deletes:** Filtros globales en Mongoose para ignorar documentos con `deletedAt != null`.
