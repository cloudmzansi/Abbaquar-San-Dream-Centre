import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
  loading: boolean;
  error: string | null;
}

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 0,
    condition: '',
    humidity: 0,
    windSpeed: 0,
    location: '',
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        // Use a static location for demo purposes to avoid geolocation issues
        // This is set to Johannesburg, South Africa
        const latitude = -26.2041;
        const longitude = 28.0473;
        
        // Using WeatherAPI.com which has better CORS support
        const API_KEY = 'e5d3320c0d2046dabe211114251105'; // Updated API key for WeatherAPI.com
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${latitude},${longitude}&aqi=no`
        );
        
        if (!response.ok) {
          console.error('Weather API error:', await response.text());
          throw new Error(`Weather data fetch failed: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Weather data received:', data);
        
        setWeather({
          temperature: Math.round(data.current.temp_c),
          condition: data.current.condition.text,
          humidity: data.current.humidity,
          windSpeed: Math.round(data.current.wind_kph),
          location: data.location.name,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching weather:', error);
        setWeather(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to fetch weather data'
        }));
      }
    };

    fetchWeatherData();
  }, []);

  const getWeatherIcon = () => {
    switch (weather.condition.toLowerCase()) {
      case 'clear':
        return <Sun className="h-5 w-5 text-yellow-400" />;
      case 'clouds':
        return <Cloud className="h-5 w-5 text-gray-400" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="h-5 w-5 text-blue-400" />;
      default:
        return <Cloud className="h-5 w-5 text-gray-400" />;
    }
  };

  if (weather.loading) {
    return (
      <div className="flex items-center text-white/70">
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-r-2 border-[#4f7df9] mr-2"></div>
        <span>Loading...</span>
      </div>
    );
  }

  if (weather.error) {
    return (
      <div className="flex items-center text-white/70">
        <Cloud className="h-5 w-5 text-white/50 mr-2" />
        <span>Weather unavailable</span>
      </div>
    );
  }

  return (
    <div className="flex items-center text-white">
      <div className="mr-2">
        {getWeatherIcon()}
      </div>
      <span className="font-medium">{weather.temperature}°C</span>
      <span className="mx-1 text-white/50">|</span>
      <span className="text-white/70">{weather.condition}</span>
    </div>
  );
};

export default WeatherWidget;
