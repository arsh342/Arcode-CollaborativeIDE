
"use client";

import React, { useState, useEffect } from 'react';
import { useArcodeContext } from '@/hooks/useArcodeContext';
import { Bell, CheckCircle, GitFork, MessageSquare, XCircle, Terminal as TerminalIcon, PanelBottomClose, PanelBottomOpen, Play, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import ShareProjectDialog from './ShareProjectDialog'; // Import the new dialog
import { useToast } from "@/hooks/use-toast";

const StatusBar: React.FC = () => {
  const { 
    activeFileId, 
    getFileById, 
    isPanelOpen, 
    togglePanel, 
    activePanel, 
    setActivePanel,
    addTerminalOutput 
  } = useArcodeContext();
  const [currentTime, setCurrentTime] = useState('');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [projectUrl, setProjectUrl] = useState('');
  const { toast } = useToast();

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
  const lineCol = activeFile ? 'Ln 1, Col 1' : '-'; // Placeholder, real implementation would track cursor
  const encoding = 'UTF-8';
  const branch = 'main';

  const handleRunCode = () => {
    if (activeFile) {
      addTerminalOutput(`Running ${activeFile.name}...`);
      if (activeFile.name === 'example.py') {
        // Simulate python output
        setTimeout(() => addTerminalOutput('Hello, Arcode User!'), 500);
        setTimeout(() => addTerminalOutput('Execution finished.'), 1000);
      } else if (activeFile.name === 'app.js' && activeFile.language === 'javascript') {
         setTimeout(() => addTerminalOutput('Simulating JS execution: Check browser console for "Hello, Arcode!" (if actual script was run).'), 500);
         setTimeout(() => addTerminalOutput('Execution finished.'), 1000);
      }
      else {
        setTimeout(() => addTerminalOutput('Execution finished.'), 1000);
      }
      toast({ title: "Code Execution", description: `Simulated run for ${activeFile.name}. Check terminal.` });
      // Ensure terminal is open and active
      if (!isPanelOpen) togglePanel();
      if (activePanel !== 'terminal') setActivePanel('terminal');
    } else {
      toast({ title: "No File Selected", description: "Please open a file to run.", variant: "destructive" });
    }
  };

  const handleShareProject = () => {
    setProjectUrl(window.location.href); // Get current project URL
    setIsShareDialogOpen(true);
  };


  return (
    <TooltipProvider delayDuration={0}>
      <div className="h-6 bg-muted/60 border-t px-3 flex items-center justify-between text-xs text-muted-foreground select-none">
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="xs" className="p-0 h-auto hover:bg-transparent" onClick={handleRunCode}>
                <Play size={14} className="mr-1" /> Run
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top"><p>Run Current File (Simulated)</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="xs" className="p-0 h-auto hover:bg-transparent" onClick={handleShareProject}>
                <Share2 size={14} className="mr-1" /> Share
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top"><p>Share Project</p></TooltipContent>
          </Tooltip>
          <span className="border-l h-4 mx-1"></span>
          <Tooltip>
            <TooltipTrigger asChild>
               {/* GitFork button - keeping existing functionality or as placeholder */}
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
          <span className="hover:bg-muted/80 px-1 cursor-default min-w-[60px] text-center">{lineCol}</span>
          <span className="hover:bg-muted/80 px-1 cursor-default">{encoding}</span>
          <span className="hover:bg-muted/80 px-1 cursor-default capitalize min-w-[70px] text-center">{language}</span>
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
      <ShareProjectDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        projectUrl={projectUrl}
      />
    </TooltipProvider>
  );
};

export default StatusBar;
