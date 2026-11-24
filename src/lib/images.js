/**
 * Browser-side photo preparation.
 *
 * The file is decoded and re-encoded as a JPEG on the canvas, which does three
 * useful things: it proves the file really is an image, it strips metadata
 * (EXIF GPS, camera serials), and it keeps the upload small. The Worker still
 * sniffs the bytes again — this side is a convenience, not the guarantee.
 */

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 512 * 1024;

export class ImageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ImageError';
  }
}

function encode(bitmap, maxEdge, quality) {
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) throw new ImageError('This browser could not resize the photo.');
  context.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new ImageError('Could not convert the photo.'))),
      'image/jpeg',
      0.85,
    );
  });
}

/**
 * Validates a chosen file and returns a JPEG blob ready for upload, plus a
 * local preview URL the form can show immediately.
 */
export async function prepareImage(file) {
  if (!file) throw new ImageError('Choose a photo first.');
  if (!ACCEPTED.includes(file.type)) {
    throw new ImageError('Only JPEG, PNG or WebP photos work. PDF, SVG and other files are refused.');
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new ImageError('That photo is over 25 MB. Choose a smaller one.');
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new ImageError('That file could not be read as an image.');
  }

  try {
    const attempts = [
      [1600, 0.85],
      [1400, 0.8],
      [1200, 0.75],
      [1000, 0.7],
      [800, 0.62],
    ];

    for (const [maxEdge, quality] of attempts) {
      const blob = await encode(bitmap, maxEdge, quality);
      if (blob.size <= MAX_UPLOAD_BYTES) {
        return {
          blob,
          previewUrl: URL.createObjectURL(blob),
          width: Math.round(
            bitmap.width * Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height)),
          ),
          height: Math.round(
            bitmap.height * Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height)),
          ),
          name: file.name,
        };
      }
    }
  } finally {
    bitmap.close?.();
  }

  throw new ImageError('That photo could not be made small enough. Try another one.');
}
