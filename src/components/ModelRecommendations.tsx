import React from 'react';
import { SUPPORTED_MODELS } from './ModelSelector';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BrainCircuit, Code, GitCompare, Languages, Sparkles, Zap } from 'lucide-react';

export function ModelRecommendations() {
  // Filter Hugging Face models only
  const huggingFaceModels = SUPPORTED_MODELS.filter(model => model.provider === 'Hugging Face');
  
  // Create categories for different use cases
  const categories = [
    {
      name: "General Purpose",
      description: "Well-balanced models for a wide range of tasks",
      icon: <Sparkles className="h-5 w-5" />,
      models: huggingFaceModels.filter(model => 
        (model.strengths.includes('Balanced') || model.strengths.includes('General-purpose')) &&
        !model.strengths.includes('Code-focused')
      )
    },
    {
      name: "Performance",
      description: "High-performance models for complex reasoning",
      icon: <BrainCircuit className="h-5 w-5" />,
      models: huggingFaceModels.filter(model => 
        model.strengths.includes('High-performance') || 
        model.strengths.includes('Powerful') ||
        model.strengths.includes('Complex reasoning')
      )
    },
    {
      name: "Efficiency",
      description: "Fast, efficient models with lower resource usage",
      icon: <Zap className="h-5 w-5" />,
      models: huggingFaceModels.filter(model => 
        model.strengths.includes('Efficient') || 
        model.strengths.includes('Fast') ||
        model.strengths.includes('Compact') ||
        model.strengths.includes('Lightweight')
      )
    },
    {
      name: "Code Generation",
      description: "Specialized for programming and code tasks",
      icon: <Code className="h-5 w-5" />,
      models: huggingFaceModels.filter(model => 
        model.strengths.includes('Code') || 
        model.strengths.includes('Programming') ||
        model.strengths.includes('Code-focused') ||
        model.id.includes('CodeLlama') ||
        model.id.includes('stablecode')
      )
    },
    {
      name: "Multilingual",
      description: "Strong performance across multiple languages",
      icon: <Languages className="h-5 w-5" />,
      models: huggingFaceModels.filter(model => 
        model.strengths.includes('Multilingual')
      )
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-3 tracking-tight">Model Recommendations</h2>
        <p className="text-muted-foreground text-base">
          Choose the right model for your specific needs from our curated selection.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.name} className="border-2 shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3 bg-muted/20 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  {category.icon}
                </div>
                <CardTitle className="text-lg">{category.name}</CardTitle>
              </div>
              <CardDescription className="text-sm mt-2">{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {category.models.slice(0, 3).map((model) => (
                  <div
                    key={model.id}
                    className="flex flex-col gap-2 bg-secondary/30 rounded-lg p-3 text-sm border border-border/40 hover:border-border/70 hover:bg-secondary/40 transition-colors"
                  >
                    <div className="font-medium text-base">{model.name}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2">{model.description}</div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {model.strengths.map((strength, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="px-2 py-0.5 text-xs bg-background/60 shadow-sm"
                        >
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
                {category.models.length > 3 && (
                  <div className="text-sm text-center text-muted-foreground mt-2 py-1 border-t border-border/30">
                    +{category.models.length - 3} more models
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-sm text-muted-foreground pt-4 mt-4 border-t text-center">
        <div className="flex items-center justify-center gap-2 bg-muted/30 p-3 rounded-lg border border-border/30">
          <GitCompare className="h-5 w-5 text-primary/80" />
          <span>All models run directly through the Hugging Face Inference API using your API key</span>
        </div>
      </div>
    </div>
  );
}