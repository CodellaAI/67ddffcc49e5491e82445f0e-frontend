
"use client"

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createChannel } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Settings, 
  Hash, 
  Volume2, 
  Plus, 
  ChevronDown, 
  Users, 
  Headphones, 
  Mic, 
  MessageSquare, 
  User,
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import DirectMessageList from "@/components/direct-message/DirectMessageList";

export default function ChannelSidebar({ 
  type = "guild", 
  guild = null, 
  channels = [], 
  selectedChannel = null,
  onSelectChannel = () => {},
  friends = [],
  directMessages = [],
  onSelectDM = () => {},
  selectedDM = null
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelType, setNewChannelType] = useState("text");
  const [isCreating, setIsCreating] = useState(false);

  // Group channels by category
  const groupedChannels = channels.reduce((acc, channel) => {
    const category = channel.category || "general";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(channel);
    return acc;
  }, {});

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim() || !guild) return;
    
    setIsCreating(true);
    try {
      const newChannel = await createChannel(guild._id, {
        name: newChannelName.toLowerCase().replace(/\s+/g, '-'),
        type: newChannelType
      });
      
      setNewChannelName("");
      setIsCreateChannelOpen(false);
      
      // Refresh the page to update the channel list
      router.refresh();
      
      toast({
        title: "Success",
        description: `Channel "${newChannel.name}" has been created!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create channel",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen w-60 flex-col bg-discord-400">
      {/* Server/DM Header */}
      {type === "guild" && guild ? (
        <div className="flex h-12 items-center justify-between border-b border-discord-500 px-4 shadow-sm">
          <h2 className="font-medium truncate">{guild.name}</h2>
          <Link href={`/channels/${guild._id}/settings`}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Settings size={18} />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex h-12 items-center border-b border-discord-500 px-4 shadow-sm">
          <h2 className="font-medium">
            {type === "dm" ? "Direct Messages" : "Friends"}
          </h2>
        </div>
      )}

      {/* Channel/DM List */}
      <ScrollArea className="flex-1">
        {type === "guild" && (
          <div className="px-2 py-4">
            {Object.entries(groupedChannels).map(([category, categoryChannels]) => (
              <div key={category} className="mb-4">
                <div className="mb-1 flex items-center justify-between px-2">
                  <button className="flex items-center text-xs font-semibold uppercase text-gray-400 hover:text-gray-300">
                    <ChevronDown size={12} className="mr-1" />
                    {category}
                  </button>
                  {guild && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 text-gray-400 hover:text-white"
                      onClick={() => setIsCreateChannelOpen(true)}
                    >
                      <Plus size={14} />
                    </Button>
                  )}
                </div>

                <div className="space-y-1">
                  {categoryChannels.map((channel) => (
                    <Link 
                      key={channel._id} 
                      href={`/channels/${guild._id}/${channel._id}`}
                      onClick={() => onSelectChannel(channel)}
                    >
                      <button 
                        className={`group flex w-full items-center rounded px-2 py-1 text-sm ${
                          selectedChannel && selectedChannel._id === channel._id 
                            ? "bg-discord-300 text-white" 
                            : "text-gray-400 hover:bg-discord-300/50 hover:text-gray-300"
                        }`}
                      >
                        {channel.type === "text" ? (
                          <Hash size={18} className="mr-1.5 flex-shrink-0" />
                        ) : (
                          <Volume2 size={18} className="mr-1.5 flex-shrink-0" />
                        )}
                        <span className="truncate">{channel.name}</span>
                      </button>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {type === "dm" && (
          <div className="px-2 py-4">
            <Link href="/channels/@me/friends">
              <button 
                className={`group flex w-full items-center rounded px-2 py-1 text-sm mb-2 ${
                  pathname === "/channels/@me/friends" 
                    ? "bg-discord-300 text-white" 
                    : "text-gray-400 hover:bg-discord-300/50 hover:text-gray-300"
                }`}
              >
                <Users size={18} className="mr-1.5 flex-shrink-0" />
                <span className="truncate">Friends</span>
              </button>
            </Link>
            
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between px-2">
                <span className="text-xs font-semibold uppercase text-gray-400">
                  DIRECT MESSAGES
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 text-gray-400 hover:text-white"
                  onClick={() => router.push("/channels/@me/friends")}
                >
                  <Plus size={14} />
                </Button>
              </div>
              
              <DirectMessageList 
                directMessages={directMessages} 
                onSelectDM={onSelectDM}
                selectedDM={selectedDM}
                currentUser={user}
              />
            </div>
          </div>
        )}
        
        {type === "friends" && (
          <div className="px-2 py-4">
            <Link href="/channels/@me">
              <button 
                className={`group flex w-full items-center rounded px-2 py-1 text-sm mb-2 ${
                  pathname === "/channels/@me" 
                    ? "bg-discord-300 text-white" 
                    : "text-gray-400 hover:bg-discord-300/50 hover:text-gray-300"
                }`}
              >
                <MessageSquare size={18} className="mr-1.5 flex-shrink-0" />
                <span className="truncate">Direct Messages</span>
              </button>
            </Link>
            
            <div className="mb-1 flex items-center justify-between px-2">
              <span className="text-xs font-semibold uppercase text-gray-400">
                FRIENDS
              </span>
            </div>
            
            <div className="space-y-1">
              <Link href="/channels/@me/friends">
                <button 
                  className={`group flex w-full items-center rounded px-2 py-1 text-sm ${
                    pathname === "/channels/@me/friends" 
                      ? "bg-discord-300 text-white" 
                      : "text-gray-400 hover:bg-discord-300/50 hover:text-gray-300"
                  }`}
                >
                  <Users size={18} className="mr-1.5 flex-shrink-0" />
                  <span className="truncate">All Friends</span>
                </button>
              </Link>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* User Controls */}
      <div className="flex h-[52px] items-center justify-between bg-discord-500 px-2">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}`} />
            <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <div className="font-medium">{user?.username}</div>
            <div className="text-xs text-gray-400">#{user?.discriminator || "0000"}</div>
          </div>
        </div>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
            <Mic size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
            <Headphones size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={handleLogout}>
            <LogOut size={18} />
          </Button>
        </div>
      </div>

      {/* Create Channel Dialog */}
      <Dialog open={isCreateChannelOpen} onOpenChange={setIsCreateChannelOpen}>
        <DialogContent className="bg-discord-300 text-white border-none">
          <DialogHeader>
            <DialogTitle>Create Channel</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new channel in {guild?.name}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateChannel}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="channel-type">CHANNEL TYPE</Label>
                <Select 
                  value={newChannelType} 
                  onValueChange={setNewChannelType}
                >
                  <SelectTrigger className="bg-discord-400 border-none">
                    <SelectValue placeholder="Select channel type" />
                  </SelectTrigger>
                  <SelectContent className="bg-discord-400 border-none">
                    <SelectItem value="text">Text Channel</SelectItem>
                    <SelectItem value="voice">Voice Channel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="channel-name">CHANNEL NAME</Label>
                <div className="flex items-center space-x-2 bg-discord-400 rounded-md px-3">
                  {newChannelType === "text" ? (
                    <Hash size={18} className="text-gray-400" />
                  ) : (
                    <Volume2 size={18} className="text-gray-400" />
                  )}
                  <Input
                    id="channel-name"
                    placeholder="new-channel"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    className="bg-transparent border-none pl-0"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setIsCreateChannelOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!newChannelName.trim() || isCreating}
                className="bg-discord-100 hover:bg-discord-100/90"
              >
                {isCreating ? "Creating..." : "Create Channel"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
