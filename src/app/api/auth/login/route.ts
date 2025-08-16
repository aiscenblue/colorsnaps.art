import { NextResponse } from 'next/server';
import DataService from '@/lib/data-service';

export async function POST(request: Request) {
    const { identifier, password } = await request.json();
    const result = await DataService.login(identifier, password);
    return NextResponse.json(result);
}
