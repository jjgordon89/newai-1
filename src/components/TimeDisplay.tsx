import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock } from "lucide-react";

interface TimeDisplayProps {
  data: {
    time: string;
    date: string;
    day: string;
    timestamp: number;
    formatted: string;
  };
}

export function TimeDisplay({ data }: TimeDisplayProps) {
  const defaultData = {
    time: new Date().toLocaleTimeString(),
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
    timestamp: Date.now(),
    formatted: `The current time is ${new Date().toLocaleTimeString()}.`,
  };

  const displayData = data || defaultData;

  return (
    <Card className="w-full bg-white dark:bg-gray-800 shadow-md">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Clock className="h-5 w-5 text-purple-500" />
        <div>
          <CardTitle className="text-lg">Current Time</CardTitle>
          <CardDescription>Date and time information</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="text-2xl font-bold">{displayData.time}</div>
          <div className="text-md">
            {displayData.day}, {displayData.date}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TimeDisplay;
