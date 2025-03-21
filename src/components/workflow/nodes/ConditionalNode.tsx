import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import {
  SplitIcon,
  CodeIcon,
  BracketsIcon,
  CheckCircle2Icon,
  XCircleIcon,
  VariableIcon
} from 'lucide-react';
import { BaseNode } from './BaseNode';
import { Badge } from '@/components/ui/badge';

interface ConditionParts {
  operator: string;
  leftSide: string;
  rightSide: string;
  isVariable: boolean;
}

export const ConditionalNode = memo(({ id, data, isConnectable, selected }: NodeProps) => {
  // Extract condition type - default to "expression" if not set
  const conditionType = data.conditionType || 'expression';
  
  // Parse the condition to extract meaningful parts for display
  const parseCondition = (): ConditionParts | null => {
    if (!data.condition) return null;
    
    const condition = data.condition.trim();
    
    // Check for variable references
    const isVariable = condition.includes('{{') && condition.includes('}}');
    
    // Try to parse comparison operators
    const comparisonOperators = ['===', '!==', '==', '!=', '>=', '<=', '>', '<'];
    let operator = '';
    let leftSide = '';
    let rightSide = '';
    
    for (const op of comparisonOperators) {
      if (condition.includes(op)) {
        const parts = condition.split(op);
        if (parts.length === 2) {
          operator = op;
          leftSide = parts[0].trim();
          rightSide = parts[1].trim();
          break;
        }
      }
    }
    
    // If no comparison operator found, try logical operators
    if (!operator) {
      const logicalOperators = [' && ', ' || '];
      for (const op of logicalOperators) {
        if (condition.includes(op)) {
          operator = op.trim();
          const parts = condition.split(op);
          leftSide = parts[0].trim();
          rightSide = parts.slice(1).join(op).trim();
          break;
        }
      }
    }
    
    // If still no operator, use the whole expression
    if (!operator) {
      return {
        operator: 'custom',
        leftSide: condition,
        rightSide: '',
        isVariable
      };
    }
    
    return {
      operator,
      leftSide,
      rightSide,
      isVariable
    };
  };
  
  const conditionParts = parseCondition();
  
  // Format condition for display
  const formatCondition = () => {
    if (!data.condition) return null;
    
    if (conditionType === 'comparison' && conditionParts) {
      const { operator, leftSide, rightSide } = conditionParts;
      
      // Get operator display text
      const getOperatorText = (op: string) => {
        switch (op) {
          case '===':
          case '==': return 'equals';
          case '!==':
          case '!=': return 'not equals';
          case '>': return 'greater than';
          case '>=': return 'greater than or equal to';
          case '<': return 'less than';
          case '<=': return 'less than or equal to';
          case '&&': return 'AND';
          case '||': return 'OR';
          default: return op;
        }
      };
      
      if (operator !== 'custom') {
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 flex-wrap">
              <Badge variant="outline" className="bg-blue-50">
                {formatVariableReference(leftSide)}
              </Badge>
              <span className="font-medium">{getOperatorText(operator)}</span>
              <Badge variant="outline" className="bg-purple-50">
                {formatVariableReference(rightSide)}
              </Badge>
            </div>
          </div>
        );
      }
    }
    
    // Default rendering for custom expressions
    return (
      <div className="bg-muted rounded p-1.5 text-[10px] font-mono max-h-20 overflow-y-auto">
        {data.condition}
      </div>
    );
  };
  
  // Format variable references like {{variableName}} for display
  const formatVariableReference = (text: string) => {
    if (!text) return '';
    
    // Check if it's a variable reference
    if (text.includes('{{') && text.includes('}}')) {
      const variableName = text.replace(/\{\{|\}\}/g, '').trim();
      return (
        <span className="flex items-center gap-1">
          <VariableIcon className="h-2.5 w-2.5" />
          <span>{variableName}</span>
        </span>
      );
    }
    
    // Check if it's a string literal (surrounded by quotes)
    if ((text.startsWith('"') && text.endsWith('"')) ||
        (text.startsWith("'") && text.endsWith("'"))) {
      return text.substring(1, text.length - 1);
    }
    
    return text;
  };
  
  // Get condition type badge
  const getConditionTypeBadge = () => {
    switch (conditionType) {
      case 'comparison':
        return (
          <Badge variant="outline" className="px-1 py-0 text-[9px] bg-blue-50">
            <BracketsIcon className="h-2.5 w-2.5 mr-1" />
            Comparison
          </Badge>
        );
      case 'javascript':
        return (
          <Badge variant="outline" className="px-1 py-0 text-[9px] bg-amber-50">
            <CodeIcon className="h-2.5 w-2.5 mr-1" />
            JavaScript
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="px-1 py-0 text-[9px] bg-slate-50">
            <CodeIcon className="h-2.5 w-2.5 mr-1" />
            Expression
          </Badge>
        );
    }
  };

  return (
    <BaseNode
      id={id}
      data={data}
      isConnectable={isConnectable}
      selected={selected}
      icon={<SplitIcon className="h-4 w-4 text-amber-500" />}
      color="bg-amber-50"
    >
      <div className="text-xs flex flex-col gap-1">
        <div className="flex items-center justify-between mb-1">
          {getConditionTypeBadge()}
          
          {conditionParts?.isVariable && (
            <Badge variant="outline" className="px-1 py-0 text-[9px]">
              <VariableIcon className="h-2.5 w-2.5 mr-1" />
              Uses Variables
            </Badge>
          )}
        </div>
        
        {data.condition ? (
          <div className="mt-1">
            <span className="font-medium block mb-1">Condition:</span>
            {formatCondition()}
          </div>
        ) : (
          <div className="text-muted-foreground italic">No condition set</div>
        )}
        
        <div className="flex justify-between mt-2 text-[10px]">
          <div className="flex items-center gap-1 bg-green-100 text-green-800 rounded px-2 py-0.5">
            <CheckCircle2Icon className="h-3 w-3" />
            <span>True</span>
          </div>
          <div className="flex items-center gap-1 bg-red-100 text-red-800 rounded px-2 py-0.5">
            <XCircleIcon className="h-3 w-3" />
            <span>False</span>
          </div>
        </div>
        
        {data.defaultPath && (
          <div className="mt-1 text-[10px] text-muted-foreground">
            Default path: <span className="font-medium">{data.defaultPath}</span>
          </div>
        )}
        
        {data.description && (
          <div className="mt-2 text-[10px] text-muted-foreground italic border-t pt-1">
            {data.description}
          </div>
        )}
      </div>
    </BaseNode>
  );
});

ConditionalNode.displayName = 'ConditionalNode';