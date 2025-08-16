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
  return NextResponse.json({ error: "Pin not found" }, { status: 404 });
}
