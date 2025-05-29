"use client";

import React, { useState } from 'react';
import { useArcodeContext } from '@/hooks/useArcodeContext';
import type { ArcodeFileSystemEntity, ArcodeFile, ArcodeFolder } from '@/types/arcode';
import { Folder, File as FileIcon, ChevronRight, ChevronDown, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface FileSystemItemProps {
  item: ArcodeFileSystemEntity;
  level?: number;
}

const FileSystemItem: React.FC<FileSystemItemProps> = ({ item, level = 0 }) => {
  const { openFile, activeFileId } = useArcodeContext();
  const [isOpen, setIsOpen] = useState(true); // Folders are open by default

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from bubbling to item click
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
  const indentStyle = { paddingLeft: `${level * 16}px` }; // 16px per level

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
             <span className="w-[18px] inline-block"></span> // Placeholder for chevron
          )}
          <Icon size={14} className="shrink-0" />
          <span className="truncate">{item.name}</span>
        </div>
      </Button>
      {item.type === 'folder' && isOpen && item.children && (
        <div className="ml-0"> {/* No additional margin, padding handles indent */}
          {item.children.map(child => (
            <FileSystemItem key={child.id} item={child} level={level + (item.type === 'folder' && (item.children && item.children.length > 0) ? 1 : 0)} />
          ))}
        </div>
      )}
    </div>
  );
};


const FileExplorer: React.FC = () => {
  const { fileSystem } = useArcodeContext();

  return (
    <Card className="h-full flex flex-col border-0 shadow-none rounded-none">
      <CardHeader className="py-2 px-3 border-b">
        <CardTitle className="text-xs font-medium uppercase tracking-wider">Explorer</CardTitle>
      </CardHeader>
      <div className="flex-grow overflow-y-auto py-1">
        {fileSystem.map(item => (
          <FileSystemItem key={item.id} item={item} />
        ))}
      </div>
      {/* Add file operation buttons here later (New File, New Folder) */}
    </Card>
  );
};

export default FileExplorer;
