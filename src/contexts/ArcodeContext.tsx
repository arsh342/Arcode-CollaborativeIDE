"use client";

import type { ArcodeFile, ArcodeFileSystemEntity, ActiveView, ActivePanel } from '@/types/arcode';
import { initialFiles } from '@/types/arcode';
import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface ArcodeContextType {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  
  fileSystem: ArcodeFileSystemEntity[];
  setFileSystem: React.Dispatch<React.SetStateAction<ArcodeFileSystemEntity[]>>;
  
  openFiles: ArcodeFile[];
  activeFileId: string | null;
  
  openFile: (fileId: string) => void;
  closeFile: (fileId: string) => void;
  setActiveFileId: (fileId: string | null) => void;
  updateFileContent: (fileId: string, newContent: string) => void;
  getFileById: (fileId: string) => ArcodeFile | undefined;

  activePanel: ActivePanel;
  setActivePanel: (panel: ActivePanel) => void;
  isPanelOpen: boolean;
  togglePanel: () => void;
  setPanelOpen: (isOpen: boolean) => void;
}

const ArcodeContext = createContext<ArcodeContextType | undefined>(undefined);

export const ArcodeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('explorer');
  const [fileSystem, setFileSystem] = useState<ArcodeFileSystemEntity[]>(initialFiles);
  const [openFiles, setOpenFiles] = useState<ArcodeFile[]>([]);
  const [activeFileId, setActiveFileIdState] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<ActivePanel>('terminal');
  const [isPanelOpen, setPanelOpen] = useState<boolean>(true);

  const findFileRecursive = (entities: ArcodeFileSystemEntity[], fileId: string): ArcodeFile | undefined => {
    for (const entity of entities) {
      if (entity.type === 'file' && entity.id === fileId) {
        return entity;
      }
      if (entity.type === 'folder' && entity.children) {
        const found = findFileRecursive(entity.children, fileId);
        if (found) return found;
      }
    }
    return undefined;
  };
  
  const getFileById = useCallback((fileId: string): ArcodeFile | undefined => {
    // First, check openFiles cache
    const openFile = openFiles.find(f => f.id === fileId);
    if (openFile) return openFile;
    // If not in openFiles, search fileSystem
    return findFileRecursive(fileSystem, fileId);
  }, [openFiles, fileSystem]);


  const openFile = useCallback((fileId: string) => {
    const fileToOpen = getFileById(fileId);
    if (fileToOpen && fileToOpen.type === 'file') {
      if (!openFiles.find(f => f.id === fileId)) {
        setOpenFiles(prev => [...prev, fileToOpen]);
      }
      setActiveFileIdState(fileId);
    }
  }, [getFileById, openFiles]);

  const closeFile = useCallback((fileId: string) => {
    setOpenFiles(prev => prev.filter(f => f.id !== fileId));
    if (activeFileId === fileId) {
      setActiveFileIdState(openFiles.length > 1 ? openFiles.filter(f => f.id !== fileId)[0]?.id || null : null);
    }
  }, [activeFileId, openFiles]);

  const setActiveFileId = useCallback((fileId: string | null) => {
    setActiveFileIdState(fileId);
  }, []);

  const updateFileContent = useCallback((fileId: string, newContent: string) => {
    setOpenFiles(prev => prev.map(f => f.id === fileId ? { ...f, content: newContent } : f));
    
    // Also update in the main fileSystem state if you want changes to persist across closing/reopening
    // This is a simplified update; a more robust solution would update nested structures.
    const updateInFileSystemRecursive = (entities: ArcodeFileSystemEntity[]): ArcodeFileSystemEntity[] => {
      return entities.map(entity => {
        if (entity.id === fileId && entity.type === 'file') {
          return { ...entity, content: newContent };
        }
        if (entity.type === 'folder' && entity.children) {
          return { ...entity, children: updateInFileSystemRecursive(entity.children) };
        }
        return entity;
      });
    };
    setFileSystem(prev => updateInFileSystemRecursive(prev));

  }, []);

  const togglePanel = () => setPanelOpen(prev => !prev);
  
  useEffect(() => {
    // Open README.md by default
    const readme = initialFiles.find(f => f.name === 'README.md') as ArcodeFile;
    if (readme) {
      openFile(readme.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return (
    <ArcodeContext.Provider value={{
      activeView, setActiveView,
      fileSystem, setFileSystem,
      openFiles, activeFileId,
      openFile, closeFile, setActiveFileId, updateFileContent, getFileById,
      activePanel, setActivePanel, isPanelOpen, togglePanel, setPanelOpen
    }}>
      {children}
    </ArcodeContext.Provider>
  );
};

export default ArcodeContext;
