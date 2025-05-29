"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HardDriveDownload, Server } from 'lucide-react';

const TerminalPanel: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
    setOutput(prev => [...prev, `Arcode Terminal session started at ${new Date().toLocaleTimeString()}`]);
  }, []);


  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newOutput = [...output, `user@arcode:~$ ${input}`];
    
    // Mock command execution
    if (input.toLowerCase() === 'clear') {
      setOutput([`Arcode Terminal session started at ${new Date().toLocaleTimeString()}`]);
    } else if (input.toLowerCase() === 'date') {
      newOutput.push(new Date().toString());
    } else if (input.toLowerCase() === 'help') {
      newOutput.push('Available commands: clear, date, help, echo [text]');
    } else if (input.toLowerCase().startsWith('echo ')) {
      newOutput.push(input.substring(5));
    } else {
      newOutput.push(`Command not found: ${input}`);
    }
    
    setOutput(newOutput);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col bg-background p-2 font-mono text-xs">
      <ScrollArea className="flex-grow mb-2 pr-2">
        {output.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap break-all">{line}</div>
        ))}
      </ScrollArea>
      <form onSubmit={handleCommand} className="flex items-center gap-2">
        <span className="text-primary">user@arcode:~$</span>
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow h-7 bg-background focus-visible:ring-1 focus-visible:ring-ring text-xs"
          aria-label="Terminal input"
        />
        <Button type="submit" size="sm" variant="ghost" className="h-7 text-xs">Enter</Button>
      </form>
    </div>
  );
};

export default TerminalPanel;
