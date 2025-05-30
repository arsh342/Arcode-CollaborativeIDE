
"use client";

import type { ArcodeFile, ArcodeFileSystemEntity, ActiveView, ActivePanel, ArcodeFolder, TerminalSession } from '@/types/arcode';
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

  terminalSessions: TerminalSession[];
  activeTerminalId: string | null;
  createTerminalSession: () => string;
  closeTerminalSession: (sessionId: string) => void;
  setActiveTerminalId: (sessionId: string | null) => void;
  addOutputToTerminalSession: (sessionId: string, line: string, isCommand?: boolean) => void;
  clearTerminalSessionOutput: (sessionId: string) => void;

  createFileInExplorer: () => void;
  createFolderInExplorer: () => void;
  importFilesFromComputer: (fileList: FileList | null) => void;
  importFolderFromComputerFlat: (fileList: FileList | null) => void;
}

const ArcodeContext = createContext<ArcodeContextType | undefined>(undefined);

const newId = (): string => crypto.randomUUID();

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
  
  const [activePanel, setActivePanelState] = useState<ActivePanel>('terminal');
  const [isPanelOpen, setPanelOpen] = useState<boolean>(true); 
  const [isRightPanelOpen, setRightPanelOpen] = useState<boolean>(false); 

  const [terminalSessions, setTerminalSessions] = useState<TerminalSession[]>([]);
  const [activeTerminalId, setActiveTerminalIdState] = useState<string | null>(null);

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
  }, []);

  const createTerminalSession = useCallback(() => {
    const newSessionId = `term-${newId()}`;
    let newSessionName = `Terminal 1`;
    let counter = 1;
    // Ensure unique name
    while(terminalSessions.some(s => s.name === newSessionName)) {
        counter++;
        newSessionName = `Terminal ${counter}`;
    }

    const newSession: TerminalSession = {
      id: newSessionId,
      name: newSessionName,
      output: [`${newSessionName} session started at ${new Date().toLocaleTimeString()}`],
    };
    setTerminalSessions(prev => [...prev, newSession]);
    setActiveTerminalIdState(newSessionId);
    return newSessionId;
  }, [terminalSessions]);

  useEffect(() => {
    if (terminalSessions.length === 0) {
      createTerminalSession();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Create initial terminal session on mount


  const closeTerminalSession = useCallback((sessionId: string) => {
    setTerminalSessions(prevSessions => {
      const sessionToCloseIndex = prevSessions.findIndex(s => s.id === sessionId);
      if (sessionToCloseIndex === -1) return prevSessions;

      const updatedSessions = prevSessions.filter(s => s.id !== sessionId);
      
      if (activeTerminalId === sessionId) {
        if (updatedSessions.length > 0) {
          // Try to activate the session before the closed one, or the first one
          const newActiveIndex = Math.max(0, sessionToCloseIndex -1);
          setActiveTerminalIdState(updatedSessions[newActiveIndex]?.id || updatedSessions[0]?.id || null);
        } else {
          setActiveTerminalIdState(null); // No sessions left
        }
      }
      return updatedSessions;
    });
  }, [activeTerminalId]);

  const setActiveTerminalId = useCallback((sessionId: string | null) => {
    setActiveTerminalIdState(sessionId);
  }, []);
  
  const addOutputToTerminalSession = useCallback((sessionId: string, line: string, isCommand: boolean = false) => {
    setTerminalSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === sessionId
          ? { ...session, output: [...session.output, isCommand ? `user@arcode:~$ ${line}` : `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}: ${line}`] }
          : session
      )
    );
  }, []);
  
  const clearTerminalSessionOutput = useCallback((sessionId: string) => {
    setTerminalSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === sessionId) {
          return { ...session, output: [`${session.name} session started at ${new Date().toLocaleTimeString()}`] };
        }
        return session;
      })
    );
  }, []);

  const togglePanel = () => setPanelOpen(prev => !prev); 
  
  const setActivePanel = useCallback((panel: ActivePanel) => {
    setActivePanelState(panel);
    if (panel === 'terminal' && !isPanelOpen) {
      setPanelOpen(true);
    }
    if (panel === 'terminal' && terminalSessions.length === 0) {
        createTerminalSession();
    } else if (panel === 'terminal' && !activeTerminalId && terminalSessions.length > 0) {
        setActiveTerminalIdState(terminalSessions[0].id);
    }
  }, [isPanelOpen, terminalSessions, activeTerminalId, createTerminalSession]);


  useEffect(() => {
    const readme = initialFiles.find(
        (f): f is ArcodeFile => f.type === 'file' && f.name === 'README.md'
    );
    if (readme && openFiles.length === 0 && fileSystem.some(f => f.id === readme.id)) { 
      openFile(readme.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileSystem]);

  const addEntityToRoot = (entity: ArcodeFileSystemEntity) => {
    setFileSystem(prevFileSystem => {
      if (prevFileSystem.some(e => e.name === entity.name && e.path === entity.path)) {
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
        id: newId(),
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
        id: newId(),
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
        id: newId(),
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
    const newFiles: ArcodeFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.name.startsWith('.')) continue;
      if (file.size === 0 && !file.type && file.name === file.webkitRelativePath.split('/').pop()) {
          if (!file.name.includes('.')) { 
            console.log(`Skipping potential directory entry: ${file.name}`);
            continue;
          }
      }
      try {
        const content = await file.text();
        newFiles.push({
          id: newId(),
          name: file.name, 
          content: content,
          language: getLanguageFromExtension(file.name),
          path: `/${file.name}`, 
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
      terminalSessions, activeTerminalId, createTerminalSession, closeTerminalSession, setActiveTerminalId, addOutputToTerminalSession, clearTerminalSessionOutput,
      createFileInExplorer, createFolderInExplorer, importFilesFromComputer, importFolderFromComputerFlat
    }}>
      {children}
    </ArcodeContext.Provider>
  );
};

export default ArcodeContext;
