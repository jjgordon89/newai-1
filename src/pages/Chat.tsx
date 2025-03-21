import React from "react";
import { EnhancedChatMessages } from "@/components/EnhancedChatMessages";
import { EnhancedChatInput } from "@/components/EnhancedChatInput";

export default function Chat() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden relative">
        <EnhancedChatMessages />
      </div>

      <div className="w-full mt-auto">
        <EnhancedChatInput />
      </div>
    </div>
  );
}
