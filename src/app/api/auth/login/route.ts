import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { password } = body;

    const adminPassword = process.env.ADMIN_PASSWORD || 'admin'; // Default password if not set

    if (password === adminPassword) {
        return NextResponse.json({ success: true });
    } else {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
}
