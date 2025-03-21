import React from "react";
import ApiKeySettings from "@/components/settings/ApiKeySettings";

export default function ApiKeysPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">API Key Settings</h1>
      <ApiKeySettings />
    </div>
  );
}
