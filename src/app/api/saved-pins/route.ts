import { NextResponse } from 'next/server';
import DataService from '@/lib/data-service';
import { headers } from 'next/headers';

export async function GET() {
    const headersList = await headers();
    const token = headersList.get('authorization');

    if (token) {
        const user = await DataService.getUserFromToken(token);
        if (user) {
            const savedPins = await DataService.getSavedPinIds(user.id);
            return NextResponse.json(Array.from(savedPins));
        }
    }
    return NextResponse.json([], { status: 401 });
}

export async function POST(request: Request) {
    const headersList = await headers();
    const token = headersList.get('authorization');
    const savedIds: string[] = await request.json();

    if (token) {
        const user = await DataService.getUserFromToken(token);
        if (user) {
            await DataService.saveSavedPinIds(user.id, savedIds);
            return NextResponse.json({ success: true });
        }
    }
    return NextResponse.json({ success: false }, { status: 401 });
}
