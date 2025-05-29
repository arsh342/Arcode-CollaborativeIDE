"use client";

import React from 'react';
import { useArcodeContext } from '@/hooks/useArcodeContext';
import MonacoEditorWrapper from './MonacoEditorWrapper';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { XIcon } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const EditorArea: React.FC = () => {
  const { openFiles, activeFileId, setActiveFileId, closeFile, getFileById } = useArcodeContext();

  if (openFiles.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-background text-muted-foreground">
        <p>Open a file to start editing.</p>
      </div>
    );
  }

  const activeFile = activeFileId ? getFileById(activeFileId) : null;

  return (
    <div className="h-full flex flex-col bg-background">
      <ScrollArea className="w-full whitespace-nowrap border-b">
        <div className="flex items-center h-10 px-1 bg-muted/30">
          {openFiles.map(file => (
            <Button
              key={file.id}
              variant="ghost"
              size="sm"
              className={`h-full px-3 py-1.5 rounded-none border-r last:border-r-0
                ${file.id === activeFileId 
                  ? 'bg-background text-primary shadow-sm' 
                  : 'text-muted-foreground hover:bg-background/80 hover:text-foreground'
                }
              `}
              onClick={() => setActiveFileId(file.id)}
            >
              <span className="truncate max-w-[150px]">{file.name}</span>
              <XIcon
                size={14}
                className="ml-2 text-muted-foreground hover:text-foreground opacity-50 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  closeFile(file.id);
                }}
              />
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      
      <div className="flex-grow relative">
        {activeFile && (
          <MonacoEditorWrapper
            fileId={activeFile.id}
            initialContent={activeFile.content}
            language={activeFile.language}
          />
        )}
        {!activeFile && openFiles.length > 0 && (
           <div className="h-full flex items-center justify-center bg-background text-muted-foreground">
            <p>Select a file to view its content.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorArea;
