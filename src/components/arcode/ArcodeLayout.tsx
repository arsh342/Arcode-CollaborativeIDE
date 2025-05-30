
"use client";

import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import ActivityBar from './ActivityBar';
import SidebarContainer from './SidebarContainer'; // This is the left sidebar
import EditorArea from './EditorArea';
import PanelContainer from './PanelContainer'; // This is the bottom panel
import RightSidebarContent from './RightSidebarContent'; // New component for right sidebar
import StatusBar from './StatusBar';
import { useArcodeContext } from '@/hooks/useArcodeContext';

const ArcodeLayout: React.FC = () => {
  const { isPanelOpen, setPanelOpen, isRightPanelOpen, setRightPanelOpen } = useArcodeContext();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
      <ResizablePanelGroup direction="horizontal" className="flex-grow">
        <ResizablePanel defaultSize={3} maxSize={5} minSize={3} className="!overflow-visible"> 
          <ActivityBar />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
          <SidebarContainer /> {/* Left Sidebar for Explorer, Settings */}
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={isRightPanelOpen ? 57 : 77}> {/* Adjust size when right panel is open */}
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={isPanelOpen ? 70 : 100} minSize={30}>
              <EditorArea />
            </ResizablePanel>
            {isPanelOpen && <ResizableHandle />}
            {isPanelOpen && (
              <ResizablePanel defaultSize={30} minSize={10} maxSize={50} onCollapse={() => setPanelOpen(false)} collapsible>
                <PanelContainer /> {/* Bottom Panel for Terminal etc. */}
              </ResizablePanel>
            )}
          </ResizablePanelGroup>
        </ResizablePanel>
        {isRightPanelOpen && <ResizableHandle />}
        {isRightPanelOpen && (
          <ResizablePanel defaultSize={20} minSize={15} maxSize={35} onCollapse={() => setRightPanelOpen(false)} collapsible>
            <RightSidebarContent /> {/* Right Sidebar for AI, Chat */}
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
      <StatusBar />
    </div>
  );
};

export default ArcodeLayout;
