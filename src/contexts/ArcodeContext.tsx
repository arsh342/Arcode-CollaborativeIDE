
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
    const openFile = openFiles.find(f => f.id === fileId);
    if (openFile) return openFile;
    return findFileRecursive(fileSystem, fileId);
  }, [openFiles, fileSystem]);


  const openFile = useCallback((fileId: string) => {
    const fileToOpen = getFileById(fileId);
    if (fileToOpen && fileToOpen.type === 'file') {
      setOpenFiles(prevOpenFiles => {
        if (!prevOpenFiles.find(f => f.id === fileId)) {
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
        // If the closed file was active, set the new active file
        // to the first one in the updated list, or null if no files are open.
        setActiveFileIdState(updatedOpenFiles[0]?.id || null);
      }
      return updatedOpenFiles;
    });
  }, [activeFileId]); // activeFileId is needed for deciding new active file

  const setActiveFileId = useCallback((fileId: string | null) => {
    setActiveFileIdState(fileId);
  }, []);

  const updateFileContent = useCallback((fileId: string, newContent: string) => {
    setOpenFiles(prevOpenFiles =>
      prevOpenFiles.map(f => (f.id === fileId ? { ...f, content: newContent } : f))
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
  }, []); // No dependencies from closure are read, so empty array is correct.

  const togglePanel = () => setPanelOpen(prev => !prev);
  
  useEffect(() => {
    const readme = initialFiles.find(
        (f): f is ArcodeFile => f.type === 'file' && f.name === 'README.md'
    );
    if (readme) {
      openFile(readme.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount. `openFile` is now robust to multiple calls.

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
