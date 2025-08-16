import { NextResponse } from 'next/server';
import DataService from '@/lib/data-service';
import { headers } from 'next/headers';

export async function GET() {
    const headersList = await headers();
    const token = headersList.get('authorization');

    if (token) {
        const user = await DataService.getUserFromToken(token);
        if (user) {
            return NextResponse.json(user);
        }
    }
    return NextResponse.json(null, { status: 401 });
}
