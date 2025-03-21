import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calculator, Clock, Cloud, Database, Search } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  availableSkills,
  setSkillEnabled,
  isSkillAvailable,
} from "@/lib/skills";

const AgentSkills = () => {
  const [skills, setSkills] = useState(availableSkills);

  const handleToggleSkill = (skillId: string, enabled: boolean) => {
    setSkillEnabled(skillId, enabled);
    setSkills([...availableSkills]); // Update the state with the modified skills
  };

  const getSkillIcon = (skillId: string) => {
    switch (skillId) {
      case "calculator":
        return <Calculator className="h-5 w-5" />;
      case "time":
        return <Clock className="h-5 w-5" />;
      case "weather":
        return <Cloud className="h-5 w-5" />;
      case "webSearch":
        return <Search className="h-5 w-5" />;
      case "knowledgeBase":
        return <Database className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "utility":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "knowledge":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      case "search":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <Card className="w-full bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle>Agent Skills</CardTitle>
        <CardDescription>
          Enable or disable skills for your AI assistant
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {skills.map((skill) => {
            const isAvailable = isSkillAvailable(skill.id);
            const needsApiKey =
              skill.requiresApiKey && skill.isApiKeySet && !skill.isApiKeySet();

            return (
              <div
                key={skill.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-700">
                    {getSkillIcon(skill.id)}
                  </div>
                  <div>
                    <h3 className="font-medium">{skill.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {skill.description}
                    </p>
                    <div className="flex gap-2 mt-1">
                      {skill.category && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(skill.category)}`}
                        >
                          {skill.category}
                        </span>
                      )}
                      {needsApiKey && (
                        <Badge
                          variant="outline"
                          className="text-xs border-amber-500 text-amber-500"
                        >
                          Needs API Key
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Switch
                          checked={skill.enabled}
                          onCheckedChange={(checked) =>
                            handleToggleSkill(skill.id, checked)
                          }
                          disabled={needsApiKey}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {needsApiKey
                        ? `${skill.name} requires an API key to be enabled`
                        : `${skill.enabled ? "Disable" : "Enable"} ${skill.name}`}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentSkills;
