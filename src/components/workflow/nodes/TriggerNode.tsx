import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import {
  ZapIcon,
  Calendar,
  Globe,
  Clock,
  MessageSquare,
  FileIcon,
  Database
} from 'lucide-react';
import { BaseNode } from './BaseNode';
import { Badge } from '@/components/ui/badge';

export const TriggerNode = memo(({ id, data, isConnectable, selected }: NodeProps) => {
  const triggerType = data.triggerType || 'manual';
  
  // Get icon based on trigger type
  const getTriggerIcon = () => {
    switch (triggerType) {
      case 'scheduled':
        return <Clock className="h-3 w-3" />;
      case 'webhook':
        return <Globe className="h-3 w-3" />;
      case 'message':
        return <MessageSquare className="h-3 w-3" />;
      case 'document':
        return <FileIcon className="h-3 w-3" />;
      case 'database':
        return <Database className="h-3 w-3" />;
      default:
        return <ZapIcon className="h-3 w-3" />;
    }
  };
  
  // Get color based on trigger type
  const getTriggerBadgeColor = () => {
    switch (triggerType) {
      case 'scheduled':
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case 'webhook':
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case 'message':
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case 'document':
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case 'database':
        return "bg-cyan-100 text-cyan-800 hover:bg-cyan-200";
      default:
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
    }
  };
  
  // Format schedule string for display
  const formatSchedule = (schedule: string) => {
    if (!schedule) return 'Not set';
    
    // Simple cron format conversion to human-readable
    const parts = schedule.split(' ');
    if (parts.length === 5) {
      // Simplistic interpretation - would need more robust parsing for all cron patterns
      if (parts[0] === '*' && parts[1] === '*' && parts[2] === '*') {
        return 'Daily';
      } else if (parts[0] === '0' && parts[1] === '0' && parts[2] === '*') {
        return 'Daily at midnight';
      } else if (parts[2] === '*' && parts[4] === '*') {
        return `Hourly at ${parts[1]} minutes past the hour`;
      }
    }
    
    // Return the raw cron if we can't parse it nicely
    return schedule;
  };
  
  // Get detailed info about the trigger
  const getTriggerInfo = () => {
    switch (triggerType) {
      case 'scheduled':
        return {
          title: 'Schedule',
          value: formatSchedule(data.schedule || ''),
          description: data.scheduleDescription || ''
        };
      case 'webhook':
        return {
          title: 'Webhook URL',
          value: data.webhookUrl || 'Not configured',
          description: data.webhookDescription || ''
        };
      case 'message':
        return {
          title: 'Keyword Trigger',
          value: data.keywordTrigger || 'Any message',
          description: data.messageDescription || ''
        };
      case 'document':
        return {
          title: 'Document Event',
          value: data.documentEvent || 'New document added',
          description: data.documentDescription || ''
        };
      case 'database':
        return {
          title: 'Database Event',
          value: data.databaseEvent || 'Record changed',
          description: data.databaseDescription || ''
        };
      default:
        return {
          title: 'Manual Execution',
          value: 'User triggered',
          description: data.description || ''
        };
    }
  };
  
  const triggerInfo = getTriggerInfo();

  return (
    <BaseNode
      id={id}
      data={data}
      isConnectable={isConnectable}
      selected={selected}
      icon={<ZapIcon className="h-4 w-4 text-orange-500" />}
      color="bg-orange-50"
      handles={{ inputs: false, outputs: true }}
    >
      <div className="text-xs flex flex-col gap-2">
        <Badge className={`text-xs px-2 py-1 w-fit flex items-center gap-1.5 ${getTriggerBadgeColor()}`}>
          {getTriggerIcon()}
          <span>{triggerType.charAt(0).toUpperCase() + triggerType.slice(1)} Trigger</span>
        </Badge>
        
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex items-start">
            <span className="font-medium min-w-[70px]">{triggerInfo.title}:</span>
            <span className="ml-1 text-xs">{triggerInfo.value}</span>
          </div>
          
          {triggerInfo.description && (
            <div className="text-xs text-muted-foreground italic">
              {triggerInfo.description}
            </div>
          )}
          
          {triggerType === 'scheduled' && data.lastRun && (
            <div className="text-xs text-muted-foreground mt-1">
              <span className="font-medium">Last run:</span>
              <span className="ml-1">{new Date(data.lastRun).toLocaleString()}</span>
            </div>
          )}
          
          {triggerType === 'webhook' && data.webhookLastCalled && (
            <div className="text-xs text-muted-foreground mt-1">
              <span className="font-medium">Last called:</span>
              <span className="ml-1">{new Date(data.webhookLastCalled).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </BaseNode>
  );
});

TriggerNode.displayName = 'TriggerNode';