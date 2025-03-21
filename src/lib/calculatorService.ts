// Simple calculator service for basic math operations

// Function to evaluate a mathematical expression
export const evaluateExpression = (expression: string): number => {
  try {
    // Remove any non-math characters for security
    const sanitizedExpression = expression.replace(/[^0-9+\-*/().\s]/g, "");

    // Use Function constructor to evaluate the expression
    // This is safer than eval() but still needs the sanitization above
    return Function(`'use strict'; return (${sanitizedExpression})`)();
  } catch (error) {
    console.error("Error evaluating expression:", error);
    throw new Error("Invalid mathematical expression");
  }
};

// Check if the query contains a mathematical expression
export const containsMathExpression = (query: string): boolean => {
  // Basic regex to detect math expressions
  const mathRegex = /\d+\s*[+\-*/]\s*\d+/;
  return mathRegex.test(query);
};

// Extract the mathematical expression from a query
export const extractMathExpression = (query: string): string => {
  // Try to extract expression between 'calculate' and end of string
  const calculateRegex = /calculate\s+([\d\s+\-*/().]+)/i;
  const match = query.match(calculateRegex);

  if (match && match[1]) {
    return match[1].trim();
  }

  // If no 'calculate' keyword, try to extract any math expression
  const mathRegex = /([\d\s+\-*/().]+)/;
  const generalMatch = query.match(mathRegex);

  if (generalMatch && generalMatch[1]) {
    return generalMatch[1].trim();
  }

  throw new Error("No mathematical expression found in query");
};
