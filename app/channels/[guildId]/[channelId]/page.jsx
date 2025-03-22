
"use client"

import { useState, useEffect } from "react";
import { fetchGuild, fetchChannel, fetchChannels } from "@/lib/api";
import ChannelSidebar from "@/components/channel/ChannelSidebar";
import ChatArea from "@/components/chat/ChatArea";

export default function ChannelPage({ params }) {
  const { guildId, channelId } = params;
  const [guild, setGuild] = useState(null);
  const [channel, setChannel] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [guildData, channelData, channelsData] = await Promise.all([
          fetchGuild(guildId),
          fetchChannel(guildId, channelId),
          fetchChannels(guildId)
        ]);
        
        setGuild(guildData);
        setChannel(channelData);
        setChannels(channelsData);
      } catch (error) {
        console.error("Failed to load channel data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (guildId && channelId) {
      loadData();
    }
  }, [guildId, channelId]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-discord-100 border-t-transparent"></div>
      </div>
    );
  }

  if (!guild || !channel) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-medium">Channel not found</h3>
          <p className="mt-2 text-gray-400">The channel you're looking for doesn't exist or you don't have access.</p>
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
        selectedChannel={channel}
      />
      
      <ChatArea 
        type="channel"
        channel={channel}
        guild={guild}
      />
    </>
  );
}
