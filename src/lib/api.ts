/** API configuration — used by all frontend components to call the backend. */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.hermes.waas.host';

export const api = {
  baseUrl: API_BASE_URL,

  /** Build full API URL for a given path */
  url(path: string): string {
    return `${API_BASE_URL}${path}`;
  },

  /** Default headers for JSON requests */
  headers(token?: string): HeadersInit {
    const h: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  },

  /** Fetch wrapper with auth and error handling */
  async fetch<T = unknown>(path: string, options: RequestInit & { token?: string } = {}): Promise<T> {
    const { token, ...fetchOpts } = options;
    const res = await fetch(api.url(path), {
      ...fetchOpts,
      headers: {
        ...api.headers(token),
        ...(fetchOpts.headers || {}),
      },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(body.message || `API error ${res.status}`);
    }
    return res.json();
  },
};

export default api;
