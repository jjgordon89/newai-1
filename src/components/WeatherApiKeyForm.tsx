
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { setWeatherApiKey, isWeatherApiKeySet } from "@/lib/weatherService";

export function WeatherApiKeyForm() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Set the API key
      setWeatherApiKey(apiKey);
      
      toast({
        title: "API Key Saved",
        description: "Your OpenWeatherMap API key has been saved successfully.",
      });

      // Force a reload to apply changes
      window.location.reload();
    } catch (error) {
      console.error("Error saving API key:", error);
      toast({
        title: "Error",
        description: "Failed to save API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="weather-api-key">OpenWeatherMap API Key</Label>
        <Input
          id="weather-api-key"
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your OpenWeatherMap API key"
          className="cyber-input"
          required
        />
      </div>
      <div className="text-sm text-muted-foreground mb-4">
        <p>
          You need an OpenWeatherMap API key to enable weather queries.{" "}
          <a
            href="https://openweathermap.org/api"
            target="_blank"
            rel="noreferrer"
            className="text-cyber-primary hover:underline"
          >
            Get a free API key here
          </a>
          .
        </p>
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-cyber-primary hover:bg-cyber-primary/80"
      >
        {isLoading ? "Saving..." : "Save API Key"}
      </Button>
    </form>
  );
}
