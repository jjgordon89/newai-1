import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calculator } from "lucide-react";

interface CalculatorDisplayProps {
  data: {
    expression: string;
    result: number;
    formatted: string;
  };
}

export function CalculatorDisplay({
  data = { expression: "1+1", result: 2, formatted: "1+1 = 2" },
}: CalculatorDisplayProps) {
  return (
    <Card className="w-full bg-white dark:bg-gray-800 shadow-md">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Calculator className="h-5 w-5 text-blue-500" />
        <div>
          <CardTitle className="text-lg">Calculator</CardTitle>
          <CardDescription>Mathematical calculation result</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Expression: <span className="font-mono">{data.expression}</span>
          </div>
          <div className="text-2xl font-bold font-mono">= {data.result}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CalculatorDisplay;
