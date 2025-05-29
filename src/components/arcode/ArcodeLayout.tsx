"use client";

import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import ActivityBar from './ActivityBar';
import SidebarContainer from './SidebarContainer';
import EditorArea from './EditorArea';
import PanelContainer from './PanelContainer';
import StatusBar from './StatusBar';
import { useArcodeContext } from '@/hooks/useArcodeContext';

const ArcodeLayout: React.FC = () => {
  const { isPanelOpen, setPanelOpen } = useArcodeContext();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
      <ResizablePanelGroup direction="horizontal" className="flex-grow">
        <ResizablePanel defaultSize={3} maxSize={5} minSize={3} className="!overflow-visible"> 
          {/* The !overflow-visible is a hack for tooltips in activity bar, better solutions might exist */}
          <ActivityBar />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
          <SidebarContainer />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={77}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={isPanelOpen ? 70 : 100} minSize={30}>
              <EditorArea />
            </ResizablePanel>
            {isPanelOpen && <ResizableHandle />}
            {isPanelOpen && (
              <ResizablePanel defaultSize={30} minSize={10} maxSize={50} onCollapse={() => setPanelOpen(false)} collapsible>
                <PanelContainer />
              </ResizablePanel>
            )}
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
      <StatusBar />
    </div>
  );
};

export default ArcodeLayout;
