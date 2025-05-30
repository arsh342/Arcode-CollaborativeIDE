
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Play, Share2 } from 'lucide-react';
import { useArcodeContext } from '@/hooks/useArcodeContext';
import { useToast } from '@/hooks/use-toast';
import ShareProjectDialog from './ShareProjectDialog';

const EditorHeader: React.FC = () => {
  const router = useRouter();
  const { 
    activeFileId, 
    getFileById, 
    addOutputToTerminalSession,
    setActivePanel, 
    togglePanel, 
    isPanelOpen, 
    activePanel: currentActivePanel,
    activeTerminalId,
    terminalSessions,
    createTerminalSession,
    setActiveTerminalId
  } = useArcodeContext();
  const { toast } = useToast();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [projectUrl, setProjectUrl] = useState('');

  const activeFile = activeFileId ? getFileById(activeFileId) : null;

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const ensureActiveTerminalAndRun = (action: (terminalId: string) => void) => {
    let currentTerminalId = activeTerminalId;

    if (!currentTerminalId) {
      if (terminalSessions.length > 0) {
        currentTerminalId = terminalSessions[0].id;
        setActiveTerminalId(currentTerminalId);
      } else {
        currentTerminalId = createTerminalSession(); // This also sets it active
      }
    }
    
    if (!isPanelOpen || currentActivePanel !== 'terminal') {
        setActivePanel('terminal'); // This also opens the panel if closed
    }

    if (currentTerminalId) {
      action(currentTerminalId);
    } else {
       toast({ title: "Terminal Error", description: "Could not initialize terminal session.", variant: "destructive" });
    }
  };

  const handleRunCode = () => {
    if (activeFile) {
      ensureActiveTerminalAndRun((terminalId) => {
        addOutputToTerminalSession(terminalId, `Running ${activeFile.name} from editor header...`);
        if (activeFile.name === 'example.py') {
          setTimeout(() => addOutputToTerminalSession(terminalId, 'Hello, Arcode User! (from editor header)'), 500);
        }
        setTimeout(() => addOutputToTerminalSession(terminalId, 'Execution finished (from editor header).'), 1000);
        toast({ title: "Code Execution", description: `Simulated run for ${activeFile.name}. Check terminal.` });
      });
    } else {
      toast({ title: "No File Selected", description: "Please open a file to run.", variant: "destructive" });
    }
  };

  const handleShareProject = () => {
    if (typeof window !== "undefined") {
      setProjectUrl(window.location.href);
    }
    setIsShareDialogOpen(true);
  };

  return (
    <div className="h-12 px-3 border-b bg-muted/40 flex items-center justify-between gap-3 shrink-0">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBackToDashboard} aria-label="Back to Dashboard">
          <ArrowLeft size={18} />
        </Button>
      </div>

      <div className="flex-1 max-w-xs">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search files (soon...)"
            className="h-8 pl-9 text-sm bg-background focus-visible:ring-offset-0 focus-visible:ring-1"
            disabled
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-8 px-2.5" onClick={handleRunCode}>
          <Play size={16} className="mr-1.5" />
          Run
        </Button>
        <Button variant="ghost" size="sm" className="h-8 px-2.5" onClick={handleShareProject}>
          <Share2 size={16} className="mr-1.5" />
          Share
        </Button>
      </div>
      <ShareProjectDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        projectUrl={projectUrl}
      />
    </div>
  );
};

export default EditorHeader;
