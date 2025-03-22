
"use client"

import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/contexts/AuthContext"
import { SocketProvider } from "@/contexts/SocketContext"

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <AuthProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
