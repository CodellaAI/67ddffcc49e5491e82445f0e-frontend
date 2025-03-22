
"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { fetchFriends, sendFriendRequest } from "@/lib/api";
import ChannelSidebar from "@/components/channel/ChannelSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  UserPlus, 
  Users, 
  Clock, 
  Check, 
  X, 
  MoreVertical,
  MessageSquare 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";

export default function FriendsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friendUsername, setFriendUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const data = await fetchFriends();
        
        // Separate friends and pending requests
        const accepted = data.filter(f => f.status === "accepted");
        const pending = data.filter(f => f.status === "pending");
        
        setFriends(accepted);
        setPendingRequests(pending);
      } catch (error) {
        console.error("Failed to load friends:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadFriends();
    }
  }, [user]);

  const handleSendFriendRequest = async (e) => {
    e.preventDefault();
    
    if (!friendUsername.trim()) return;
    
    setSendingRequest(true);
    try {
      await sendFriendRequest(friendUsername);
      toast({
        title: "Friend request sent",
        description: `Your friend request to ${friendUsername} has been sent.`,
      });
      setFriendUsername("");
      
      // Refresh the friends list
      const data = await fetchFriends();
      const accepted = data.filter(f => f.status === "accepted");
      const pending = data.filter(f => f.status === "pending");
      setFriends(accepted);
      setPendingRequests(pending);
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send friend request",
        variant: "destructive",
      });
    } finally {
      setSendingRequest(false);
    }
  };

  const startDirectMessage = (friendId) => {
    // Find the friend in the friends list
    const friend = friends.find(f => f._id === friendId);
    if (friend) {
      // Navigate to direct message with this friend
      router.push(`/channels/@me/${friendId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-discord-100 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <ChannelSidebar type="friends" />
      
      <div className="flex flex-1 flex-col bg-discord-300">
        <div className="border-b border-discord-400 p-4">
          <h1 className="text-xl font-bold">Friends</h1>
          
          <Tabs defaultValue="all" className="mt-4">
            <TabsList className="bg-discord-400">
              <TabsTrigger value="all" className="data-[state=active]:bg-discord-300">
                All
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-discord-300">
                Pending ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="add" className="data-[state=active]:bg-discord-300">
                Add Friend
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {friends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
                  <Users size={48} className="mb-4" />
                  <h3 className="text-xl font-medium">No friends yet</h3>
                  <p className="mt-2">Add some friends to get started!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <div key={friend._id} className="flex items-center justify-between rounded-md p-3 hover:bg-discord-400">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={friend.avatar || `https://ui-avatars.com/api/?name=${friend.username}`} />
                          <AvatarFallback>{friend.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <p className="font-medium">{friend.username}</p>
                          <p className="text-sm text-gray-400">{friend.status || "Offline"}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => startDirectMessage(friend._id)}
                          className="text-gray-400 hover:bg-discord-200 hover:text-white"
                        >
                          <MessageSquare size={20} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-gray-400 hover:bg-discord-200 hover:text-white"
                        >
                          <MoreVertical size={20} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pending" className="mt-4">
              {pendingRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
                  <Clock size={48} className="mb-4" />
                  <h3 className="text-xl font-medium">No pending requests</h3>
                  <p className="mt-2">Friend requests you've sent or received will show up here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingRequests.map((request) => (
                    <div key={request._id} className="flex items-center justify-between rounded-md p-3 hover:bg-discord-400">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={request.avatar || `https://ui-avatars.com/api/?name=${request.username}`} />
                          <AvatarFallback>{request.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <p className="font-medium">{request.username}</p>
                          <p className="text-sm text-gray-400">
                            {request.sender._id === user._id ? "Outgoing Request" : "Incoming Request"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {request.sender._id !== user._id && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-green-500 hover:bg-green-500/20"
                            >
                              <Check size={20} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:bg-red-500/20"
                            >
                              <X size={20} />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="add" className="mt-4">
              <div className="rounded-md bg-discord-400 p-4">
                <h3 className="mb-2 text-lg font-medium">ADD FRIEND</h3>
                <p className="mb-4 text-sm text-gray-400">You can add a friend with their Discord username.</p>
                
                <form onSubmit={handleSendFriendRequest} className="flex items-center space-x-2">
                  <Input
                    value={friendUsername}
                    onChange={(e) => setFriendUsername(e.target.value)}
                    placeholder="Enter a username"
                    className="flex-1 bg-discord-500 border-none"
                  />
                  <Button 
                    type="submit" 
                    disabled={!friendUsername.trim() || sendingRequest}
                    className="bg-discord-100 hover:bg-discord-100/90"
                  >
                    {sendingRequest ? "Sending..." : "Send Friend Request"}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
