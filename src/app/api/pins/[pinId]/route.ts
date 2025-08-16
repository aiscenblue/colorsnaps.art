import { NextResponse } from "next/server";
import DataService from "@/lib/data-service";

export async function GET(
  request: Request,
  { params }: { params: { pinId: string } },
) {
  const pin = await DataService.getPinById(params.pinId);
  if (pin) {
    return NextResponse.json(pin);
  }
  return NextResponse.json(
    { error: `Pin id ${params.pinId} not found` },
    { status: 404 },
  );
}

export async function PUT(request: Request) {
    const pin = await request.json();
    await DataService.updatePin(pin);
    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: { pinId: string } }) {
    await DataService.removePin(params.pinId);
    return NextResponse.json({ success: true });
}
