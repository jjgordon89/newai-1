import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Info, ExternalLink } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { checkOpenRouterStatus, getOpenRouterApiKey, saveOpenRouterApiKey } from '@/lib/openRouterService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function OpenRouterApiKeyForm() {
  const [apiKey, setApiKey] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [autoValidate, setAutoValidate] = useState(true);
  const { toast } = useToast();

  // Load saved API key on component mount
  useEffect(() => {
    const savedKey = getOpenRouterApiKey();
    if (savedKey) {
      setApiKey(savedKey);
      
      // Validate the saved key
      validateKey(savedKey);
    }
  }, []);

  // Validate the key whenever it changes and autoValidate is enabled
  useEffect(() => {
    if (apiKey && autoValidate) {
      const debounce = setTimeout(() => {
        validateKey(apiKey);
      }, 500);
      
      return () => clearTimeout(debounce);
    }
  }, [apiKey, autoValidate]);

  const validateKey = async (key: string) => {
    if (!key) {
      setIsValid(null);
      return;
    }
    
    setIsValidating(true);
    try {
      const valid = await checkOpenRouterStatus(key);
      setIsValid(valid);
    } catch (error) {
      console.error('Error validating OpenRouter API key:', error);
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) return;
    
    try {
      // Save the API key
      saveOpenRouterApiKey(apiKey.trim());
      
      toast({
        title: "API Key Saved",
        description: "Your OpenRouter API key has been saved"
      });
      
      // Validate the key if not already validating
      if (!isValidating && !isValid) {
        validateKey(apiKey.trim());
      }
    } catch (error) {
      console.error("Error saving OpenRouter API key:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleValidateClick = () => {
    validateKey(apiKey.trim());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">OpenRouter API</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-80">
                <p>OpenRouter provides unified access to 100+ AI models from providers like Anthropic, Google, and more through a single API</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {isValid === true && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Connected
            </Badge>
          )}
        </div>
        
        <a 
          href="https://openrouter.ai/keys" 
          target="_blank" 
          rel="noreferrer" 
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
        >
          Get API key <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type={showKey ? "text" : "password"}
              placeholder="OpenRouter API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1"
              disabled={isValidating}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => setShowKey(!showKey)}
              className="min-w-[60px] whitespace-nowrap"
            >
              {showKey ? "Hide" : "Show"}
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Provides access to 100+ AI models including Claude, Gemini, Meta, Mistral, and more</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-validate"
              checked={autoValidate}
              onCheckedChange={setAutoValidate}
            />
            <Label htmlFor="auto-validate" className="text-sm">Auto-validate</Label>
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleValidateClick}
              disabled={!apiKey.trim() || isValidating}
              className="whitespace-nowrap"
            >
              {isValidating ? "Validating..." : "Test Connection"}
            </Button>
            
            <Button 
              type="submit" 
              disabled={!apiKey.trim() || isValidating}
            >
              Save Key
            </Button>
          </div>
        </div>
      </form>
      
      <Accordion type="single" collapsible className="border rounded-md">
        <AccordionItem value="models">
          <AccordionTrigger className="px-4">Available models through OpenRouter</AccordionTrigger>
          <AccordionContent className="space-y-2 px-4 pb-4">
            <p className="text-sm text-muted-foreground">OpenRouter provides unified access to:</p>
            <ul className="text-sm space-y-1 ml-5 list-disc">
              <li>Anthropic models (Claude 3 Opus/Sonnet/Haiku)</li>
              <li>Google models (Gemini Pro)</li>
              <li>Meta models (Llama 3 family)</li>
              <li>Mistral models (Mistral Large, Medium)</li>
              <li>Cohere, Perplexity, and many more</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">All accessible through a single API with transparent pricing.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {isValid === false && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
          Invalid API key. Please check your OpenRouter API key and try again.
        </div>
      )}
    </div>
  );
}