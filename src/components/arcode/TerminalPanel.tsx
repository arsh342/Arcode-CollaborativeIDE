
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useArcodeContext } from '@/hooks/useArcodeContext';

const TerminalPanel: React.FC = () => {
  const [input, setInput] = useState('');
  const { terminalOutput, addTerminalOutput, clearTerminalOutput } = useArcodeContext();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when output changes
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [terminalOutput]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const command = input.toLowerCase();
    addTerminalOutput(`user@arcode:~$ ${input}`);
    
    if (command === 'clear') {
      clearTerminalOutput();
    } else if (command === 'date') {
      addTerminalOutput(new Date().toString());
    } else if (command === 'help') {
      addTerminalOutput('Available commands: clear, date, help, echo [text]');
    } else if (command.startsWith('echo ')) {
      addTerminalOutput(input.substring(5));
    } else {
      addTerminalOutput(`Command not found: ${input}`);
    }
    
    setInput('');
  };

  return (
    <div className="h-full flex flex-col bg-background p-2 font-mono text-xs">
      <ScrollArea className="flex-grow mb-2 pr-2" ref={scrollAreaRef}>
        {terminalOutput.map((line, index) => (
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
        />
        <Button type="submit" size="sm" variant="ghost" className="h-7 text-xs px-2">Enter</Button>
      </form>
    </div>
  );
};

export default TerminalPanel;
