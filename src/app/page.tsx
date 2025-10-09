"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function Home() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tick, setTick] = useState(0);

  /** Fetch city suggestions */
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (city.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(
          `/api/geocode?city=${encodeURIComponent(city)}`
        );
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

  /** Fetch weather by coordinates */
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

  /** Get user's current location */
  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await getWeatherByCoords(latitude, longitude);
      },
      (error) => {
        console.error(error);
        toast.error("Failed to get your location");
        setIsLoading(false);
      }
    );
  };

  /** Update time every minute */
  useEffect(() => {
    if (!weather) return;
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, [weather]);

  /** Format local time */
  const formatLocalTime = (tzSeconds: number) => {
    const targetMs = Date.now() + tzSeconds * 1000;
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(targetMs));
  };

  /** Background color logic */
  const getWeatherBackground = (main: string | undefined) => {
    switch (main?.toLowerCase()) {
      case "clear":
        return "from-yellow-400 via-orange-500 to-pink-500"; // sunny
      case "clouds":
        return "from-gray-500 via-gray-600 to-gray-700"; // cloudy
      case "rain":
      case "drizzle":
        return "from-blue-700 via-blue-800 to-gray-900"; // rainy
      case "thunderstorm":
        return "from-gray-800 via-gray-900 to-black"; // thunderstorm
      case "snow":
        return "from-blue-200 via-cyan-200 to-white"; // snowy
      default:
        return "from-indigo-600 via-blue-700 to-indigo-900"; // default
    }
  };

  const currentBg = getWeatherBackground(weather?.weather?.[0]?.main);
  const condition = weather?.weather?.[0]?.main?.toLowerCase();

  /** Weather animation layers */
  const WeatherAnimation = () => {
    switch (condition) {
      case "clear":
        return (
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            style={{
              background:
                "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.3) 0%, transparent 70%)",
            }}
          />
        );

      case "clouds":
        return (
          <motion.div
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 2 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-white/20 rounded-full blur-3xl"
                style={{
                  top: `${Math.random() * 80}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${150 + Math.random() * 150}px`,
                  height: `${80 + Math.random() * 80}px`,
                }}
                animate={{
                  x: ["0%", "20%", "-10%", "0%"],
                }}
                transition={{
                  duration: 30 + Math.random() * 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </motion.div>
        );

      case "rain":
      case "drizzle":
        return (
          <motion.div className="absolute inset-0 overflow-hidden">
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-0.5 h-6 bg-white/50 rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{ y: ["-10%", "110%"] }}
                transition={{
                  duration: 1 + Math.random() * 0.5,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 1,
                }}
              />
            ))}
          </motion.div>
        );

      case "snow":
        return (
          <motion.div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full opacity-70"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: ["-5%", "105%"],
                  x: ["0%", "10%", "-5%", "0%"],
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </motion.div>
        );

      case "thunderstorm":
        return (
          <>
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: [0, 0.7, 0] }}
              transition={{
                repeat: Infinity,
                duration: 3,
                repeatDelay: 4,
                ease: "easeInOut",
              }}
              style={{ background: "rgba(255,255,255,0.6)" }}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden text-white p-6">
      {/* Animated Gradient */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBg}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className={`absolute inset-0 bg-gradient-to-b ${currentBg} transition-all`}
        />
      </AnimatePresence>

      {/* Animated Weather Layer */}
      {weather && <WeatherAnimation />}

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-6 text-center relative z-10 drop-shadow-lg"
      >
        🌤️ Weather App
      </motion.h1>

      {/* Search Input and Suggestions Container */}
      <div className="relative w-full max-w-md z-20">
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search city..."
            className="p-3 w-full rounded-xl bg-white text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          />
        </form>

        {/* Suggestions directly below input */}
        {suggestions.length > 0 && (
          <ul className="absolute top-full left-0 w-full mt-2 bg-white text-gray-800 rounded-xl shadow-lg z-[9999] overflow-hidden">
            {suggestions.map((s, index) => (
              <li
                key={index}
                onClick={() => getWeatherByCoords(s.lat, s.lon)}
                className="p-3 hover:bg-gray-200 cursor-pointer transition-colors"
              >
                {s.name}
                {s.state ? `, ${s.state}` : ""} ({s.country})
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={getUserLocation}
        className="mt-4 bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl font-semibold transition-colors z-10"
      >
        📍 Use My Location
      </button>

      {/* Loading Spinner */}
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
          className="mt-8 bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg w-full max-w-md text-center relative z-10"
        >
          <h2 className="text-2xl font-semibold mb-2 flex items-center justify-center gap-2">
            {weather.name}, {weather.sys.country}
            <img
              src={`https://flagcdn.com/24x18/${weather.sys.country.toLowerCase()}.png`}
              alt={`${weather.sys.country} flag`}
              className="w-6 h-4 rounded-sm shadow"
            />
          </h2>

          <p className="text-lg capitalize">{weather.weather[0].description}</p>

          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt="Weather icon"
            className={`mx-auto ${
              ["clouds", "rain", "thunderstorm"].includes(
                weather.weather[0].main.toLowerCase()
              )
                ? "brightness-150"
                : "brightness-100"
            } drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]`}
          />

          <p className="text-3xl font-bold">
            {Math.round(weather.main.temp)}°C
          </p>
          <p className="text-sm mt-2">
            Feels like {Math.round(weather.main.feels_like)}°C
          </p>
          <p className="text-sm mt-1">Humidity: {weather.main.humidity}%</p>
          <p className="text-sm">Wind: {weather.wind.speed} m/s</p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-4 text-sm opacity-90"
          >
            🕒 Local Time: {formatLocalTime(weather.timezone)}
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}
