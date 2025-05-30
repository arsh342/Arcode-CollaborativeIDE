
"use client";

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import TerminalPanel from './TerminalPanel';
import { useArcodeContext } from '@/hooks/useArcodeContext';
import type { ActivePanel } from '@/types/arcode';
import { PlusCircle, XIcon } from 'lucide-react';

const PanelContainer: React.FC = () => {
  const { 
    activePanel, 
    setActivePanel,
    terminalSessions,
    activeTerminalId,
    createTerminalSession,
    closeTerminalSession,
    setActiveTerminalId
  } = useArcodeContext();

  return (
    <div className="h-full flex flex-col bg-muted/30">
      <Tabs value={activePanel} onValueChange={(value) => setActivePanel(value as ActivePanel)} className="flex flex-col h-full">
        <TabsList className="bg-muted/50 rounded-none justify-start px-1 border-b h-9">
          <TabsTrigger value="terminal" className="text-xs px-3 py-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">Terminal</TabsTrigger>
          <TabsTrigger value="problems" className="text-xs px-3 py-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm" disabled>Problems</TabsTrigger>
          <TabsTrigger value="output" className="text-xs px-3 py-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm" disabled>Output</TabsTrigger>
          <TabsTrigger value="debug" className="text-xs px-3 py-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm" disabled>Debug Console</TabsTrigger>
        </TabsList>
        
        <TabsContent value="terminal" className="flex-grow mt-0 flex flex-col overflow-hidden">
          {terminalSessions.length > 0 && (
            <div className="flex items-center border-b bg-muted/40 h-9 shrink-0">
              <ScrollArea className="flex-grow whitespace-nowrap">
                <div className="flex items-center h-full px-1">
                  {terminalSessions.map(session => (
                    <Button
                      key={session.id}
                      variant="ghost"
                      size="sm"
                      className={`h-full px-2.5 py-1 rounded-none border-r 
                        ${session.id === activeTerminalId 
                          ? 'bg-background text-primary shadow-sm' 
                          : 'text-muted-foreground hover:bg-background/80 hover:text-foreground'
                        }
                      `}
                      onClick={() => setActiveTerminalId(session.id)}
                    >
                      <span className="truncate max-w-[120px] text-xs">{session.name}</span>
                      <XIcon
                        size={13}
                        className="ml-1.5 text-muted-foreground hover:text-foreground opacity-50 hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTerminalSession(session.id);
                        }}
                      />
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
              <Button variant="ghost" size="icon" className="h-full w-9 rounded-none border-l" onClick={createTerminalSession}>
                <PlusCircle size={16} />
              </Button>
            </div>
          )}
          {terminalSessions.length === 0 && (
             <div className="flex items-center justify-center flex-col flex-grow p-4">
                <p className="text-sm text-muted-foreground mb-2">No terminal sessions open.</p>
                <Button size="sm" onClick={createTerminalSession}>
                    <PlusCircle size={16} className="mr-2"/> Create New Terminal
                </Button>
             </div>
          )}
          {terminalSessions.length > 0 && <TerminalPanel />}
        </TabsContent>

        <TabsContent value="problems" className="flex-grow mt-0 p-4 text-sm text-muted-foreground">Problems panel is under construction.</TabsContent>
        <TabsContent value="output" className="flex-grow mt-0 p-4 text-sm text-muted-foreground">Output panel is under construction.</TabsContent>
        <TabsContent value="debug" className="flex-grow mt-0 p-4 text-sm text-muted-foreground">Debug Console is under construction.</TabsContent>
      </Tabs>
    </div>
  );
};

export default PanelContainer;
