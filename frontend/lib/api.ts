export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // We use the proxy configured in next.config.ts, so we just hit /api/*
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If unauthorized, clear token and maybe redirect to login
  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  return response;
}
