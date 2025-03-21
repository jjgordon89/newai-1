import { FineTunedModel } from '@/lib/fineTuningService';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Cpu, 
  BarChart2, 
  MoreVertical, 
  Trash2,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { convertToHuggingFaceModel } from '@/lib/fineTuningService';

interface FineTunedModelCardProps {
  model: FineTunedModel;
  onDelete: () => void;
}

export function FineTunedModelCard({ model, onDelete }: FineTunedModelCardProps) {
  const { setActiveModel } = useChat();
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Determine base model display name
  const baseModelName = model.baseModelId.split('/').pop() || model.baseModelId;
  
  // Handle using this model
  const handleUseModel = () => {
    const hfModel = convertToHuggingFaceModel(model);
    setActiveModel(hfModel);
  };
  
  return (
    <Card className="transition-shadow hover:shadow-md overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            {model.name}
          </CardTitle>
          <Badge className="bg-green-500/10 text-green-500">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Ready
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="flex flex-col gap-1 mt-1">
          <div className="text-sm text-muted-foreground mb-1">
            Fine-tuned version of <span className="font-medium">{baseModelName}</span>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-1">
            <Badge className="bg-muted/30">
              <Cpu className="mr-1 h-3 w-3" /> {model.size} MB
            </Badge>
            
            {model.metrics?.accuracy && (
              <Badge className="bg-blue-500/10 text-blue-500">
                <BarChart2 className="mr-1 h-3 w-3" /> Accuracy: {(model.metrics.accuracy * 100).toFixed(1)}%
              </Badge>
            )}
            
            {model.metrics?.perplexity && (
              <Badge className="bg-violet-500/10 text-violet-500">
                <BarChart2 className="mr-1 h-3 w-3" /> Perplexity: {model.metrics.perplexity.toFixed(2)}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center pt-0">
        <div className="text-xs text-muted-foreground">
          Created {formatDate(model.createdAt)}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="text-primary"
            onClick={handleUseModel}
          >
            <ArrowUpRight className="mr-1 h-4 w-4" />
            Use Model
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Model
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
}