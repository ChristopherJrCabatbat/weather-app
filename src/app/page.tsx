"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function Home() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch city suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (city.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`/api/geocode?city=${city}`);
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch city suggestions");
      }
    };

    const delay = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(delay);
  }, [city]);

  // Fetch weather based on coordinates
  const getWeatherByCoords = async (lat: number, lon: number) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);

      if (!res.ok) throw new Error("City not found or invalid response");

      const data = await res.json();
      setWeather(data);
      setSuggestions([]);
      toast.success(`Showing weather for ${data.name}`);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to fetch weather data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-700 to-indigo-900 text-white p-6 relative overflow-hidden">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-6 text-center"
      >
        🌤️ Weather App
      </motion.h1>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="w-full max-w-md flex flex-col gap-2 relative"
      >
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Search city..."
          className="p-3 rounded-xl bg-white text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
        />

        {/* Suggestion Dropdown */}
        {suggestions.length > 0 && (
          <ul className="absolute top-16 left-0 w-full bg-white text-gray-800 rounded-xl shadow-lg z-20">
            {suggestions.map((s, index) => (
              <li
                key={index}
                onClick={() => getWeatherByCoords(s.lat, s.lon)}
                className="p-3 hover:bg-gray-200 cursor-pointer rounded-lg"
              >
                {s.name}
                {s.state ? `, ${s.state}` : ""} ({s.country})
              </li>
            ))}
          </ul>
        )}
      </form>

      {/* Loading Spinner Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-14 h-14 border-4 border-white border-t-transparent rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weather Info */}
      {weather && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg w-full max-w-md text-center"
        >
          <h2 className="text-2xl font-semibold mb-2">
            {weather.name}, {weather.sys.country}
          </h2>
          <p className="text-lg capitalize">{weather.weather[0].description}</p>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt="Weather icon"
            className="mx-auto"
          />
          <p className="text-3xl font-bold">{Math.round(weather.main.temp)}°C</p>
          <p className="text-sm mt-2">
            Feels like {Math.round(weather.main.feels_like)}°C
          </p>
          <p className="text-sm mt-1">Humidity: {weather.main.humidity}%</p>
          <p className="text-sm">Wind: {weather.wind.speed} m/s</p>
        </motion.div>
      )}
    </main>
  );
}
