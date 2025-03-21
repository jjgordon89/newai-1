import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { FileOutput } from "lucide-react";

interface OutputNodeProps {
  data: {
    label?: string;
    description?: string;
    id: string;
  };
  selected: boolean;
}

function OutputNode({ data, selected }: OutputNodeProps) {
  return (
    <div
      className={`p-3 rounded-md border ${selected ? "border-primary ring-2 ring-primary" : "border-border"} bg-card shadow-sm`}
    >
      <div className="flex items-center gap-2">
        <div className="p-1 rounded-md bg-primary/10">
          <FileOutput className="h-4 w-4 text-primary" />
        </div>
        <div>
          <div className="font-medium text-sm">{data.label || "Output"}</div>
          {data.description && (
            <div className="text-xs text-muted-foreground">
              {data.description}
            </div>
          )}
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        className="w-3 h-3 bg-muted-foreground"
      />
    </div>
  );
}

export default memo(OutputNode);
