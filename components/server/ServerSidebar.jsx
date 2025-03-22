
"use client"

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { fetchGuilds, createGuild } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Home, Plus, Compass, Download } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export default function ServerSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { toast } = useToast();
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGuildName, setNewGuildName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const loadGuilds = async () => {
      try {
        const guildsData = await fetchGuilds();
        setGuilds(guildsData);
      } catch (error) {
        console.error("Failed to load guilds:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadGuilds();
    }
  }, [user]);

  const handleCreateGuild = async (e) => {
    e.preventDefault();
    if (!newGuildName.trim()) return;
    
    setIsCreating(true);
    try {
      const newGuild = await createGuild({ name: newGuildName });
      setGuilds([...guilds, newGuild]);
      setNewGuildName("");
      setIsCreateDialogOpen(false);
      
      // Navigate to the new guild
      router.push(`/channels/${newGuild._id}`);
      
      toast({
        title: "Success",
        description: `Server "${newGuild.name}" has been created!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create server",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex h-screen w-[72px] flex-col items-center bg-discord-500 py-3">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/channels/@me">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`mb-2 rounded-[16px] bg-discord-400 transition-all hover:bg-discord-100 hover:rounded-[12px] ${
                  pathname === "/channels/@me" ? "bg-discord-100 rounded-[12px] text-white" : "text-gray-400"
                }`}
              >
                <Home size={24} />
                <span className="sr-only">Home</span>
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            Direct Messages
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Separator className="mx-auto my-2 h-[2px] w-8 rounded-full bg-discord-400" />

      <div className="flex-1 overflow-y-auto py-2 w-full flex flex-col items-center space-y-2">
        {loading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="h-12 w-12 rounded-full bg-discord-400"></div>
          </div>
        ) : (
          guilds.map((guild) => (
            <TooltipProvider key={guild._id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/channels/${guild._id}`}>
                    <div className="relative group">
                      <div className={`absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-2/5 rounded-r-full transition-all ${
                        pathname.includes(`/channels/${guild._id}`) 
                          ? "bg-white h-4/5" 
                          : "bg-white group-hover:h-1/5 opacity-0 group-hover:opacity-100"
                      }`}></div>
                      <Avatar className={`h-12 w-12 cursor-pointer transition-all ${
                        pathname.includes(`/channels/${guild._id}`) 
                          ? "rounded-[12px]" 
                          : "rounded-[24px] group-hover:rounded-[16px]"
                      }`}>
                        <AvatarImage src={guild.icon || `https://ui-avatars.com/api/?name=${guild.name}`} />
                        <AvatarFallback className="bg-discord-400 text-white">
                          {guild.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {guild.name}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))
        )}
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-discord-400 text-green-500 hover:bg-green-500 hover:text-white"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus size={24} />
              <span className="sr-only">Add Server</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            Add a Server
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Separator className="mx-auto my-2 h-[2px] w-8 rounded-full bg-discord-400" />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-discord-400 text-green-500 hover:bg-green-500 hover:text-white"
            >
              <Compass size={24} />
              <span className="sr-only">Explore Servers</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            Explore Servers
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-discord-300 text-white border-none">
          <DialogHeader>
            <DialogTitle>Create a new server</DialogTitle>
            <DialogDescription className="text-gray-400">
              Your server is where you and your friends hang out. Make yours and start talking.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateGuild}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">SERVER NAME</Label>
                <Input
                  id="name"
                  placeholder="Enter server name"
                  value={newGuildName}
                  onChange={(e) => setNewGuildName(e.target.value)}
                  className="bg-discord-400 border-none"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!newGuildName.trim() || isCreating}
                className="bg-discord-100 hover:bg-discord-100/90"
              >
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
