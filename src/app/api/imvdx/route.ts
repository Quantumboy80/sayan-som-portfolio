import { NextRequest, NextResponse } from 'next/server';
import { list, put, del } from '@vercel/blob';

export const dynamic = 'force-dynamic';

const FOLDER_PREFIX = 'imvdx/';

function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
  return password === adminPassword;
}

// GET — list all media files OR proxy a private blob file
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get('url');

  // If a file URL is provided, proxy the request to allow viewing private blobs
  if (fileUrl) {
    try {
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(fileUrl, { headers });
      if (!res.ok) {
        return new NextResponse('Failed to fetch media file', { status: res.status });
      }

      const contentType = res.headers.get('content-type') || 'application/octet-stream';
      return new NextResponse(res.body, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (err) {
      console.error('Media proxy error:', err);
      return new NextResponse('Media proxy error', { status: 500 });
    }
  }

  // Otherwise, list files
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const { blobs } = await list({
      prefix: FOLDER_PREFIX,
      token,
    });

    const files = blobs.map((blob) => ({
      // Use proxy URL so private blobs render correctly for public visitors
      url: `/api/imvdx?url=${encodeURIComponent(blob.downloadUrl || blob.url)}`,
      rawUrl: blob.url,
      filename: blob.pathname.replace(FOLDER_PREFIX, ''),
      uploadedAt: blob.uploadedAt,
      size: blob.size,
    }));

    return NextResponse.json({ files });
  } catch (err) {
    console.error('List error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ files: [], error: message });
  }
}

// POST — upload a file (auth required)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const password = formData.get('password') as string | null;

    if (!password || !verifyPassword(password)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Supported: images (jpg, png, gif, webp, svg) and videos (mp4, webm, mov).' },
        { status: 400 },
      );
    }

    // Check token exists
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN is not configured on the server.' }, { status: 500 });
    }

    // Max 100MB
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 100MB.' }, { status: 400 });
    }

    const blob = await put(`${FOLDER_PREFIX}${file.name}`, file, {
      access: 'private',
      addRandomSuffix: true,
    });

    return NextResponse.json({
      url: blob.url,
      filename: blob.pathname.replace(FOLDER_PREFIX, ''),
      uploadedAt: new Date().toISOString(),
      size: file.size,
    });
  } catch (err) {
    console.error('Upload error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Upload failed: ${message}` }, { status: 500 });
  }
}

// DELETE — remove a file (auth required)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, password } = body;

    if (!password || !verifyPassword(password)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    let targetUrl = url;
    if (url.includes('/api/imvdx?url=')) {
      targetUrl = decodeURIComponent(url.split('/api/imvdx?url=')[1]);
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    await del(targetUrl, { token });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Delete failed: ${message}` }, { status: 500 });
  }
}
