
"use client";

import type { ArcodeFile, ArcodeFileSystemEntity, ActiveView, ActivePanel, ArcodeFolder } from '@/types/arcode';
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

  isRightPanelOpen: boolean;
  setRightPanelOpen: (isOpen: boolean) => void;

  terminalOutput: string[];
  addTerminalOutput: (line: string) => void;
  clearTerminalOutput: () => void;

  // New file/folder operations
  createFileInExplorer: () => void;
  createFolderInExplorer: () => void;
  importFilesFromComputer: (fileList: FileList | null) => void;
  importFolderFromComputerFlat: (fileList: FileList | null) => void;
}

const ArcodeContext = createContext<ArcodeContextType | undefined>(undefined);

// Helper to generate unique IDs
const newFileId = (): string => crypto.randomUUID();

// Helper to guess language from extension
const getLanguageFromExtension = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'py':
      return 'python';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    default:
      return 'plaintext';
  }
};


export const ArcodeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('explorer');
  const [fileSystem, setFileSystem] = useState<ArcodeFileSystemEntity[]>(initialFiles);
  const [openFiles, setOpenFiles] = useState<ArcodeFile[]>([]);
  const [activeFileId, setActiveFileIdState] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<ActivePanel>('terminal');
  const [isPanelOpen, setPanelOpen] = useState<boolean>(true); 
  const [isRightPanelOpen, setRightPanelOpen] = useState<boolean>(false); 
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
    return findFileRecursive(fileSystem, fileId);
  }, [openFiles, fileSystem]);


  const openFile = useCallback((fileId: string) => {
    const fileToOpen = getFileById(fileId); 
    if (fileToOpen && fileToOpen.type === 'file') {
      setOpenFiles(prevOpenFiles => {
        if (!prevOpenFiles.some(f => f.id === fileId)) {
          return [...prevOpenFiles, fileToOpen];
        }
        return prevOpenFiles; 
      });
      setActiveFileIdState(fileId); 
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
      prevOpenFiles.map(f => (f.id === fileId ? { ...f, content: newContent } : f)) // Removed 'saved' flag for simplicity
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
    clearTerminalOutput();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const togglePanel = () => setPanelOpen(prev => !prev); 
  
  useEffect(() => {
    const readme = initialFiles.find(
        (f): f is ArcodeFile => f.type === 'file' && f.name === 'README.md'
    );
    if (readme && openFiles.length === 0 && fileSystem.some(f => f.id === readme.id)) { 
      openFile(readme.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileSystem]); // Depend on fileSystem so if initialFiles changes, it re-evaluates

  // --- New File/Folder Operations ---

  const addEntityToRoot = (entity: ArcodeFileSystemEntity) => {
    setFileSystem(prevFileSystem => {
      // Check for name collision at root
      if (prevFileSystem.some(e => e.name === entity.name && e.path === entity.path)) {
        // Simple collision handling: append a number or alert. For now, alert.
        // A more robust solution would be to rename or allow overwriting.
        alert(`An item named "${entity.name}" already exists at the root. Please choose a different name or location.`);
        return prevFileSystem;
      }
      return [...prevFileSystem, entity];
    });
  };

  const createFileInExplorer = useCallback(() => {
    const fileName = window.prompt("Enter new file name (e.g., myFile.txt):");
    if (fileName && fileName.trim() !== "") {
      const newFile: ArcodeFile = {
        id: newFileId(),
        name: fileName.trim(),
        content: '',
        language: getLanguageFromExtension(fileName.trim()),
        path: `/${fileName.trim()}`,
        type: 'file',
      };
      addEntityToRoot(newFile);
    }
  }, []);

  const createFolderInExplorer = useCallback(() => {
    const folderName = window.prompt("Enter new folder name:");
    if (folderName && folderName.trim() !== "") {
      const newFolder: ArcodeFolder = {
        id: newFileId(),
        name: folderName.trim(),
        path: `/${folderName.trim()}`,
        type: 'folder',
        children: [],
      };
      addEntityToRoot(newFolder);
    }
  }, []);

  const importFilesFromComputer = useCallback(async (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: ArcodeFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const content = await file.text();
      newFiles.push({
        id: newFileId(),
        name: file.name,
        content: content,
        language: getLanguageFromExtension(file.name),
        path: `/${file.name}`,
        type: 'file',
      });
    }
    setFileSystem(prevFileSystem => {
        const updatedFileSystem = [...prevFileSystem];
        newFiles.forEach(nf => {
            if (!updatedFileSystem.some(e => e.name === nf.name && e.path === nf.path)) {
                updatedFileSystem.push(nf);
            } else {
                 console.warn(`File named "${nf.name}" already exists at the root. Skipping duplicate.`);
            }
        });
        return updatedFileSystem;
    });
  }, []);

  const importFolderFromComputerFlat = useCallback(async (fileList: FileList | null) => {
    if (!fileList) return;
    // For flat import, this is identical to importing multiple files.
    // webkitRelativePath is ignored here.
    const newFiles: ArcodeFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      // Skip if it's likely a hidden system file (e.g., .DS_Store)
      if (file.name.startsWith('.')) continue;
      
      // Sometimes directories themselves appear as files with size 0 and no type in the list
      // We try to filter these out. A more robust check might involve trying to read them.
      if (file.size === 0 && !file.type && file.name === file.webkitRelativePath.split('/').pop()) {
          // This heuristic tries to identify empty directory entries often included in folder uploads
          // and skip them. This is not foolproof.
          // If it's a file without an extension but has size 0, it might be an empty directory.
          if (!file.name.includes('.')) { 
            console.log(`Skipping potential directory entry: ${file.name}`);
            continue;
          }
      }

      try {
        const content = await file.text();
        newFiles.push({
          id: newFileId(),
          name: file.name, // Use the simple file name for flat import
          content: content,
          language: getLanguageFromExtension(file.name),
          path: `/${file.name}`, // Place at root
          type: 'file',
        });
      } catch (error) {
        console.warn(`Could not read file ${file.name} (likely a directory or special file). Skipping. Error:`, error);
      }
    }
     setFileSystem(prevFileSystem => {
        const updatedFileSystem = [...prevFileSystem];
        newFiles.forEach(nf => {
            if (!updatedFileSystem.some(e => e.name === nf.name && e.path === nf.path)) {
                updatedFileSystem.push(nf);
            } else {
                 console.warn(`File named "${nf.name}" already exists at the root. Skipping duplicate.`);
            }
        });
        return updatedFileSystem;
    });
  }, []);


  return (
    <ArcodeContext.Provider value={{
      activeView, setActiveView,
      fileSystem, setFileSystem,
      openFiles, activeFileId,
      openFile, closeFile, setActiveFileId, updateFileContent, getFileById,
      activePanel, setActivePanel, isPanelOpen, togglePanel, setPanelOpen,
      isRightPanelOpen, setRightPanelOpen,
      terminalOutput, addTerminalOutput, clearTerminalOutput,
      createFileInExplorer, createFolderInExplorer, importFilesFromComputer, importFolderFromComputerFlat
    }}>
      {children}
    </ArcodeContext.Provider>
  );
};

export default ArcodeContext;
