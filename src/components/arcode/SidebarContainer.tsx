"use client";

import React from 'react';
import { useArcodeContext } from '@/hooks/useArcodeContext';
import FileExplorer from './FileExplorer';
import AiAssistantPanel from './AiAssistantPanel';
import ChatPanel from './ChatPanel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const SidebarContainer: React.FC = () => {
  const { activeView } = useArcodeContext();

  const renderView = () => {
    switch (activeView) {
      case 'explorer':
        return <FileExplorer />;
      case 'ai':
        return <AiAssistantPanel />;
      case 'chat':
        return <ChatPanel />;
      case 'settings':
        return (
            <Card className="h-full border-0 shadow-none rounded-none">
              <CardHeader>
                <CardTitle className="text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Settings panel is under construction.</p>
                <p className="text-sm mt-2">Configure your Arcode experience here.</p>
              </CardContent>
            </Card>
        );
      default:
        return (
          <div className="p-4">
            <p className="text-sm text-muted-foreground">View not implemented yet.</p>
          </div>
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
