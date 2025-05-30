
"use client";

import React, { useState, useRef } from 'react';
import { useArcodeContext } from '@/hooks/useArcodeContext';
import type { ArcodeFileSystemEntity, ArcodeFile, ArcodeFolder } from '@/types/arcode';
import { Folder, File as FileIcon, ChevronRight, ChevronDown, FolderOpen, FilePlus2, FolderPlus, UploadCloud, FolderUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface FileSystemItemProps {
  item: ArcodeFileSystemEntity;
  level?: number;
}

const FileSystemItem: React.FC<FileSystemItemProps> = ({ item, level = 0 }) => {
  const { openFile, activeFileId } = useArcodeContext();
  const [isOpen, setIsOpen] = useState(true); // Folders are open by default

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (item.type === 'folder') {
      setIsOpen(!isOpen);
    }
  };

  const handleClick = () => {
    if (item.type === 'file') {
      openFile(item.id);
    } else {
      setIsOpen(!isOpen);
    }
  };
  
  const Icon = item.type === 'folder' ? (isOpen ? FolderOpen : Folder) : FileIcon;
  const indentStyle = { paddingLeft: `${level * 16}px` }; 

  return (
    <div>
      <Button
        variant="ghost"
        className={`w-full justify-start h-7 px-2 py-1 text-xs truncate ${activeFileId === item.id && item.type === 'file' ? 'bg-accent/30 text-accent-foreground' : 'hover:bg-accent/20'}`}
        style={indentStyle}
        onClick={handleClick}
        title={item.path}
      >
        <div className="flex items-center gap-1.5 truncate">
          {item.type === 'folder' && (item.children && item.children.length > 0) && (
            <span onClick={handleToggle} className="cursor-pointer p-0.5">
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          )}
          {item.type === 'folder' && (!item.children || item.children.length === 0) && (
             <span className="w-[18px] inline-block"></span> 
          )}
          <Icon size={14} className="shrink-0" />
          <span className="truncate">{item.name}</span>
        </div>
      </Button>
      {item.type === 'folder' && isOpen && item.children && (
        <div className="ml-0"> 
          {item.children.map(child => (
            <FileSystemItem key={child.id} item={child} level={level + (item.type === 'folder' && (item.children && item.children.length > 0) ? 1 : 0)} />
          ))}
        </div>
      )}
    </div>
  );
};


const FileExplorer: React.FC = () => {
  const { fileSystem, createFileInExplorer, createFolderInExplorer, importFilesFromComputer, importFolderFromComputerFlat } = useArcodeContext();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleNewFile = () => {
    createFileInExplorer();
  };

  const handleNewFolder = () => {
    createFolderInExplorer();
  };

  const handleImportFilesClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      importFilesFromComputer(event.target.files);
      toast({ title: "Files Imported", description: "Selected files have been added to the explorer." });
      event.target.value = ''; // Reset input
    }
  };

  const handleImportFolderClick = () => {
    folderInputRef.current?.click();
  };

  const handleFolderSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      importFolderFromComputerFlat(event.target.files);
      toast({ title: "Folder Imported (Flat)", description: "Files from the selected folder have been added." });
      event.target.value = ''; // Reset input
    }
  };


  return (
    <TooltipProvider delayDuration={100}>
      <Card className="h-full flex flex-col border-0 shadow-none rounded-none">
        <CardHeader className="py-2 px-3 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-medium uppercase tracking-wider">Explorer</CardTitle>
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleNewFile}>
                  <FilePlus2 size={15} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>New File</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleNewFolder}>
                  <FolderPlus size={15} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>New Folder</p></TooltipContent>
            </Tooltip>
             <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleImportFilesClick}>
                  <UploadCloud size={15} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>Import Files</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleImportFolderClick}>
                  <FolderUp size={15} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom"><p>Import Folder (flat)</p></TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <div className="flex-grow overflow-y-auto py-1">
          {fileSystem.map(item => (
            <FileSystemItem key={item.id} item={item} />
          ))}
        </div>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFilesSelected} multiple />
        <input type="file" ref={folderInputRef} style={{ display: 'none' }} onChange={handleFolderSelected} webkitdirectory directory />
      </Card>
    </TooltipProvider>
  );
};

export default FileExplorer;
