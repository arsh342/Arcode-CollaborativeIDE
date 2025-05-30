
"use client";

import React from 'react';
import { useArcodeContext } from '@/hooks/useArcodeContext';
import AiAssistantPanel from './AiAssistantPanel';
import ChatPanel from './ChatPanel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RightSidebarContent: React.FC = () => {
  const { activeView } = useArcodeContext();

  const renderView = () => {
    switch (activeView) {
      case 'ai':
        return <AiAssistantPanel />;
      case 'chat':
        return <ChatPanel />;
      default:
        // This case should ideally not be reached if logic in ActivityBar is correct
        // and panel is only open for 'ai' or 'chat'
        return (
            <Card className="h-full border-0 shadow-none rounded-none">
              <CardHeader className="py-2 px-3 border-b">
                <CardTitle className="text-xs font-medium uppercase tracking-wider">Info</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-sm text-muted-foreground">Select AI Assistant or Chat from the activity bar.</p>
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

export default RightSidebarContent;
