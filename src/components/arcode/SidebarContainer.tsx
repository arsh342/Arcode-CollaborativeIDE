
"use client";

import React from 'react';
import { useArcodeContext } from '@/hooks/useArcodeContext';
import FileExplorer from './FileExplorer';
// AI Assistant and Chat Panel are now rendered in RightSidebarContent
// import AiAssistantPanel from './AiAssistantPanel';
// import ChatPanel from './ChatPanel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// This component now serves as the LEFT sidebar container

const SidebarContainer: React.FC = () => {
  const { activeView } = useArcodeContext();

  const renderView = () => {
    switch (activeView) {
      case 'explorer':
        return <FileExplorer />;
      case 'settings':
        return (
            <Card className="h-full border-0 shadow-none rounded-none">
              <CardHeader className="py-2 px-3 border-b">
                <CardTitle className="text-xs font-medium uppercase tracking-wider">Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-sm text-muted-foreground">Settings panel is under construction.</p>
                <p className="text-sm mt-2">Configure your Arcode experience here.</p>
              </CardContent>
            </Card>
        );
      // AI and Chat are handled by RightSidebarContent now
      case 'ai':
      case 'chat':
        // Optionally, show a message or keep explorer open if preferred.
        // For now, let's keep rendering explorer if AI/Chat is active but right panel is closed.
        // Or, if activeView is AI/Chat, this left panel could be empty or show Explorer by default.
        // Let's default to explorer if the activeView is for the right panel.
        if (activeView === 'ai' || activeView === 'chat') {
             return <FileExplorer />; // Or null if you want it empty
        }
        return <FileExplorer />; // Default to explorer
      default:
        // For Search, Source Control etc. which are not yet implemented
        return (
          <Card className="h-full border-0 shadow-none rounded-none">
            <CardHeader className="py-2 px-3 border-b">
                <CardTitle className="text-xs font-medium uppercase tracking-wider">{activeView}</CardTitle>
              </CardHeader>
            <CardContent className="p-3">
              <p className="text-sm text-muted-foreground">View not implemented yet for '{activeView}'.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="h-full w-full bg-card flex flex-col overflow-hidden">
      <ScrollArea className="flex-grow">
        {renderView()}
      </ScrollArea>
    </div>
  );
};

export default SidebarContainer;
