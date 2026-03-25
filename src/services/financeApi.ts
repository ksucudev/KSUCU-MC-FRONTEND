const BASE = '/api/finance';

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    throw new Error(error.message || `Request failed: ${response.status}`);
  }
  return response.json();
}

export const financeApi = {
  get: (path: string) =>
    fetch(`${BASE}${path}`, { credentials: 'include' }).then(handleResponse),

  post: (path: string, body?: any) =>
    fetch(`${BASE}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    }).then(handleResponse),

  postFormData: (path: string, formData: FormData) =>
    fetch(`${BASE}${path}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }).then(handleResponse),

  put: (path: string, body?: any) =>
    fetch(`${BASE}${path}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    }).then(handleResponse),

  putFormData: (path: string, formData: FormData) =>
    fetch(`${BASE}${path}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    }).then(handleResponse),

  delete: (path: string) =>
    fetch(`${BASE}${path}`, { method: 'DELETE', credentials: 'include' }).then(handleResponse),
};
