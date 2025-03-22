
"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getInvite, acceptInvite } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/useToast";
import { Users, ArrowRight, Loader2 } from "lucide-react";

export default function InvitePage({ params }) {
  const { code } = params;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInviteDetails = async () => {
      try {
        const inviteData = await getInvite(code);
        setInvite(inviteData);
      } catch (error) {
        setError("This invite is invalid or has expired");
        console.error("Failed to fetch invite:", error);
      } finally {
        setLoading(false);
      }
    };

    if (code && !authLoading) {
      fetchInviteDetails();
    }
  }, [code, authLoading]);

  const handleJoinServer = async () => {
    if (!user) {
      router.push(`/login?redirect=/invite/${code}`);
      return;
    }

    setJoining(true);
    try {
      await acceptInvite(code);
      toast({
        title: "Success",
        description: `You've joined ${invite.guild.name}!`,
      });
      router.push(`/channels/${invite.guild._id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to join server",
        variant: "destructive",
      });
      setJoining(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-discord-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-discord-100 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-discord-400 p-4 text-center">
        <div className="rounded-lg bg-discord-300 p-8 shadow-lg">
          <div className="mb-4 rounded-full bg-red-500/20 p-3 text-red-400 mx-auto w-fit">
            <Users size={32} />
          </div>
          <h2 className="mb-2 text-2xl font-bold">Invalid Invite</h2>
          <p className="mb-6 text-gray-400">{error}</p>
          <Button 
            onClick={() => router.push("/channels/@me")} 
            className="bg-discord-100 hover:bg-discord-100/90"
          >
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  if (!invite) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-discord-400 p-4">
      <div className="w-full max-w-md rounded-lg bg-discord-300 p-8 shadow-lg">
        <div className="mb-6 text-center">
          <Avatar className="mx-auto h-20 w-20 mb-4">
            <AvatarImage src={invite.guild.icon || `https://ui-avatars.com/api/?name=${invite.guild.name}`} />
            <AvatarFallback>{invite.guild.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold">{invite.guild.name}</h2>
          <div className="mt-2 flex items-center justify-center text-sm text-gray-400">
            <Users size={16} className="mr-1" />
            <span>{invite.guild.memberCount || 0} Members</span>
          </div>
        </div>

        <div className="rounded-md bg-discord-400 p-4 mb-6">
          <p className="text-sm text-gray-300">
            You've been invited to join <strong>{invite.guild.name}</strong>
          </p>
          {invite.inviter && (
            <div className="mt-3 flex items-center text-sm text-gray-400">
              <span>Invited by {invite.inviter.username}</span>
            </div>
          )}
        </div>

        {user ? (
          <Button 
            onClick={handleJoinServer} 
            disabled={joining} 
            className="w-full bg-discord-100 hover:bg-discord-100/90"
          >
            {joining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                Accept Invite
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <Button 
              onClick={() => router.push(`/login?redirect=/invite/${code}`)} 
              className="w-full bg-discord-100 hover:bg-discord-100/90"
            >
              Login
            </Button>
            <Button 
              onClick={() => router.push(`/register?redirect=/invite/${code}`)} 
              variant="outline" 
              className="w-full"
            >
              Register
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
