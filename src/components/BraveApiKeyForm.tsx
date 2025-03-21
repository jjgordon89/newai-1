import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { setBraveApiKey, getBraveApiKey } from "@/lib/webSearchService";
import { useToast } from "@/hooks/use-toast";
import { InfoIcon } from "lucide-react";

interface BraveApiKeyFormProps {
  onClose?: () => void;
  initialApiKey?: string;
  onSave?: (key: string) => void;
}

export function BraveApiKeyForm({ 
  onClose, 
  initialApiKey, 
  onSave 
}: BraveApiKeyFormProps) {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState(initialApiKey || getBraveApiKey() || "");
  const [isValidating, setIsValidating] = useState(false);
  const [showCorsWarning, setShowCorsWarning] = useState(false);

  // Update apiKey if initialApiKey changes
  useEffect(() => {
    if (initialApiKey !== undefined) {
      setApiKey(initialApiKey);
    }
  }, [initialApiKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Brave Search API key",
        variant: "destructive",
      });
      return;
    }
    
    setIsValidating(true);
    setShowCorsWarning(false);
    
    try {
      // In a development environment or when running on a hosting platform without proper CORS setup,
      // direct validation with the Brave API might fail due to CORS restrictions.
      // We'll save the key directly and let the user test it by making a search.
      
      // Save to global storage if no custom onSave handler
      if (!onSave) {
        setBraveApiKey(apiKey);
      } else {
        // Use custom save handler (for workspace-specific settings)
        onSave(apiKey);
      }
      
      toast({
        title: "Success",
        description: "Brave Search API key saved. Try a search to verify it works.",
      });
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error validating Brave API key:', error);
      setShowCorsWarning(true);
      toast({
        title: "Warning",
        description: "Couldn't validate the API key due to browser restrictions, but we've saved it. Try a search to verify it works.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="brave-api-key">Brave Search API Key</Label>
        <Input
          id="brave-api-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Brave Search API key"
          autoComplete="off"
        />
        <p className="text-sm text-muted-foreground">
          You can get a Brave Search API key by visiting{" "}
          <a
            href="https://brave.com/search/api/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            Brave Search API
          </a>
        </p>
      </div>
      
      {showCorsWarning && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <InfoIcon className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700">
            Due to browser security restrictions, we can't directly validate the API key. 
            The key has been saved - try using web search to verify it works.
          </AlertDescription>
        </Alert>
      )}
      
      <Button type="submit" disabled={isValidating} className="w-full">
        {isValidating ? "Saving..." : "Save API Key"}
      </Button>
    </form>
  );
}
