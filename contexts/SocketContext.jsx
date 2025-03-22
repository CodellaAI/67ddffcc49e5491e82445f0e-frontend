
"use client"

import { createContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import Cookies from "js-cookie";

export const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Initialize socket connection
    const token = Cookies.get("token");
    if (!token) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL, {
      auth: {
        token
      }
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected");
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}
