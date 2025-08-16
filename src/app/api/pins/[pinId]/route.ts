import { NextResponse } from "next/server";
import DataService from "@/lib/data-service";

export async function GET(
  request: Request,
  context: { params: Promise<{ pinId: string }> },
) {
  const params = await context.params;
  const pin = await DataService.getPinById(params.pinId);
  if (pin) {
    return NextResponse.json(pin);
  }
  return NextResponse.json({ error: "Pin not found" }, { status: 404 });
}
