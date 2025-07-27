import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar
} from '@mui/material';
import {
  WbSunny as SunnyIcon,
  Cloud as CloudyIcon,
  Grain as RainyIcon,
  AcUnit as SnowyIcon,
  Visibility as FoggyIcon
} from '@mui/icons-material';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity?: number;
  windSpeed?: number;
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
  }>;
}

interface WeatherWidgetProps {
  data: WeatherData;
  settings: Record<string, any>;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ data, settings }) => {
  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
      return <SunnyIcon />;
    }
    if (lowerCondition.includes('rain') || lowerCondition.includes('storm')) {
      return <RainyIcon />;
    }
    if (lowerCondition.includes('snow')) {
      return <SnowyIcon />;
    }
    if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) {
      return <FoggyIcon />;
    }
    return <CloudyIcon />;
  };

  const getWeatherColor = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
      return 'warning';
    }
    if (lowerCondition.includes('rain') || lowerCondition.includes('storm')) {
      return 'info';
    }
    if (lowerCondition.includes('snow')) {
      return 'primary';
    }
    return 'default';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Weather
      </Typography>

      <Card>
        <CardContent>
          {/* Current Weather */}
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar 
              sx={{ 
                bgcolor: `${getWeatherColor(data.condition)}.main`, 
                width: 48, 
                height: 48,
                mr: 2
              }}
            >
              {getWeatherIcon(data.condition)}
            </Avatar>
            <Box>
              <Typography variant="h4">
                {data.temperature}°F
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.condition}
              </Typography>
            </Box>
          </Box>

          {/* Additional Details */}
          {(data.humidity || data.windSpeed) && (
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {data.humidity && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Humidity
                  </Typography>
                  <Typography variant="body2">
                    {data.humidity}%
                  </Typography>
                </Grid>
              )}
              {data.windSpeed && (
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Wind Speed
                  </Typography>
                  <Typography variant="body2">
                    {data.windSpeed} mph
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}

          {/* Forecast */}
          {data.forecast && data.forecast.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                3-Day Forecast
              </Typography>
              {data.forecast.slice(0, 3).map((day, index) => (
                <Box 
                  key={index}
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center"
                  py={0.5}
                >
                  <Box display="flex" alignItems="center">
                    <Avatar 
                      sx={{ 
                        bgcolor: `${getWeatherColor(day.condition)}.main`, 
                        width: 24, 
                        height: 24,
                        mr: 1
                      }}
                    >
                      {getWeatherIcon(day.condition)}
                    </Avatar>
                    <Typography variant="body2">
                      {day.day}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {day.high}° / {day.low}°
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default WeatherWidget;