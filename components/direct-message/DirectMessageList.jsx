
"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

export default function DirectMessageList({ 
  directMessages = [], 
  onSelectDM, 
  selectedDM,
  currentUser
}) {
  const router = useRouter();

  const handleSelectDM = (dm) => {
    onSelectDM(dm);
  };

  if (directMessages.length === 0) {
    return (
      <div className="py-2 text-center text-sm text-gray-400">
        No direct messages yet
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {directMessages.map((dm) => {
        // Find the other user in the conversation (not the current user)
        const otherUser = dm.participants.find(p => p._id !== currentUser?._id);
        if (!otherUser) return null;

        return (
          <button
            key={dm._id}
            className={`group flex w-full items-center rounded px-2 py-1 text-sm ${
              selectedDM && selectedDM._id === dm._id
                ? "bg-discord-300 text-white"
                : "text-gray-400 hover:bg-discord-300/50 hover:text-gray-300"
            }`}
            onClick={() => handleSelectDM(dm)}
          >
            <div className="relative">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src={otherUser.avatar || `https://ui-avatars.com/api/?name=${otherUser.username}`} />
                <AvatarFallback>{otherUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              {otherUser.status === "online" && (
                <span className="absolute bottom-0 right-2 h-3 w-3 rounded-full bg-green-500 border-2 border-discord-400"></span>
              )}
            </div>
            <div className="flex-1 truncate text-left">
              <div className="font-medium">{otherUser.username}</div>
              {dm.lastMessage && (
                <p className="text-xs truncate text-gray-400">
                  {dm.lastMessage.content.length > 25
                    ? dm.lastMessage.content.substring(0, 25) + "..."
                    : dm.lastMessage.content}
                </p>
              )}
            </div>
            {dm.lastMessage && (
              <div className="ml-2 text-xs text-gray-500">
                {formatDistanceToNow(new Date(dm.lastMessage.createdAt), { addSuffix: true })}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
