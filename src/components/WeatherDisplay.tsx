import { WeatherData } from "@/lib/weatherService";
import { Card } from "./ui/card";
import { CloudRain, Thermometer, Wind, Droplet } from "lucide-react";

interface WeatherDisplayProps {
  data: WeatherData;
  className?: string;
}

export function WeatherDisplay({ data, className }: WeatherDisplayProps) {
  const tempUnit = "°C";
  const windUnit = "m/s";

  return (
    <Card
      className={`overflow-hidden bg-card/80 backdrop-blur-md relative ${className || ""}`}
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{data.location}</h3>
            <p className="text-muted-foreground text-sm capitalize">
              {data.condition}
            </p>
          </div>
          <img src={data.icon} alt={data.condition} className="h-14 w-14" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-cyber-primary" />
            <span className="text-sm">
              {data.temperature} {tempUnit}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Droplet className="h-4 w-4 text-cyber-primary" />
            <span className="text-sm">{data.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-cyber-primary" />
            <span className="text-sm">
              {data.windSpeed} {windUnit}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-cyber-primary" />
            <span className="text-sm capitalize">{data.condition}</span>
          </div>
        </div>

        {data.forecast && (
          <div className="border-t pt-3 mt-3">
            <h4 className="text-sm font-medium mb-2">5-Day Forecast</h4>
            <div className="flex overflow-x-auto pb-2 gap-2">
              {data.forecast.map((day, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center min-w-[60px]"
                >
                  <span className="text-xs text-muted-foreground">
                    {day.date}
                  </span>
                  <img
                    src={day.icon}
                    alt={day.condition}
                    className="h-8 w-8 my-1"
                  />
                  <span className="text-xs">{day.temperature.max}°</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
