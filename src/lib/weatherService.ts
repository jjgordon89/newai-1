
// Weather API Integration using OpenWeatherMap
// You'll need to get your own API key from https://openweathermap.org/api

// Store API key in localStorage - for production, use Supabase Secrets or another secure method
let WEATHER_API_KEY = localStorage.getItem('weather_api_key') || '';

export const setWeatherApiKey = (key: string) => {
  WEATHER_API_KEY = key;
  localStorage.setItem('weather_api_key', key);
  return WEATHER_API_KEY;
};

export const getWeatherApiKey = () => WEATHER_API_KEY;

export const isWeatherApiKeySet = () => {
  return !!WEATHER_API_KEY && WEATHER_API_KEY.length > 0;
};

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  forecast?: {
    date: string;
    temperature: {
      min: number;
      max: number;
    };
    condition: string;
    icon: string;
  }[];
}

export const getWeatherData = async (
  location: string,
  units: 'metric' | 'imperial' = 'metric'
): Promise<WeatherData> => {
  if (!isWeatherApiKeySet()) {
    throw new Error('Weather API key not set');
  }

  try {
    // Get current weather
    const currentWeatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        location
      )}&units=${units}&appid=${WEATHER_API_KEY}`
    );

    if (!currentWeatherResponse.ok) {
      throw new Error(`Weather API error: ${currentWeatherResponse.statusText}`);
    }

    const currentWeatherData = await currentWeatherResponse.json();

    // Get 5-day forecast (optional)
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
        location
      )}&units=${units}&appid=${WEATHER_API_KEY}&cnt=5`
    );

    let forecast = undefined;

    if (forecastResponse.ok) {
      const forecastData = await forecastResponse.json();
      forecast = forecastData.list.map((item: any) => ({
        date: new Date(item.dt * 1000).toLocaleDateString(),
        temperature: {
          min: item.main.temp_min,
          max: item.main.temp_max,
        },
        condition: item.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
      }));
    }

    return {
      location: currentWeatherData.name,
      temperature: currentWeatherData.main.temp,
      condition: currentWeatherData.weather[0].description,
      humidity: currentWeatherData.main.humidity,
      windSpeed: currentWeatherData.wind.speed,
      icon: `https://openweathermap.org/img/wn/${currentWeatherData.weather[0].icon}@2x.png`,
      forecast,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};
