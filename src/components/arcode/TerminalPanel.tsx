
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useArcodeContext } from '@/hooks/useArcodeContext';
import type { TerminalSession } from '@/types/arcode';

const TerminalPanel: React.FC = () => {
  const [input, setInput] = useState('');
  const { 
    terminalSessions, 
    activeTerminalId, 
    addOutputToTerminalSession, 
    clearTerminalSessionOutput 
  } = useArcodeContext();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const activeSession = activeTerminalId ? terminalSessions.find(s => s.id === activeTerminalId) : null;

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [activeSession?.output]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeTerminalId) return;

    const command = input.toLowerCase();
    addOutputToTerminalSession(activeTerminalId, input, true); // true for isCommand
    
    if (command === 'clear') {
      clearTerminalSessionOutput(activeTerminalId);
    } else if (command === 'date') {
      addOutputToTerminalSession(activeTerminalId, new Date().toString());
    } else if (command === 'help') {
      addOutputToTerminalSession(activeTerminalId, 'Available commands: clear, date, help, echo [text]');
    } else if (command.startsWith('echo ')) {
      addOutputToTerminalSession(activeTerminalId, input.substring(5));
    } else {
      addOutputToTerminalSession(activeTerminalId, `Command not found: ${input}`);
    }
    
    setInput('');
  };

  if (!activeSession) {
    return (
      <div className="h-full flex flex-col bg-background p-2 font-mono text-xs items-center justify-center text-muted-foreground">
        No active terminal session. Create one using the '+' button.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background p-2 font-mono text-xs">
      <ScrollArea className="flex-grow mb-2 pr-2" ref={scrollAreaRef}>
        {activeSession.output.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap break-all">{line}</div>
        ))}
      </ScrollArea>
      <form onSubmit={handleCommand} className="flex items-center gap-2">
        <span className="text-primary shrink-0">user@arcode:~$</span>
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow h-7 bg-background focus-visible:ring-1 focus-visible:ring-ring text-xs"
          aria-label="Terminal input"
          disabled={!activeTerminalId}
        />
        <Button type="submit" size="sm" variant="ghost" className="h-7 text-xs px-2" disabled={!activeTerminalId}>Enter</Button>
      </form>
    </div>
  );
};

export default TerminalPanel;
