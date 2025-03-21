import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/context/ChatContext";
import { Eye, EyeOff, RefreshCw } from "lucide-react";

export default function OpenAIApiKeyForm() {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();
  const { setApiKey: saveApiKey, getApiKey } = useChat();

  // Load existing API key if available
  useEffect(() => {
    const existingKey = getApiKey("openai");
    if (existingKey) {
      setApiKey(existingKey);
    }
  }, [getApiKey]);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Save the API key
      saveApiKey(apiKey, "openai");

      toast({
        title: "API Key Saved",
        description: "Your OpenAI API key has been saved successfully",
      });
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

  const handleClearApiKey = () => {
    setApiKey("");
    saveApiKey("", "openai");
    toast({
      title: "API Key Removed",
      description: "Your OpenAI API key has been removed",
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="openai-api-key" className="text-sm font-medium">
          OpenAI API Key
        </Label>
        <div className="mt-1 relative">
          <Input
            id="openai-api-key"
            type={showApiKey ? "text" : "password"}
            placeholder="Enter your OpenAI API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowApiKey(!showApiKey)}
          >
            {showApiKey ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Get your API key from{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            OpenAI Platform
          </a>
        </p>
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={handleSaveApiKey}
          disabled={isLoading || !apiKey.trim()}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save API Key"
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleClearApiKey}
          disabled={isLoading || !apiKey.trim()}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
