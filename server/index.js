import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  fetchWeatherData,
  fetchForecastData,
  searchLocations,
} from "./services/weatherService.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware

const allowedOrigins = [
  "http://localhost:5173", // Vite local frontend
  "https://main.d3erp14kpzu5wp.amplifyapp.com/", // Amplify hosted frontend
  "https://weatherappication.maheshsivangi.tech",
];

// app.use(cors());

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // if you're using cookies or sessions
  })
);
app.use(express.json());

// Routes
app.get("/api/weather", async (req, res) => {
  try {
    const { lat, lon, city } = req.query;

    if ((!lat || !lon) && !city) {
      return res
        .status(400)
        .json({ error: "Either coordinates or city name is required" });
    }
    console.log(lat, lon, city);

    const weatherData = await fetchWeatherData({ lat, lon, city });
    res.json(weatherData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

app.get("/api/forecast", async (req, res) => {
  try {
    const { lat, lon, city } = req.query;

    if ((!lat || !lon) && !city) {
      return res
        .status(400)
        .json({ error: "Either coordinates or city name is required" });
    }

    const forecastData = await fetchForecastData({ lat, lon, city });
    res.json(forecastData);
  } catch (error) {
    console.error("Error fetching forecast data:", error);
    res.status(500).json({ error: "Failed to fetch forecast data" });
  }
});

app.get("/api/locations", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const locations = await searchLocations(query);
    res.json(locations);
  } catch (error) {
    console.error("Error searching locations:", error);
    res.status(500).json({ error: "Failed to search locations" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Weather API is running!");
});
