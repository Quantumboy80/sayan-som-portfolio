import { NextRequest, NextResponse } from 'next/server';
import { list, put, del } from '@vercel/blob';

export const dynamic = 'force-dynamic';

const FOLDER_PREFIX = 'imvdx/';

function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
  return password === adminPassword;
}

// GET — list all media files
export async function GET() {
  try {
    const { blobs } = await list({ prefix: FOLDER_PREFIX });

    const files = blobs.map((blob) => ({
      url: blob.url,
      filename: blob.pathname.replace(FOLDER_PREFIX, ''),
      uploadedAt: blob.uploadedAt,
      size: blob.size,
    }));

    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ files: [] });
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

    // Max 100MB
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 100MB.' }, { status: 400 });
    }

    const blob = await put(`${FOLDER_PREFIX}${file.name}`, file, {
      access: 'public',
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
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
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

    await del(url);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
