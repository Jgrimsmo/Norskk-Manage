import { useState, useEffect } from 'react';

/**
 * Custom hook for weather integration functionality
 * Handles automatic weather loading based on project location
 */
export const useWeatherIntegration = () => {
  const [weatherLoading, setWeatherLoading] = useState(false);

  const getWeatherForLocation = async (location) => {
    try {
      // This is a placeholder - you would implement actual weather API integration here
      // For now, return mock data to demonstrate the feature
      
      // You could use services like:
      // - OpenWeatherMap API
      // - WeatherAPI
      // - AccuWeather API
      
      // Mock weather data for demonstration
      const mockWeatherData = {
        condition: 'Partly Cloudy',
        temperature: '18°C'
      };
      
      // In a real implementation, you would:
      // 1. Geocode the location to get coordinates
      // 2. Call weather API with coordinates
      // 3. Parse and return weather data
      
      return mockWeatherData;
    } catch (error) {
      console.error("Weather API error:", error);
      return null;
    }
  };

  const loadWeatherForProject = async (projectName, projects, setForm) => {
    try {
      setWeatherLoading(true);
      const project = projects.find(p => p.name === projectName);
      
      if (project && project.location) {
        // Try to get weather data for the project location
        const weather = await getWeatherForLocation(project.location);
        if (weather) {
          setForm(f => ({
            ...f,
            weather: weather.condition,
            temperature: weather.temperature
          }));
        }
      }
    } catch (error) {
      console.error("Error loading weather:", error);
      // Don't update the form if weather loading fails
    } finally {
      setWeatherLoading(false);
    }
  };

  return {
    weatherLoading,
    loadWeatherForProject,
    getWeatherForLocation
  };
};
