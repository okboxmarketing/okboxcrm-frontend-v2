"use client";

import { ReactNode } from "react";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { AppSidebar } from "@/components/sidebar/new-sidebar";
import { WebSocketProvider } from "@/components/providers/websocket-provider";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {

  return (
    <WebSocketProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 pt-0">{children}</div>
          <Toaster />
        </SidebarInset>
      </SidebarProvider>
    </WebSocketProvider>
  );
}
