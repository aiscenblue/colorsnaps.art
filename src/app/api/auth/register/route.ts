import { NextResponse } from 'next/server';
import DataService from '@/lib/data-service';

export async function POST(request: Request) {
    const { username, email, password } = await request.json();
    const result = await DataService.register(username, email, password);
    return NextResponse.json(result);
}
