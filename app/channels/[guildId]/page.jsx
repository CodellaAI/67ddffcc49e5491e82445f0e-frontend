
"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchGuild, fetchChannels } from "@/lib/api";
import ChannelSidebar from "@/components/channel/ChannelSidebar";
import EmptyState from "@/components/ui/EmptyState";
import ChatArea from "@/components/chat/ChatArea";

export default function GuildChannelPage({ params }) {
  const { guildId } = params;
  const router = useRouter();
  const [guild, setGuild] = useState(null);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGuildData = async () => {
      try {
        const [guildData, channelsData] = await Promise.all([
          fetchGuild(guildId),
          fetchChannels(guildId)
        ]);
        
        setGuild(guildData);
        setChannels(channelsData);
        
        // If there are channels, select the first text channel by default
        const textChannels = channelsData.filter(c => c.type === "text");
        if (textChannels.length > 0 && !selectedChannel) {
          setSelectedChannel(textChannels[0]);
          router.push(`/channels/${guildId}/${textChannels[0]._id}`);
        }
      } catch (error) {
        console.error("Failed to load guild data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (guildId) {
      loadGuildData();
    }
  }, [guildId, router, selectedChannel]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-discord-100 border-t-transparent"></div>
      </div>
    );
  }

  if (!guild) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-medium">Guild not found</h3>
          <p className="mt-2 text-gray-400">The guild you're looking for doesn't exist or you don't have access.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ChannelSidebar 
        type="guild"
        guild={guild}
        channels={channels}
        selectedChannel={selectedChannel}
        onSelectChannel={setSelectedChannel}
      />
      
      <div className="flex flex-1 flex-col bg-discord-300">
        {selectedChannel ? (
          <ChatArea 
            type="channel"
            channel={selectedChannel}
            guild={guild}
          />
        ) : (
          <EmptyState 
            title="No channel selected"
            description="Select a channel to start chatting"
            icon="Hash"
          />
        )}
      </div>
    </>
  );
}
