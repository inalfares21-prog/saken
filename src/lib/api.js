/**
 * Thin client for the Saken Worker. Every call is same-origin: Vite proxies
 * /api to `wrangler dev` locally, and the deployed Worker serves both the
 * static bundle and the API.
 */

export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let response;
  try {
    response = await fetch(path, {
      method,
      credentials: 'same-origin',
      headers: {
        accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new ApiError('Could not reach the Saken server.', 0);
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      data?.error || `Request failed (${response.status}).`,
      response.status,
      data?.errors ?? {},
    );
  }

  return data ?? {};
}

function query(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });
  const text = search.toString();
  return text ? `?${text}` : '';
}

/** Sign-in starts on the Worker, which owns the OIDC dance and the cookie. */
export function signInUrl(returnTo) {
  const target = returnTo || `${window.location.pathname}${window.location.search}`;
  return `/auth/freebuff/signin?returnTo=${encodeURIComponent(target)}`;
}

export const api = {
  listings(params, signal) {
    return request(`/api/listings${query(params)}`, { signal }).then((data) => data.listings ?? []);
  },

  listing(id, signal) {
    return request(`/api/listings/${encodeURIComponent(id)}`, { signal });
  },

  /** Returns the stored profile, or null when nobody is signed in. */
  async me() {
    try {
      const data = await request('/api/me');
      return data.user ?? null;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    }
  },

  setRole(role) {
    return request('/api/me', { method: 'PATCH', body: { role } }).then((data) => data.user);
  },

  myListings() {
    return request('/api/me/listings');
  },

  myEnquiries() {
    return request('/api/me/enquiries').then((data) => data.enquiries ?? []);
  },

  createListing(payload) {
    return request('/api/listings', { method: 'POST', body: payload }).then((data) => data.listing);
  },

  sendEnquiry(payload) {
    return request('/api/enquiries', { method: 'POST', body: payload });
  },
};
