import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import {
  FunctionSquareIcon,
  Code2Icon,
  CodeIcon,
  TerminalIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusCircleIcon,
  LightbulbIcon
} from 'lucide-react';
import { BaseNode } from './BaseNode';
import { Badge } from '@/components/ui/badge';

interface FunctionStats {
  executionCount: number;
  avgExecutionTime: number;
  successRate: number;
  lastExecuted: string | null;
}

export const FunctionNode = memo(({ id, data, isConnectable, selected }: NodeProps) => {
  const functionName = data.functionName || 'function';
  const functionLanguage = data.language || 'javascript';
  const functionCategory = data.category || 'utility';
  const functionStats: FunctionStats = data.stats || {
    executionCount: 0,
    avgExecutionTime: 0,
    successRate: 100,
    lastExecuted: null
  };
  
  // Generate a syntax-highlighted preview of the code
  const getCodePreview = () => {
    if (!data.code) return null;
    
    // Determine language for syntax highlighting hint
    let languageClass = 'language-javascript';
    if (functionLanguage === 'python') {
      languageClass = 'language-python';
    } else if (functionLanguage === 'typescript') {
      languageClass = 'language-typescript';
    }
    
    const codePreview = data.code.length > 200
      ? `${data.code.substring(0, 200)}...`
      : data.code;
    
    return (
      <div className={`bg-slate-900 text-slate-50 rounded p-1.5 text-[10px] font-mono max-h-20 overflow-y-auto ${languageClass}`}>
        {codePreview}
      </div>
    );
  };
  
  // Get function type badge color and text
  const getFunctionTypeBadge = () => {
    switch (functionCategory) {
      case 'data':
        return (
          <Badge className="px-1.5 py-0.5 text-[9px] bg-blue-100 text-blue-800">
            <TerminalIcon className="h-2.5 w-2.5 mr-1" />
            Data Processing
          </Badge>
        );
      case 'integration':
        return (
          <Badge className="px-1.5 py-0.5 text-[9px] bg-purple-100 text-purple-800">
            <ArrowRightIcon className="h-2.5 w-2.5 mr-1" />
            Integration
          </Badge>
        );
      case 'transformation':
        return (
          <Badge className="px-1.5 py-0.5 text-[9px] bg-green-100 text-green-800">
            <CodeIcon className="h-2.5 w-2.5 mr-1" />
            Transformation
          </Badge>
        );
      case 'ai':
        return (
          <Badge className="px-1.5 py-0.5 text-[9px] bg-amber-100 text-amber-800">
            <LightbulbIcon className="h-2.5 w-2.5 mr-1" />
            AI Logic
          </Badge>
        );
      default:
        return (
          <Badge className="px-1.5 py-0.5 text-[9px] bg-slate-100 text-slate-800">
            <Code2Icon className="h-2.5 w-2.5 mr-1" />
            Utility
          </Badge>
        );
    }
  };
  
  // Format parameter values for display
  const formatParameterValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">null</span>;
    }
    
    if (typeof value === 'string') {
      // Check if it's a variable reference
      if (value.includes('{{') && value.includes('}}')) {
        return <span className="text-blue-500">{value}</span>;
      }
      
      // If it's a normal string, show it with quotes
      return <span className="text-green-500">"{value}"</span>;
    }
    
    if (typeof value === 'number') {
      return <span className="text-amber-500">{value}</span>;
    }
    
    if (typeof value === 'boolean') {
      return <span className="text-purple-500">{String(value)}</span>;
    }
    
    // For objects and arrays
    return <span className="text-slate-500">{JSON.stringify(value).substring(0, 20)}</span>;
  };
  
  return (
    <BaseNode
      id={id}
      data={data}
      isConnectable={isConnectable}
      selected={selected}
      icon={<FunctionSquareIcon className="h-4 w-4 text-indigo-500" />}
      color="bg-indigo-50"
    >
      <div className="text-xs flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="font-medium font-mono bg-indigo-100 px-1 py-0.5 rounded">
              {functionName}
            </span>
            <span className="text-[9px] text-muted-foreground">
              ({functionLanguage})
            </span>
          </div>
          
          {getFunctionTypeBadge()}
        </div>
        
        {data.description && (
          <div className="text-[10px] text-muted-foreground mt-1">
            {data.description}
          </div>
        )}
        
        {data.code && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-[10px]">Code:</span>
              <Badge variant="outline" className="px-1 py-0 text-[8px]">
                {functionLanguage}
              </Badge>
            </div>
            {getCodePreview()}
          </div>
        )}
        
        {data.parameters && Object.keys(data.parameters).length > 0 && (
          <div className="mt-2">
            <span className="font-medium text-[10px] block mb-1">Parameters:</span>
            <div className="bg-slate-100 rounded p-1.5 text-[10px] font-mono">
              {Object.keys(data.parameters).map(key => (
                <div key={key} className="flex justify-between">
                  <span className="text-slate-700">{key}:</span>
                  {formatParameterValue(data.parameters[key])}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Function stats section */}
        {functionStats && functionStats.executionCount > 0 && (
          <div className="mt-2 pt-1 border-t border-dashed">
            <div className="flex justify-between items-center text-[9px] text-muted-foreground mb-1">
              <div className="flex items-center gap-1">
                <ClockIcon className="h-2.5 w-2.5" />
                <span>{functionStats.avgExecutionTime.toFixed(0)}ms</span>
              </div>
              
              <div className="flex items-center gap-1">
                {functionStats.successRate >= 95 ? (
                  <CheckCircleIcon className="h-2.5 w-2.5 text-green-500" />
                ) : functionStats.successRate >= 80 ? (
                  <CheckCircleIcon className="h-2.5 w-2.5 text-amber-500" />
                ) : (
                  <XCircleIcon className="h-2.5 w-2.5 text-red-500" />
                )}
                <span>{functionStats.successRate}% success</span>
              </div>
              
              <div className="flex items-center gap-1">
                <PlusCircleIcon className="h-2.5 w-2.5" />
                <span>{functionStats.executionCount} runs</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
});

FunctionNode.displayName = 'FunctionNode';