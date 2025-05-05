"use client"

import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { WebSocketProvider } from "@/context/WebSocketContext";


const AppContent = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return (
    <div className="flex h-screen bg-[#EEF7FE]">
      {user && <Sidebar />}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}


export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode;}>) {
  return (
    <html>
      <body>
        <AuthProvider>
          <WebSocketProvider>
            <AppContent>{children}</AppContent>
          </WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
