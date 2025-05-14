import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.WEATHER_API_KEY || 'YOUR_API_KEY'; // Replace with your actual API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

/**
 * Fetch current weather data
 * @param {Object} params - Request parameters
 * @returns {Promise<Object>} Weather data
 */
export const fetchWeatherData = async (params) => {
  try {
    let url = `${BASE_URL}/weather`;
    let queryParams = {};
    
    if (params.lat && params.lon) {
      queryParams = {
        lat: params.lat,
        lon: params.lon,
        appid: API_KEY,
        units: 'metric'
      };
    } else if (params.city) {
      queryParams = {
        q: params.city,
        appid: API_KEY,
        units: 'metric'
      };
    }
    
    const response = await axios.get(url, { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error in fetchWeatherData:', error);
    throw error;
  }
};

/**
 * Fetch 5-day forecast data
 * @param {Object} params - Request parameters
 * @returns {Promise<Object>} Forecast data
 */
export const fetchForecastData = async (params) => {
  try {
    let url = `${BASE_URL}/forecast`;
    let queryParams = {};
    
    if (params.lat && params.lon) {
      queryParams = {
        lat: params.lat,
        lon: params.lon,
        appid: API_KEY,
        units: 'metric'
      };
    } else if (params.city) {
      queryParams = {
        q: params.city,
        appid: API_KEY,
        units: 'metric'
      };
    }
    
    const response = await axios.get(url, { params: queryParams });
    
    // Process and group forecast data by day
    const forecastData = response.data;
    const dailyForecasts = processDailyForecasts(forecastData.list);
    
    return {
      ...forecastData,
      dailyForecasts
    };
  } catch (error) {
    console.error('Error in fetchForecastData:', error);
    throw error;
  }
};

/**
 * Search for locations by query
 * @param {string} query - Search query
 * @returns {Promise<Array>} List of locations
 */
export const searchLocations = async (query) => {
  try {
    const url = `${GEO_URL}/direct`;
    const params = {
      q: query,
      limit: 5,
      appid: API_KEY
    };
    
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Error in searchLocations:', error);
    throw error;
  }
};

/**
 * Process and group forecast data by day
 * @param {Array} forecastList - List of forecast data points
 * @returns {Array} Grouped daily forecasts
 */
const processDailyForecasts = (forecastList) => {
  const dailyMap = {};
  
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000);
    const day = date.toISOString().split('T')[0];
    
    if (!dailyMap[day]) {
      dailyMap[day] = {
        date: day,
        day: getDayName(date),
        temps: {
          min: item.main.temp_min,
          max: item.main.temp_max
        },
        weather: item.weather[0],
        humidity: item.main.humidity,
        wind: item.wind.speed,
        timePoints: []
      };
    } else {
      // Update min/max temps
      dailyMap[day].temps.min = Math.min(dailyMap[day].temps.min, item.main.temp_min);
      dailyMap[day].temps.max = Math.max(dailyMap[day].temps.max, item.main.temp_max);
    }
    
    // Add time point
    dailyMap[day].timePoints.push({
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      temp: item.main.temp,
      weather: item.weather[0]
    });
  });
  
  return Object.values(dailyMap);
};

/**
 * Get day name from date
 * @param {Date} date - Date object
 * @returns {string} Day name
 */
const getDayName = (date) => {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};