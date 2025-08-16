import { NextResponse } from "next/server";
import DataService from "@/lib/data-service";
import { Pin } from "@/lib/redux";

export async function POST(request: Request) {
  const pins: Pin[] = await request.json();
  await DataService.savePins(pins);
  return NextResponse.json({ success: true });
}
