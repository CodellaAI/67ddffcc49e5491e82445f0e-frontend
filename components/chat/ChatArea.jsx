
"use client"

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { fetchMessages, sendMessage } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Hash, Users, Smile, PlusCircle, Gift, GIF } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

export default function ChatArea({ 
  type = "channel", 
  channel = null, 
  guild = null,
  recipient = null,
  channelId = null
}) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        let messagesData;
        if (type === "channel" && channel) {
          messagesData = await fetchMessages("channel", channel._id);
        } else if (type === "directMessage" && recipient) {
          messagesData = await fetchMessages("directMessage", channelId);
        }
        
        setMessages(messagesData || []);
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if ((type === "channel" && channel) || (type === "directMessage" && recipient)) {
      loadMessages();
    }
  }, [type, channel, recipient, channelId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      // Check if this message belongs to the current channel/DM
      if (
        (type === "channel" && message.channel === channel?._id) ||
        (type === "directMessage" && 
         ((message.sender._id === user?._id && message.recipient._id === recipient?._id) ||
          (message.sender._id === recipient?._id && message.recipient._id === user?._id)))
      ) {
        setMessages(prev => [...prev, message]);
      }
    };

    socket.on("message", handleNewMessage);
    socket.on("directMessage", handleNewMessage);
    
    return () => {
      socket.off("message", handleNewMessage);
      socket.off("directMessage", handleNewMessage);
    };
  }, [socket, type, channel, recipient, user]);

  useEffect(() => {
    // Handle clicks outside of emoji picker to close it
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;
    
    try {
      if (type === "channel" && channel) {
        await sendMessage({
          content: messageInput,
          channelId: channel._id,
          type: "channel"
        });
      } else if (type === "directMessage" && recipient) {
        await sendMessage({
          content: messageInput,
          recipientId: recipient._id,
          type: "directMessage"
        });
      }
      
      setMessageInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessageInput(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Channel/DM Header */}
      <header className="flex h-12 items-center border-b border-discord-400 px-4 shadow-sm">
        {type === "channel" ? (
          <>
            <Hash size={24} className="mr-2 text-gray-400" />
            <div>
              <h2 className="font-medium">{channel?.name}</h2>
              <p className="text-xs text-gray-400">{channel?.topic || "No topic set"}</p>
            </div>
          </>
        ) : (
          <>
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={recipient?.avatar || `https://ui-avatars.com/api/?name=${recipient?.username}`} />
              <AvatarFallback>{recipient?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-medium">{recipient?.username}</h2>
              <p className="text-xs text-gray-400">{recipient?.status || "Offline"}</p>
            </div>
          </>
        )}

        <div className="ml-auto flex items-center space-x-2">
          {type === "channel" && (
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Users size={20} />
            </Button>
          )}
        </div>
      </header>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-discord-100 border-t-transparent"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="rounded-full bg-discord-400 p-6 mb-4">
              {type === "channel" ? (
                <Hash size={32} className="text-gray-300" />
              ) : (
                <Avatar className="h-16 w-16">
                  <AvatarImage src={recipient?.avatar || `https://ui-avatars.com/api/?name=${recipient?.username}`} />
                  <AvatarFallback>{recipient?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              )}
            </div>
            <h3 className="text-xl font-medium">
              {type === "channel" 
                ? `Welcome to #${channel?.name}!` 
                : `This is the beginning of your direct message history with ${recipient?.username}`
              }
            </h3>
            <p className="mt-2 text-gray-400 max-w-md">
              {type === "channel"
                ? `This is the start of the #${channel?.name} channel. Send a message to start the conversation!`
                : `Send a message to start the conversation!`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              // Check if the previous message is from the same user
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const isSameUser = prevMessage && prevMessage.sender._id === message.sender._id;
              const isWithinTimeWindow = prevMessage && 
                (new Date(message.createdAt) - new Date(prevMessage.createdAt)) < 5 * 60 * 1000; // 5 minutes
              
              const showFullHeader = !isSameUser || !isWithinTimeWindow;
              
              return (
                <div key={message._id} className={`flex ${showFullHeader ? 'mt-4' : 'mt-0.5'}`}>
                  {showFullHeader ? (
                    <Avatar className="mt-0.5 h-10 w-10 mr-3">
                      <AvatarImage src={message.sender.avatar || `https://ui-avatars.com/api/?name=${message.sender.username}`} />
                      <AvatarFallback>{message.sender.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-10 mr-3"></div>
                  )}
                  
                  <div className="flex-1">
                    {showFullHeader && (
                      <div className="flex items-baseline">
                        <span className="font-medium">{message.sender.username}</span>
                        <span className="ml-2 text-xs text-gray-400">
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                    <p className="text-gray-200">{message.content}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4">
        <form onSubmit={handleSendMessage} className="relative">
          <div className="flex items-center rounded-md bg-discord-500 px-4">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-white"
            >
              <PlusCircle size={20} />
            </Button>
            
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={type === "channel" 
                ? `Message #${channel?.name}` 
                : `Message @${recipient?.username}`
              }
              className="flex-1 border-none bg-transparent"
            />
            
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-white"
            >
              <Gift size={20} />
            </Button>
            
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-white"
            >
              <GIF size={20} />
            </Button>
            
            <div className="relative">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-white"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile size={20} />
              </Button>
              
              {showEmojiPicker && (
                <div 
                  ref={emojiPickerRef} 
                  className="absolute bottom-12 right-0 z-10"
                >
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
