import { NextRequest, NextResponse } from "next/server";
import { mapNominatimHitToIndianAddress } from "@/lib/nominatim-address";
import type { NominatimSearchHit } from "@/lib/nominatim-address";

const NOMINATIM_USER_AGENT = "LittleGeniusLAB/1.0 (contact@littlegeniuslab.in)";

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat")?.trim();
  const lon = request.nextUrl.searchParams.get("lon")?.trim();

  if (!lat || !lon) {
    return NextResponse.json({ error: "Latitude and longitude are required." }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lon);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("zoom", "18");

  try {
    const upstream = await fetch(url.toString(), {
      headers: {
        "User-Agent": NOMINATIM_USER_AGENT,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "Geocoding service unavailable." }, { status: 502 });
    }

    const data = (await upstream.json()) as NominatimSearchHit;
    return NextResponse.json(mapNominatimHitToIndianAddress(data));
  } catch {
    return NextResponse.json({ error: "Could not reach geocoding service." }, { status: 502 });
  }
}
