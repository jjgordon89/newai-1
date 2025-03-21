import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Clock, Cloud, Database, Search } from "lucide-react";

interface SkillResultProps {
  title: string;
  type: string;
  content: string;
  sources?: string[];
  timestamp?: string;
}

const SkillResult = ({
  title,
  type,
  content,
  sources = [],
  timestamp = new Date().toLocaleTimeString(),
}: SkillResultProps) => {
  // Get the appropriate icon based on skill type
  const getIcon = () => {
    switch (type) {
      case "calculator":
        return <Calculator className="h-5 w-5" />;
      case "time":
        return <Clock className="h-5 w-5" />;
      case "weather":
        return <Cloud className="h-5 w-5" />;
      case "search":
        return <Search className="h-5 w-5" />;
      case "knowledge":
        return <Database className="h-5 w-5" />;
      default:
        return null;
    }
  };

  // Get the appropriate color based on skill type
  const getBadgeVariant = () => {
    switch (type) {
      case "calculator":
        return "default";
      case "time":
        return "secondary";
      case "weather":
        return "blue";
      case "search":
        return "green";
      case "knowledge":
        return "yellow";
      case "error":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card className="mb-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Badge variant={getBadgeVariant() as any}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        </div>
        <CardDescription className="text-xs text-gray-500">
          {timestamp}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap">{content}</div>
      </CardContent>
      {sources && sources.length > 0 && (
        <CardFooter className="flex flex-col items-start pt-0">
          <p className="text-sm font-medium mb-1">Sources:</p>
          <div className="flex flex-wrap gap-2">
            {sources.map((source, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {source}
              </Badge>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default SkillResult;
