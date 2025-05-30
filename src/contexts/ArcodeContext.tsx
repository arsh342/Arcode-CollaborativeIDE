
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

  terminalOutput: string[];
  addTerminalOutput: (line: string) => void;
  clearTerminalOutput: () => void;
}

const ArcodeContext = createContext<ArcodeContextType | undefined>(undefined);

export const ArcodeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('explorer');
  const [fileSystem, setFileSystem] = useState<ArcodeFileSystemEntity[]>(initialFiles);
  const [openFiles, setOpenFiles] = useState<ArcodeFile[]>([]);
  const [activeFileId, setActiveFileIdState] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<ActivePanel>('terminal');
  const [isPanelOpen, setPanelOpen] = useState<boolean>(true);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);

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
    const openFileInstance = openFiles.find(f => f.id === fileId);
    if (openFileInstance) return openFileInstance;
    // If not in openFiles, search in the initial fileSystem structure
    return findFileRecursive(fileSystem, fileId);
  }, [openFiles, fileSystem]);


  const openFile = useCallback((fileId: string) => {
    const fileToOpen = getFileById(fileId); // Uses the enhanced getFileById
    if (fileToOpen && fileToOpen.type === 'file') {
      setOpenFiles(prevOpenFiles => {
        // Check if the file is already in the openFiles array by its id
        if (!prevOpenFiles.some(f => f.id === fileId)) {
          return [...prevOpenFiles, fileToOpen];
        }
        return prevOpenFiles; // File already open, no change to openFiles array
      });
      setActiveFileIdState(fileId); // Always set active, even if already open
    }
  }, [getFileById]);

  const closeFile = useCallback((fileId: string) => {
    setOpenFiles(prevOpenFiles => {
      const updatedOpenFiles = prevOpenFiles.filter(f => f.id !== fileId);
      if (activeFileId === fileId) {
        setActiveFileIdState(updatedOpenFiles[0]?.id || null);
      }
      return updatedOpenFiles;
    });
  }, [activeFileId]);

  const setActiveFileId = useCallback((fileId: string | null) => {
    setActiveFileIdState(fileId);
  }, []);

  const updateFileContent = useCallback((fileId: string, newContent: string) => {
    setOpenFiles(prevOpenFiles =>
      prevOpenFiles.map(f => (f.id === fileId ? { ...f, content: newContent, saved: false } : f))
    );
    
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
    setFileSystem(prevFileSystem => updateInFileSystemRecursive(prevFileSystem));
  }, []);

  const addTerminalOutput = useCallback((line: string) => {
    setTerminalOutput(prev => [...prev, `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}: ${line}`]);
  }, []);

  const clearTerminalOutput = useCallback(() => {
    setTerminalOutput([`Arcode Terminal session started at ${new Date().toLocaleTimeString()}`]);
  }, []);
  
  useEffect(() => {
    // Initialize terminal with a welcome message
    clearTerminalOutput();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const togglePanel = () => setPanelOpen(prev => !prev);
  
  useEffect(() => {
    const readme = initialFiles.find(
        (f): f is ArcodeFile => f.type === 'file' && f.name === 'README.md'
    );
    if (readme && openFiles.length === 0) { // Only open README if no files are open initially
      openFile(readme.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openFile]); // openFile dependency is okay here

  return (
    <ArcodeContext.Provider value={{
      activeView, setActiveView,
      fileSystem, setFileSystem,
      openFiles, activeFileId,
      openFile, closeFile, setActiveFileId, updateFileContent, getFileById,
      activePanel, setActivePanel, isPanelOpen, togglePanel, setPanelOpen,
      terminalOutput, addTerminalOutput, clearTerminalOutput
    }}>
      {children}
    </ArcodeContext.Provider>
  );
};

export default ArcodeContext;
