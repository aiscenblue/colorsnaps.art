import { NextResponse } from 'next/server';
import DataService from '@/lib/data-service';

export async function DELETE(request: Request, { params }: { params: { pinId: string } }) {
    await DataService.removePin(params.pinId);
    return NextResponse.json({ success: true });
}
