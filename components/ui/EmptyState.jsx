
import React from "react";
import * as Icons from "lucide-react";

export default function EmptyState({ title, description, icon }) {
  const Icon = Icons[icon] || Icons.AlertCircle;

  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 rounded-full bg-discord-400 p-6">
        <Icon className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="mb-2 text-xl font-medium">{title}</h3>
      <p className="max-w-md text-gray-400">{description}</p>
    </div>
  );
}
