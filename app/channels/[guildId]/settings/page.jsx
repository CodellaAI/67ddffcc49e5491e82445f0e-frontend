
"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchGuild, updateGuild, deleteGuild, createInvite } from "@/lib/api";
import ChannelSidebar from "@/components/channel/ChannelSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { 
  Settings, 
  Users, 
  Shield, 
  Link, 
  Trash2,
  Copy,
  AlertTriangle
} from "lucide-react";

export default function GuildSettingsPage({ params }) {
  const { guildId } = params;
  const router = useRouter();
  const { toast } = useToast();
  const [guild, setGuild] = useState(null);
  const [channels, setChannels] = useState([]);
  const [guildName, setGuildName] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generatingInvite, setGeneratingInvite] = useState(false);

  useEffect(() => {
    const loadGuildData = async () => {
      try {
        const guildData = await fetchGuild(guildId);
        setGuild(guildData);
        setGuildName(guildData.name);
      } catch (error) {
        console.error("Failed to load guild data:", error);
        toast({
          title: "Error",
          description: "Failed to load server settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (guildId) {
      loadGuildData();
    }
  }, [guildId, toast]);

  const handleSaveChanges = async () => {
    if (!guildName.trim()) return;
    
    setSaving(true);
    try {
      const updatedGuild = await updateGuild(guildId, { name: guildName });
      setGuild(updatedGuild);
      toast({
        title: "Success",
        description: "Server settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update server settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGuild = async () => {
    if (!window.confirm("Are you sure you want to delete this server? This action cannot be undone.")) {
      return;
    }
    
    setDeleting(true);
    try {
      await deleteGuild(guildId);
      toast({
        title: "Success",
        description: "Server deleted successfully",
      });
      router.push("/channels/@me");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete server",
        variant: "destructive",
      });
      setDeleting(false);
    }
  };

  const handleGenerateInvite = async () => {
    setGeneratingInvite(true);
    try {
      const invite = await createInvite(guildId);
      setInviteLink(`${window.location.origin}/invite/${invite.code}`);
      toast({
        title: "Success",
        description: "Invite link generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate invite link",
        variant: "destructive",
      });
    } finally {
      setGeneratingInvite(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Copied",
      description: "Invite link copied to clipboard",
    });
  };

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
          <h3 className="text-xl font-medium">Server not found</h3>
          <p className="mt-2 text-gray-400">The server you're looking for doesn't exist or you don't have access.</p>
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
      />
      
      <div className="flex flex-1 flex-col bg-discord-300 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <Settings className="mr-2" />
            <h1 className="text-2xl font-bold">{guild.name} - Server Settings</h1>
          </div>
          
          <Tabs defaultValue="overview" className="w-full">
            <div className="flex">
              <div className="w-64 pr-4">
                <TabsList className="flex flex-col items-start h-auto bg-transparent space-y-1">
                  <TabsTrigger 
                    value="overview" 
                    className="w-full justify-start px-3 py-2 text-left data-[state=active]:bg-discord-400"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="roles" 
                    className="w-full justify-start px-3 py-2 text-left data-[state=active]:bg-discord-400"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Roles
                  </TabsTrigger>
                  <TabsTrigger 
                    value="members" 
                    className="w-full justify-start px-3 py-2 text-left data-[state=active]:bg-discord-400"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Members
                  </TabsTrigger>
                  <TabsTrigger 
                    value="invites" 
                    className="w-full justify-start px-3 py-2 text-left data-[state=active]:bg-discord-400"
                  >
                    <Link className="mr-2 h-4 w-4" />
                    Invites
                  </TabsTrigger>
                  
                  <Separator className="my-2" />
                  
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start mt-auto"
                    onClick={handleDeleteGuild}
                    disabled={deleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Server
                  </Button>
                </TabsList>
              </div>
              
              <div className="flex-1 border-l border-discord-400 pl-6">
                <TabsContent value="overview" className="mt-0">
                  <h3 className="text-xl font-semibold mb-4">Server Overview</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={guild.icon || `https://ui-avatars.com/api/?name=${guild.name}`} />
                        <AvatarFallback>{guild.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <p className="text-sm text-gray-400 mb-1">
                          We recommend an image of at least 512x512 for the server.
                        </p>
                        <Button variant="secondary" size="sm">
                          Upload Image
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="server-name">SERVER NAME</Label>
                      <Input
                        id="server-name"
                        value={guildName}
                        onChange={(e) => setGuildName(e.target.value)}
                        className="bg-discord-400 border-none"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleSaveChanges} 
                      disabled={saving || !guildName.trim() || guildName === guild.name}
                      className="bg-discord-100 hover:bg-discord-100/90"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="roles" className="mt-0">
                  <h3 className="text-xl font-semibold mb-4">Roles</h3>
                  
                  <div className="bg-discord-400 rounded-md p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Server Roles</h4>
                      <Button size="sm" className="bg-discord-100 hover:bg-discord-100/90">
                        Create Role
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-discord-300 rounded-md">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-discord-100 mr-3"></div>
                          <span>Admin</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-discord-300 rounded-md">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                          <span>Moderator</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-discord-300 rounded-md">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-gray-400 mr-3"></div>
                          <span>@everyone</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="members" className="mt-0">
                  <h3 className="text-xl font-semibold mb-4">Members</h3>
                  
                  <div className="bg-discord-400 rounded-md p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Server Members</h4>
                      <Input 
                        placeholder="Search members" 
                        className="w-64 bg-discord-500 border-none"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      {guild.members && guild.members.map((member) => (
                        <div key={member._id} className="flex items-center justify-between p-3 bg-discord-300 rounded-md">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-3">
                              <AvatarImage src={member.avatar || `https://ui-avatars.com/api/?name=${member.username}`} />
                              <AvatarFallback>{member.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span>{member.username}</span>
                          </div>
                          <div>
                            <Button variant="ghost" size="sm">
                              Manage
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {(!guild.members || guild.members.length === 0) && (
                        <div className="text-center py-4 text-gray-400">
                          No members found
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="invites" className="mt-0">
                  <h3 className="text-xl font-semibold mb-4">Invites</h3>
                  
                  <div className="bg-discord-400 rounded-md p-4">
                    <p className="mb-4 text-sm text-gray-400">
                      Create an invite link to share with others. Invite links can be set to expire.
                    </p>
                    
                    <Button 
                      onClick={handleGenerateInvite} 
                      disabled={generatingInvite}
                      className="bg-discord-100 hover:bg-discord-100/90 mb-4"
                    >
                      {generatingInvite ? "Generating..." : "Generate New Invite"}
                    </Button>
                    
                    {inviteLink && (
                      <div className="flex items-center mt-4 p-3 bg-discord-300 rounded-md">
                        <Input 
                          value={inviteLink} 
                          readOnly 
                          className="bg-discord-500 border-none mr-2"
                        />
                        <Button variant="ghost" size="icon" onClick={copyInviteLink}>
                          <Copy size={18} />
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </>
  );
}
