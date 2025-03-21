// Time and date service for the AI assistant

// Get the current time and date
export const getCurrentDateTime = (): {
  time: string;
  date: string;
  day: string;
  timestamp: number;
} => {
  const now = new Date();

  // Format time as HH:MM:SS
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // Format date as Month DD, YYYY
  const date = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Get day of week
  const day = now.toLocaleDateString("en-US", { weekday: "long" });

  return {
    time,
    date,
    day,
    timestamp: now.getTime(),
  };
};

// Check if a query is asking for the current time or date
export const isTimeQuery = (query: string): boolean => {
  const timeRegex =
    /\b(what\s+(?:is|time|date|day)\s+(?:is|it|now|today|current)|current\s+(?:time|date|day)|today'?s\s+date)\b/i;
  return timeRegex.test(query);
};

// Format a response for a time query
export const formatTimeResponse = (): string => {
  const { time, date, day } = getCurrentDateTime();
  return `The current time is ${time}. Today is ${day}, ${date}.`;
};
