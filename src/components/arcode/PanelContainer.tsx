"use client";

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import TerminalPanel from './TerminalPanel';
import { useArcodeContext } from '@/hooks/useArcodeContext';
import type { ActivePanel } from '@/types/arcode';

const PanelContainer: React.FC = () => {
  const { activePanel, setActivePanel } = useArcodeContext();

  return (
    <div className="h-full flex flex-col bg-muted/30">
      <Tabs value={activePanel} onValueChange={(value) => setActivePanel(value as ActivePanel)} className="flex flex-col h-full">
        <TabsList className="bg-muted/50 rounded-none justify-start px-1 border-b h-9">
          <TabsTrigger value="terminal" className="text-xs px-3 py-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">Terminal</TabsTrigger>
          <TabsTrigger value="problems" className="text-xs px-3 py-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm" disabled>Problems</TabsTrigger>
          <TabsTrigger value="output" className="text-xs px-3 py-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm" disabled>Output</TabsTrigger>
          <TabsTrigger value="debug" className="text-xs px-3 py-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm" disabled>Debug Console</TabsTrigger>
        </TabsList>
        <TabsContent value="terminal" className="flex-grow mt-0 overflow-y-auto">
          <TerminalPanel />
        </TabsContent>
        <TabsContent value="problems" className="flex-grow mt-0 p-4 text-sm text-muted-foreground">Problems panel is under construction.</TabsContent>
        <TabsContent value="output" className="flex-grow mt-0 p-4 text-sm text-muted-foreground">Output panel is under construction.</TabsContent>
        <TabsContent value="debug" className="flex-grow mt-0 p-4 text-sm text-muted-foreground">Debug Console is under construction.</TabsContent>
      </Tabs>
    </div>
  );
};

export default PanelContainer;
