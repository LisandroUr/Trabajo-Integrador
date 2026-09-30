const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const AUTH_URL = 'http://localhost:8000/api'; // Django para autenticación

export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    cache: 'no-store',
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({ error: 'Respuesta inválida del servidor' }));

  if (!response.ok) {
    throw new Error(data.error || 'Ocurrió un error en la petición');
  }

  return data;
};

export const fetchDjangoAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${AUTH_URL}${endpoint}`, {
    cache: 'no-store',
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({ error: 'Respuesta inválida del servidor Django' }));

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?expired=1';
    }
    throw new Error('Tu sesión ha expirado, por favor inicia sesión nuevamente.');
  }

  if (!response.ok) {
    throw new Error(data.error || data.detail || 'Ocurrió un error en el servidor transaccional');
  }

  return data;
};

export const fetchGraphQL = async (query: string, variables = {}) => {
  const response = await fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store'
  });
  const data = await response.json();
  if (data.errors) throw new Error(data.errors[0].message || 'Error en GraphQL');
  return data.data;
};
