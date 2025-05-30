
"use client";

import React from 'react';
import { useArcodeContext } from '@/hooks/useArcodeContext';
import MonacoEditorWrapper from './MonacoEditorWrapper';
import EditorHeader from './EditorHeader'; // Import the new header
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const EditorArea: React.FC = () => {
  const { openFiles, activeFileId, setActiveFileId, closeFile, getFileById } = useArcodeContext();

  if (openFiles.length === 0 && !activeFileId) { // Ensure activeFileId check for initial load
    return (
      <div className="h-full flex flex-col bg-background">
        <EditorHeader /> 
        <div className="flex-grow flex items-center justify-center text-muted-foreground">
            <p>Open a file to start editing or select one from the explorer.</p>
        </div>
      </div>
    );
  }
  
  const activeFile = activeFileId ? getFileById(activeFileId) : null;

  // Fallback if activeFileId is set but file somehow not found (e.g. after closing last file)
  // or if openFiles is empty but activeFileId still lingers (should be rare with closeFile logic)
  if (!activeFile && openFiles.length === 0) {
     return (
      <div className="h-full flex flex-col bg-background">
        <EditorHeader />
        <div className="flex-grow flex items-center justify-center text-muted-foreground">
            <p>No files open. Select a file from the explorer.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="h-full flex flex-col bg-background">
      <EditorHeader /> {/* Add the header here */}
      
      {openFiles.length > 0 && ( // Only show tabs if there are open files
        <ScrollArea className="w-full whitespace-nowrap border-b shrink-0">
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
      )}
      
      <div className="flex-grow relative min-h-0"> {/* Added min-h-0 for flex-grow to work correctly */}
        {activeFile ? (
          <MonacoEditorWrapper
            fileId={activeFile.id}
            initialContent={activeFile.content}
            language={activeFile.language}
          />
        ) : (
           <div className="h-full flex items-center justify-center bg-background text-muted-foreground">
            <p>Select a file to view its content or open one from the explorer.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorArea;
