# Weather API Integration Guide

## Overview
The Daily Reports now support automatic weather loading for project locations. This is currently implemented as a placeholder function that can be connected to a real weather service.

## Supported Weather APIs

### Option 1: OpenWeatherMap (Recommended)
```javascript
const getWeatherForLocation = async (location) => {
  try {
    const apiKey = 'YOUR_API_KEY';
    
    // Step 1: Geocode the location
    const geoResponse = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`
    );
    const geoData = await geoResponse.json();
    
    if (geoData.length === 0) {
      throw new Error('Location not found');
    }
    
    const { lat, lon } = geoData[0];
    
    // Step 2: Get current weather
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const weatherData = await weatherResponse.json();
    
    return {
      condition: weatherData.weather[0].main,
      temperature: `${Math.round(weatherData.main.temp)}°C`
    };
  } catch (error) {
    console.error('Weather API error:', error);
    return null;
  }
};
```

### Option 2: WeatherAPI
```javascript
const getWeatherForLocation = async (location) => {
  try {
    const apiKey = 'YOUR_API_KEY';
    const response = await fetch(
      `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}`
    );
    const data = await response.json();
    
    return {
      condition: data.current.condition.text,
      temperature: `${Math.round(data.current.temp_c)}°C`
    };
  } catch (error) {
    console.error('Weather API error:', error);
    return null;
  }
};
```

## Integration Steps

1. **Choose a weather service** and obtain an API key
2. **Update the `getWeatherForLocation` function** in `DailyReports.js`
3. **Add your API key** to environment variables or Firebase config
4. **Test the integration** with real project locations

## Project Location Format

Ensure your projects in the database have a `location` field that can be geocoded:
- "Vancouver, BC, Canada"
- "123 Main St, Vancouver, BC"
- "49.2827, -123.1207" (lat/lng coordinates)

## Error Handling

The current implementation gracefully falls back to manual entry if:
- Weather API is unavailable
- Location cannot be geocoded
- API quota is exceeded
- Network errors occur

## Future Enhancements

- Cache weather data to reduce API calls
- Add weather forecasts for project planning
- Include more detailed conditions (humidity, wind, etc.)
- Support for multiple location formats
