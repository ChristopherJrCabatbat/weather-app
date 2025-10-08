import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");

  if (!city) {
    return NextResponse.json({ error: "City name is required" }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`;

  const res = await fetch(geoUrl);
  const data = await res.json();

  return NextResponse.json(data);
}
