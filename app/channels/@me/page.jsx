
"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { fetchDirectMessages, fetchFriends } from "@/lib/api";
import ChannelSidebar from "@/components/channel/ChannelSidebar";
import DirectMessageList from "@/components/direct-message/DirectMessageList";
import EmptyState from "@/components/ui/EmptyState";
import ChatArea from "@/components/chat/ChatArea";

export default function DirectMessagesPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [friends, setFriends] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);
  const [selectedDM, setSelectedDM] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [friendsData, dmData] = await Promise.all([
          fetchFriends(),
          fetchDirectMessages()
        ]);
        
        setFriends(friendsData);
        setDirectMessages(dmData);
      } catch (error) {
        console.error("Failed to load direct messages data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleNewDM = (message) => {
      // Check if this DM already exists
      const existingDMIndex = directMessages.findIndex(
        dm => dm.participants.some(p => p._id === message.sender._id) && 
             dm.participants.some(p => p._id === message.recipient._id)
      );

      if (existingDMIndex >= 0) {
        // Update existing DM
        const updatedDMs = [...directMessages];
        updatedDMs[existingDMIndex] = {
          ...updatedDMs[existingDMIndex],
          lastMessage: message
        };
        setDirectMessages(updatedDMs);
      } else {
        // Create new DM entry
        const otherUser = message.sender._id === user._id ? message.recipient : message.sender;
        const newDM = {
          _id: Date.now().toString(), // Temporary ID
          participants: [user, otherUser],
          lastMessage: message
        };
        setDirectMessages(prev => [newDM, ...prev]);
      }
    };

    socket.on("directMessage", handleNewDM);
    
    return () => {
      socket.off("directMessage", handleNewDM);
    };
  }, [socket, directMessages, user]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-discord-100 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <ChannelSidebar 
        type="dm"
        friends={friends}
        directMessages={directMessages}
        onSelectDM={setSelectedDM}
        selectedDM={selectedDM}
      />
      
      <div className="flex flex-1 flex-col bg-discord-300">
        {selectedDM ? (
          <ChatArea 
            type="directMessage"
            recipient={selectedDM.participants.find(p => p._id !== user._id)}
            channelId={selectedDM._id}
          />
        ) : (
          <EmptyState 
            title="Select a friend to start chatting"
            description="Your direct messages will appear here"
            icon="MessageSquare"
          />
        )}
      </div>
    </>
  );
}
