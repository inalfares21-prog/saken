/**
 * Photo uploads.
 *
 * Listing photos are small (the browser re-encodes them to JPEG before they
 * leave the page) and the site currently has a handful of listings, so the
 * bytes live in D1 next to everything else. R2 is the upgrade path once
 * volume matters — the route and the payload shape would not change.
 *
 * Security rules, all enforced here rather than in the browser:
 *  - only JPEG, PNG and WebP, decided by sniffing the actual file signature;
 *  - the declared Content-Type must be one of those three as well;
 *  - the file must look complete (JPEG end marker, PNG IEND, WebP RIFF size);
 *  - a hard byte cap, so nothing large can be parked in the database;
 *  - a per-account daily cap, so an account cannot fill the database;
 *  - images are served from their own route with a fixed Content-Type,
 *    `X-Content-Type-Options: nosniff` and a sandboxing CSP, which is what
 *    stops an uploaded file from ever being interpreted as HTML or script.
 */

export const MAX_IMAGE_BYTES = 512 * 1024;
const MAX_UPLOADS_PER_DAY = 40;

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const JPEG_START = [0xff, 0xd8, 0xff];
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** Returns the real image type of the bytes, or null if it is not an image. */
export function sniffImage(bytes) {
  if (!bytes || bytes.length < 32) return null;

  if (JPEG_START.every((value, index) => bytes[index] === value)) {
    // A complete JPEG ends with FFD9. Truncated files are refused because they
    // are usually a failed upload or a file that was never an image.
    if (bytes[bytes.length - 2] !== 0xff || bytes[bytes.length - 1] !== 0xd9) return null;
    return 'image/jpeg';
  }

  if (PNG_SIGNATURE.every((value, index) => bytes[index] === value)) {
    // Every PNG stream ends with the IEND chunk type at offset length-8.
    const end = bytes.length - 8;
    if (
      bytes[end] !== 0x49 ||
      bytes[end + 1] !== 0x45 ||
      bytes[end + 2] !== 0x4e ||
      bytes[end + 3] !== 0x44
    ) {
      return null;
    }
    return 'image/png';
  }

  const riff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  const webp = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
  if (riff === 'RIFF' && webp === 'WEBP') {
    const declared =
      bytes[4] | (bytes[5] << 8) | (bytes[6] << 16) | ((bytes[7] << 24) >>> 0);
    // RIFF sizes exclude the 8-byte header; some encoders pad to an even length.
    const expected = bytes.length - 8;
    if (declared !== expected && declared !== expected - 1) return null;
    return 'image/webp';
  }

  return null;
}

/** D1 hands BLOB columns back in more than one shape depending on runtime. */
export function toBytes(value) {
  if (!value) return null;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }
  if (Array.isArray(value)) return new Uint8Array(value);
  return null;
}

/**
 * Validates and stores one image. The caller has already checked the session
 * and the request Origin.
 */
export async function saveImage(env, request, userId) {
  const declared = (request.headers.get('Content-Type') || '')
    .split(';')[0]
    .trim()
    .toLowerCase();

  if (!ACCEPTED_IMAGE_TYPES.includes(declared)) {
    return {
      ok: false,
      status: 415,
      error: 'Only JPEG, PNG or WebP photos can be uploaded.',
    };
  }

  const buffer = await request.arrayBuffer();
  if (buffer.byteLength === 0) {
    return { ok: false, status: 400, error: 'That file is empty.' };
  }
  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      status: 413,
      error: `Photos must be under ${Math.round(MAX_IMAGE_BYTES / 1024)} KB after resizing.`,
    };
  }

  const bytes = new Uint8Array(buffer);
  const mime = sniffImage(bytes);
  if (!mime) {
    return {
      ok: false,
      status: 415,
      error: 'That file is not a complete JPEG, PNG or WebP image.',
    };
  }

  const recent = await env.DB.prepare(
    "SELECT COUNT(*) AS count FROM uploads WHERE owner_id = ? AND created_at > datetime('now', '-1 day')",
  )
    .bind(userId)
    .first();

  if ((recent?.count ?? 0) >= MAX_UPLOADS_PER_DAY) {
    return {
      ok: false,
      status: 429,
      error: 'You have uploaded a lot of photos today. Try again tomorrow.',
    };
  }

  const id = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO uploads (id, owner_id, mime, size, bytes) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(id, userId, mime, bytes.byteLength, bytes)
    .run();

  return {
    ok: true,
    image: { url: `/api/images/${id}`, mime, size: bytes.byteLength },
  };
}

/** Serves one stored photo, or null when the id is malformed or unknown. */
export async function serveImage(env, id) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return null;
  }

  const row = await env.DB.prepare('SELECT mime, bytes FROM uploads WHERE id = ?')
    .bind(id)
    .first();
  if (!row) return null;

  const bytes = toBytes(row.bytes);
  if (!bytes) return null;

  return new Response(bytes, {
    headers: {
      'Content-Type': row.mime,
      'Content-Length': String(bytes.byteLength),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': `inline; filename="${id}"`,
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
}

/** True when the photo belongs to this account, so listings cannot borrow one. */
export async function ownsImage(env, userId, imagePath) {
  const prefix = '/api/images/';
  if (!imagePath.startsWith(prefix)) return true;
  const id = imagePath.slice(prefix.length);
  const row = await env.DB.prepare('SELECT owner_id FROM uploads WHERE id = ?')
    .bind(id)
    .first();
  return Boolean(row && row.owner_id === userId);
}
