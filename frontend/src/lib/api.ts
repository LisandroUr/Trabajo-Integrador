const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

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
