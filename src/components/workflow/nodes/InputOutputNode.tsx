import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import {
  ArrowRightFromLineIcon,
  ArrowLeftToLineIcon,
  TypeIcon,
  TextIcon,
  HashIcon,
  CheckSquareIcon,
  ListIcon,
  CircleOff,
  CircleDotIcon,
  AsteriskIcon
} from 'lucide-react';
import { BaseNode } from './BaseNode';
import { Badge } from '@/components/ui/badge';

export const InputOutputNode = memo(({ id, data, isConnectable, selected, type }: NodeProps) => {
  const isInput = type === 'input';
  const variableName = data.variableName || 'variable';
  const dataType = data.dataType || 'string';
  const isRequired = data.required !== false; // Default to true for input nodes
  
  // Get appropriate icon for the data type
  const getTypeIcon = () => {
    switch (dataType) {
      case 'string':
        return <TextIcon className="h-3 w-3" />;
      case 'number':
        return <HashIcon className="h-3 w-3" />;
      case 'boolean':
        return <CheckSquareIcon className="h-3 w-3" />;
      case 'array':
        return <ListIcon className="h-3 w-3" />;
      case 'object':
        return <CircleDotIcon className="h-3 w-3" />;
      default:
        return <TypeIcon className="h-3 w-3" />;
    }
  };
  
  // Format the default value for display
  const formatDefaultValue = (value: any) => {
    if (value === undefined || value === null) {
      return <span className="italic text-muted-foreground">null</span>;
    }
    
    if (typeof value === 'string') {
      return <span className="text-green-600">"{value}"</span>;
    }
    
    if (typeof value === 'number') {
      return <span className="text-amber-600">{value}</span>;
    }
    
    if (typeof value === 'boolean') {
      return <span className="text-purple-600">{String(value)}</span>;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-slate-500">[]</span>;
      }
      
      return (
        <span className="text-slate-500">
          Array({value.length}) [{value.length > 3 ? '...' : value.map(v => typeof v).join(', ')}]
        </span>
      );
    }
    
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      return (
        <span className="text-slate-500">
          Object {`{${keys.length > 3 ? '...' : keys.join(', ')}}`}
        </span>
      );
    }
    
    return String(value);
  };
  
  return (
    <BaseNode
      id={id}
      data={data}
      isConnectable={isConnectable}
      selected={selected}
      icon={isInput
        ? <ArrowRightFromLineIcon className={`h-4 w-4 ${isInput ? 'text-cyan-500' : 'text-pink-500'}`} />
        : <ArrowLeftToLineIcon className={`h-4 w-4 ${isInput ? 'text-cyan-500' : 'text-pink-500'}`} />
      }
      color={isInput ? 'bg-cyan-50' : 'bg-pink-50'}
      handles={{ inputs: !isInput, outputs: isInput }}
    >
      <div className="text-xs flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className={`font-medium font-mono px-1 py-0.5 rounded ${isInput ? 'bg-cyan-100' : 'bg-pink-100'}`}>
              {variableName}
            </span>
          </div>
          
          {isInput && (
            <Badge variant={isRequired ? "default" : "outline"} className="text-[9px] px-1 py-0">
              {isRequired ? (
                <AsteriskIcon className="h-2 w-2 mr-0.5 text-red-400" />
              ) : (
                <CircleOff className="h-2 w-2 mr-0.5" />
              )}
              {isRequired ? 'Required' : 'Optional'}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Badge
            variant="outline"
            className={`flex items-center gap-1 px-1.5 py-0.5 ${
              isInput ? 'bg-cyan-100/50 hover:bg-cyan-100' : 'bg-pink-100/50 hover:bg-pink-100'
            }`}
          >
            {getTypeIcon()}
            <span>{dataType}</span>
          </Badge>
          
          {isInput && data.defaultValue !== undefined && (
            <Badge variant="outline" className="px-1.5 py-0.5 text-[9px] bg-slate-100 hover:bg-slate-200">
              Has Default
            </Badge>
          )}
        </div>
        
        {data.description && (
          <div className="text-[10px] text-muted-foreground">
            {data.description}
          </div>
        )}
        
        {data.defaultValue !== undefined && (
          <div className="flex flex-col mt-1">
            <span className="font-medium text-[10px]">Default Value:</span>
            <div className="bg-slate-100 rounded p-1.5 mt-1 text-[10px] font-mono max-h-12 overflow-y-auto">
              {formatDefaultValue(data.defaultValue)}
            </div>
          </div>
        )}
        
        {isInput && data.validationRules && (
          <div className="flex flex-col mt-1">
            <span className="font-medium text-[10px]">Validation:</span>
            <div className="text-[9px] text-muted-foreground">
              {Object.entries(data.validationRules).map(([rule, value]) => (
                <div key={rule} className="flex items-center gap-1">
                  <span className="font-medium">{rule}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {!isInput && data.schema && (
          <div className="flex flex-col mt-1">
            <span className="font-medium text-[10px]">Schema:</span>
            <div className="bg-slate-100 rounded p-1.5 mt-1 text-[9px] text-muted-foreground font-mono max-h-16 overflow-y-auto">
              {typeof data.schema === 'string' ? data.schema : JSON.stringify(data.schema, null, 1)}
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
});

InputOutputNode.displayName = 'InputOutputNode';