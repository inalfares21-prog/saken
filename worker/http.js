export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...(init.headers ?? {}),
    },
  });
}

export function badRequest(errors) {
  return json({ error: 'Some fields need attention', errors }, { status: 400 });
}

export function unauthorized() {
  return json({ error: 'Sign in required' }, { status: 401 });
}

export function notFound() {
  return json({ error: 'Not found' }, { status: 404 });
}

/** Reads a JSON body, returning null when it is missing or malformed. */
export async function readJson(request) {
  try {
    const body = await request.json();
    return body && typeof body === 'object' ? body : null;
  } catch {
    return null;
  }
}
