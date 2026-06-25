import { getContent, saveContent } from '@/lib/content';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> },
) {
    const { filename } = await params;
    try {
        const content = await getContent(filename);
        return NextResponse.json(content);
    } catch (error) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> },
) {
    const { filename } = await params;
    try {
        const body = await request.json();
        await saveContent(filename, body);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error saving file' }, { status: 500 });
    }
}
