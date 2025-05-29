"use client";

import React, { useState, useEffect } from 'react';
import { useArcodeContext } from '@/hooks/useArcodeContext';
import { Bell, CheckCircle, GitFork, MessageSquare, XCircle, Terminal as TerminalIcon, PanelBottomClose, PanelBottomOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

const StatusBar: React.FC = () => {
  const { activeFileId, getFileById, isPanelOpen, togglePanel, activePanel, setActivePanel } = useArcodeContext();
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })); // Initial time
    return () => clearInterval(timer);
  }, []);

  const activeFile = activeFileId ? getFileById(activeFileId) : null;
  const language = activeFile ? activeFile.language : 'plaintext';
  // Mock data for status bar items
  const lineCol = 'Ln 1, Col 1'; 
  const encoding = 'UTF-8';
  const branch = 'main';

  return (
    <TooltipProvider delayDuration={0}>
      <div className="h-6 bg-muted/60 border-t px-3 flex items-center justify-between text-xs text-muted-foreground select-none">
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="xs" className="p-0 h-auto hover:bg-transparent" onClick={() => { setActivePanel('terminal'); if (!isPanelOpen) togglePanel();}}>
                <GitFork size={14} className="mr-1" /> {branch}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top"><p>Current Git Branch (mock)</p></TooltipContent>
          </Tooltip>
          <div className="flex items-center gap-1">
            <XCircle size={14} /> 0
            <CheckCircle size={14} /> 0
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hover:bg-muted/80 px-1 cursor-default">{lineCol}</span>
          <span className="hover:bg-muted/80 px-1 cursor-default">{encoding}</span>
          <span className="hover:bg-muted/80 px-1 cursor-default capitalize">{language}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="xs" className="p-0 h-auto hover:bg-transparent" onClick={() => { setActivePanel('terminal'); if (!isPanelOpen) togglePanel();}}>
                <TerminalIcon size={14} className="mr-1" /> Terminal
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top"><p>Toggle Terminal Panel</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="xs" className="p-0 h-auto hover:bg-transparent">
                <Bell size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top"><p>Notifications (0)</p></TooltipContent>
          </Tooltip>
          <span className="hidden sm:inline-block">{currentTime}</span>
          <Tooltip>
            <TooltipTrigger asChild>
               <Button variant="ghost" size="xs" className="p-0 h-auto hover:bg-transparent" onClick={togglePanel}>
                {isPanelOpen ? <PanelBottomClose size={16} /> : <PanelBottomOpen size={16} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top"><p>{isPanelOpen ? 'Hide Panel' : 'Show Panel'}</p></TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default StatusBar;
