import { NextResponse } from 'next/server';
import DataService from '@/lib/data-service';

export async function PUT(request: Request) {
    const pin = await request.json();
    await DataService.updatePin(pin);
    return NextResponse.json({ success: true });
}
