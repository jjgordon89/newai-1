import { useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AVAILABLE_MODELS } from '@/lib/api';
import { AlertCircle, BrainCircuit, Info, Sparkles, Zap } from 'lucide-react';

export function ApiKeyForm() {
  const { setApiKey } = useChat();
  const [apiKey, setApiKeyInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();

  const huggingFaceModels = AVAILABLE_MODELS.filter(model => model.id.includes('/'));
  const newModelCount = huggingFaceModels.filter(model => 
    model.id.includes('Nemo') || 
    model.id.includes('Llama-3') || 
    model.id.includes('Phi-3') || 
    model.id.includes('Qwen2') || 
    model.id.includes('gemma-2') ||
    model.id.includes('CodeLlama')
  ).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) return;
    
    try {
      setIsSubmitting(true);
      console.log("Saving API key...");
      
      // Save the API key
      const success = setApiKey(apiKey.trim());
      
      if (success) {
        toast({
          title: "API Key Saved",
          description: "Reloading application..."
        });
        
        // Force reload the application after a brief delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setIsSubmitting(false);
        toast({
          title: "Error",
          description: "Failed to save API key",
          variant: "destructive"
        });
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error("Error saving API key:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full max-w-md p-6 flex flex-col gap-6 rounded-lg shadow-lg border border-cyber-primary/20 bg-gradient-to-b from-card to-card/80 backdrop-blur-sm">
      <div className="space-y-3 text-center">
        <div className="flex justify-between items-start w-full">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-cyber-primary/30 to-cyber-primary/5 flex items-center justify-center border border-cyber-primary/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
            <div className="text-cyber-primary text-2xl font-bold">AI</div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Info className="h-4 w-4" />
                <span className="text-xs">New Models</span>
                <Badge variant="secondary" className="ml-1 px-1.5 py-0">+{newModelCount}</Badge>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px]">
              <DialogHeader>
                <DialogTitle>New Hugging Face Models</DialogTitle>
                <DialogDescription>
                  We've added {newModelCount} new models from Hugging Face to enhance your AI experience
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="highlights">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="highlights">Highlights</TabsTrigger>
                  <TabsTrigger value="all">All Models</TabsTrigger>
                </TabsList>
                <TabsContent value="highlights" className="space-y-3 mt-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <BrainCircuit className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Llama 3</h3>
                        <p className="text-sm text-muted-foreground">Meta's latest Llama 3 models (8B and 70B) with stronger reasoning and better instruction following</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Sparkles className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Specialized Models</h3>
                        <p className="text-sm text-muted-foreground">New code-specialized models like CodeLlama and StableCode for development tasks</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Latest Releases</h3>
                        <p className="text-sm text-muted-foreground">Cutting-edge models including Mistral Nemo, Phi-3, Gemma 2, and Qwen 2</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="all" className="mt-4">
                  <div className="h-[300px] overflow-y-auto pr-2">
                    <table className="w-full text-sm">
                      <thead className="text-xs text-muted-foreground">
                        <tr>
                          <th className="text-left p-2">Model</th>
                          <th className="text-left p-2">Size</th>
                          <th className="text-left p-2">Features</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {huggingFaceModels.map(model => (
                          <tr key={model.id} className="hover:bg-muted/50">
                            <td className="p-2">{model.name}</td>
                            <td className="p-2">{model.id.includes('7B') || model.id.includes('7b') ? '7B' : 
                                              model.id.includes('8B') || model.id.includes('8b') ? '8B' :
                                              model.id.includes('9B') || model.id.includes('9b') ? '9B' :
                                              model.id.includes('13B') || model.id.includes('13b') ? '13B' :
                                              model.id.includes('34B') || model.id.includes('34b') ? '34B' :
                                              model.id.includes('70B') || model.id.includes('70b') ? '70B' :
                                              'Small'}</td>
                            <td className="p-2">
                              <div className="flex flex-wrap gap-1">
                                {model.task && (
                                  <Badge variant="outline" className="px-1 py-0 text-xs">
                                    {model.task}
                                  </Badge>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
        
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyber-primary to-accent bg-clip-text text-transparent">Welcome to AI Chatbot</h2>
        <p className="text-muted-foreground">
          Connect to {huggingFaceModels.length} Hugging Face models with your API key
        </p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-primary to-accent opacity-75 rounded-lg blur group-hover:opacity-100 transition duration-200"></div>
        <form onSubmit={handleSubmit} className="relative space-y-5 bg-card p-4 rounded-lg border border-cyber-primary/20">
          <div className="space-y-2">
            <label htmlFor="api-key" className="text-sm font-medium">
              Hugging Face API Key
            </label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="bg-card/30 border-cyber-primary/30 focus-visible:ring-cyber-primary focus-visible:border-cyber-primary/50 h-11 flex-1"
                disabled={isSubmitting}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setShowKey(!showKey)}
                className="min-w-[60px]"
              >
                {showKey ? "Hide" : "Show"}
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Requires a free account on <a
                href="https://huggingface.co/settings/tokens"
                target="_blank"
                rel="noreferrer"
                className="text-cyber-primary hover:underline font-medium"
              >
                Hugging Face
              </a></span>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 bg-gradient-to-r from-cyber-primary to-accent hover:from-cyber-primary/90 hover:to-accent/90 shadow-md disabled:opacity-70" 
            disabled={!apiKey.trim() || isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save API Key"}
          </Button>
        </form>
      </div>
    </div>
  );
}
