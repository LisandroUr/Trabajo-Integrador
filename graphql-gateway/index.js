const { ApolloServer, gql } = require('apollo-server');
const axios = require('axios');

// Definición del esquema GraphQL
// Conexión: API Gateway (GraphQL) -> Django y Node
// Consume: Django (comercios, categorías) y Node (productos)
// No desconectar sin revisar CONNECTIONS.md
const typeDefs = gql`
  type Ubicacion {
    type: String
    coordinates: [Float]
  }

  type Comercio {
    id: ID!
    nombre: String!
    descripcion: String
    estado: String
    calificacion_promedio: Float
    calificacionPromedio: Float
    cantidad_resenas: Int
    direccion: String
    ubicacion: Ubicacion
    rubro: Categoria
    categorias: [Categoria]
    logo: String
    productos: [Producto]
  }

  type Producto {
    _id: ID!
    nombre: String!
    descripcion: String
    precio: Float
    disponible: Boolean
  }

  type Categoria {
    id: ID!
    nombre: String!
    icono: String
  }

  type Query {
    comercioCompleto(id: ID!): Comercio
    comercios: [Comercio]
    categorias: [Categoria]
  }
`;

// URLs de los microservicios
const DJANGO_API = 'http://localhost:8000/api';
const NODE_API = 'http://localhost:5001/api';

// Resolvers para conectar los microservicios
const resolvers = {
  Query: {
    comercioCompleto: async (_, { id }) => {
      try {
        const response = await axios.get(`${DJANGO_API}/comercios/${id}/`);
        return response.data;
      } catch (error) {
        console.error("Error fetching from Django:", error.message);
        throw new Error("Comercio no encontrado");
      }
    },
    comercios: async () => {
      try {
        const response = await axios.get(`${DJANGO_API}/comercios/`);
        return response.data.results || response.data;
      } catch (error) {
        console.error("Error fetching comercios from Django:", error.message);
        throw new Error("Error obteniendo comercios");
      }
    },
    categorias: async () => {
      try {
        const response = await axios.get(`${DJANGO_API}/categorias/`);
        return response.data.results || response.data;
      } catch (error) {
        console.warn("Django /categorias no disponible, retornando arreglo vacío");
        return [];
      }
    }
  },
  Comercio: {
    // Cuando se pida el campo 'productos' dentro de un 'Comercio', buscamos en Node.js
    productos: async (comercio) => {
      try {
        const idComercio = comercio.id || comercio._id;
        const response = await axios.get(`${NODE_API}/productos?comercioId=${idComercio}`);
        return response.data.data;
      } catch (error) {
        console.error("Error fetching from Node:", error.message);
        return [];
      }
    },
    calificacionPromedio: (comercio) => comercio.calificacion_promedio || 0,
    direccion: (comercio) => comercio.direccion || "Sin dirección",
    ubicacion: (comercio) => comercio.ubicacion || null,
    // Django devuelve 'categorias' como array ManyToMany.
    // 'rubro' toma la primera categoría; 'categorias' pasa el array completo.
    rubro: (comercio) => {
      if (comercio.categorias && comercio.categorias.length > 0) {
        return comercio.categorias[0];
      }
      return null;
    },
    categorias: (comercio) => comercio.categorias || [],
    logo: (comercio) => {
      if (comercio.vidriera && comercio.vidriera.logo) return comercio.vidriera.logo;
      return "/placeholder.jpg";
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 GraphQL Gateway listo en ${url}`);
});
