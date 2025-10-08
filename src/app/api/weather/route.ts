import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  const apiKey = process.env.OPENWEATHER_API_KEY;

  let apiUrl = "";

  if (lat && lon) {
    // ✅ if coordinates are provided, use them
    apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  } else if (city) {
    // ✅ fallback: use city name
    apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  } else {
    return NextResponse.json({ error: "City or coordinates required" }, { status: 400 });
  }

  const res = await fetch(apiUrl);

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 400 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
