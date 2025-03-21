import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ModelSelector } from "@/components/ModelSelector";
import { Button } from "@/components/ui/button";
import { useChat } from "@/context/ChatContext";
import { Check, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ModelSettings() {
  const { activeModel, setActiveModel, availableModels } = useChat();
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState(activeModel);
  const [savedModel, setSavedModel] = useState(activeModel);

  // Update local state when active model changes
  useEffect(() => {
    setSelectedModel(activeModel);
    setSavedModel(activeModel);
  }, [activeModel]);

  const handleSaveModelPreference = () => {
    setActiveModel(selectedModel);
    setSavedModel(selectedModel);

    toast({
      title: "Model Preference Saved",
      description: `${selectedModel.name} is now your default model`,
      duration: 3000,
    });

    // Save to localStorage for persistence
    localStorage.setItem("preferredModelId", selectedModel.id);
  };

  const isModelChanged = selectedModel.id !== savedModel.id;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Model Preferences</CardTitle>
        <CardDescription>
          Choose your preferred AI model for chat interactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Default Model</label>
          <ModelSelector onlyAvailable={true} className="w-full" />
        </div>

        <div className="pt-2 flex justify-end">
          {isModelChanged ? (
            <Button onClick={handleSaveModelPreference}>
              <Save className="mr-2 h-4 w-4" />
              Save Preference
            </Button>
          ) : (
            <Button variant="outline" disabled>
              <Check className="mr-2 h-4 w-4" />
              Current Default
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
