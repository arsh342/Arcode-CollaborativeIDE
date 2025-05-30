
"use client";

import type { ArcodeFile, ArcodeFileSystemEntity, ActiveView, ActivePanel, ArcodeFolder, TerminalSession } from '@/types/arcode';
import { initialFiles } from '@/types/arcode';
import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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

  renameFileSystemEntity: (entityId: string, newName: string) => void;
  deleteFileSystemEntity: (entityId: string) => void;
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
  const { toast } = useToast();

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
    const fileToOpen = findFileRecursive(fileSystem, fileId); // Search in the main fileSystem
    if (fileToOpen && fileToOpen.type === 'file') {
      setOpenFiles(prevOpenFiles => {
        if (!prevOpenFiles.some(f => f.id === fileId)) {
          return [...prevOpenFiles, { ...fileToOpen }]; // Add a copy to openFiles
        }
        return prevOpenFiles;
      });
      setActiveFileIdState(fileId);
    }
  }, [fileSystem]);


  const closeFile = useCallback((fileId: string) => {
    setOpenFiles(prevOpenFiles => {
      const updatedOpenFiles = prevOpenFiles.filter(f => f.id !== fileId);
      if (activeFileId === fileId) {
        setActiveFileIdState(updatedOpenFiles.length > 0 ? updatedOpenFiles[0]?.id || null : null);
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
  }, []); 


  const closeTerminalSession = useCallback((sessionId: string) => {
    setTerminalSessions(prevSessions => {
      const sessionToCloseIndex = prevSessions.findIndex(s => s.id === sessionId);
      if (sessionToCloseIndex === -1) return prevSessions;
      const updatedSessions = prevSessions.filter(s => s.id !== sessionId);
      if (activeTerminalId === sessionId) {
        if (updatedSessions.length > 0) {
          const newActiveIndex = Math.max(0, sessionToCloseIndex -1);
          setActiveTerminalIdState(updatedSessions[newActiveIndex]?.id || updatedSessions[0]?.id || null);
        } else {
          setActiveTerminalIdState(null); 
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
    const readme = fileSystem.find(
        (f): f is ArcodeFile => f.type === 'file' && f.name === 'README.md'
    );
    if (readme && openFiles.length === 0 ) { 
      openFile(readme.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileSystem]); // Removed openFiles from dependency array as per original to avoid re-triggering

  const addEntityToRoot = (entity: ArcodeFileSystemEntity) => {
    setFileSystem(prevFileSystem => {
      if (prevFileSystem.some(e => e.name === entity.name && e.path.substring(0, e.path.lastIndexOf('/')) === entity.path.substring(0, entity.path.lastIndexOf('/')))) {
        toast({ title: "Creation Error", description: `An item named "${entity.name}" already exists at the root.`, variant: "destructive" });
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
  }, [toast]);

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
  }, [toast]);

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
                 toast({title: "Import Warning", description: `File "${nf.name}" already exists and was skipped.`, variant: "default"});
            }
        });
        return updatedFileSystem;
    });
  }, [toast]);

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
                 toast({title: "Import Warning", description: `File "${nf.name}" from folder already exists and was skipped.`, variant: "default"});
            }
        });
        return updatedFileSystem;
    });
  }, [toast]);

  // Helper to find an entity and its parent (if any)
  const findEntityAndParentRecursive = (
    entities: ArcodeFileSystemEntity[], 
    entityId: string, 
    parent: ArcodeFolder | null = null
  ): { entity: ArcodeFileSystemEntity; parent: ArcodeFolder | null } | null => {
    for (const entity of entities) {
      if (entity.id === entityId) {
        return { entity, parent };
      }
      if (entity.type === 'folder' && entity.children) {
        const found = findEntityAndParentRecursive(entity.children, entityId, entity);
        if (found) return found;
      }
    }
    return null;
  };
  
  const renameFileSystemEntity = useCallback((entityId: string, newName: string) => {
    const result = findEntityAndParentRecursive(fileSystem, entityId);
    if (!result) {
      toast({ title: "Rename Error", description: "Item not found.", variant: "destructive" });
      return;
    }
    const { entity: targetEntity, parent } = result;

    // Check for name collision in the same directory
    const siblings = parent ? parent.children || [] : fileSystem;
    if (siblings.some(s => s.name === newName && s.id !== entityId)) {
      toast({ title: "Rename Error", description: `An item named "${newName}" already exists in this folder.`, variant: "destructive" });
      return;
    }

    setFileSystem(prevFileSystem => {
      const updatePathsRecursive = (children: ArcodeFileSystemEntity[], oldPathPrefix: string, newPathPrefix: string): ArcodeFileSystemEntity[] => {
        return children.map(child => {
          const relativePath = child.path.substring(oldPathPrefix.length);
          const childNewPath = newPathPrefix + relativePath;
          return {
            ...child,
            path: childNewPath,
            children: child.type === 'folder' && child.children ? updatePathsRecursive(child.children, child.path, childNewPath) : child.children,
          };
        });
      };

      const renameRecursive = (items: ArcodeFileSystemEntity[], targetId: string, newNameStr: string): ArcodeFileSystemEntity[] => {
        return items.map(item => {
          if (item.id === targetId) {
            const oldItemPath = item.path;
            const parentPath = oldItemPath.substring(0, oldItemPath.lastIndexOf('/'));
            const newItemPath = parentPath ? `${parentPath}/${newNameStr}` : `/${newNameStr}`;
            
            let updatedItem = { ...item, name: newNameStr, path: newItemPath };

            if (updatedItem.type === 'folder' && updatedItem.children) {
              updatedItem.children = updatePathsRecursive(updatedItem.children, oldItemPath, newItemPath);
            }
            
            setOpenFiles(prevOpen => prevOpen.map(of => {
              if (of.id === targetId) {
                return { ...of, name: newNameStr, path: newItemPath };
              }
              if (item.type === 'folder' && of.path.startsWith(oldItemPath + '/')) {
                const relativePath = of.path.substring(oldItemPath.length);
                return {...of, path: newItemPath + relativePath};
              }
              return of;
            }));
            
            toast({title: "Renamed", description: `"${item.name}" to "${newNameStr}"`});
            return updatedItem;
          }
          if (item.type === 'folder' && item.children) {
            return { ...item, children: renameRecursive(item.children, targetId, newNameStr) };
          }
          return item;
        });
      };
      return renameRecursive(prevFileSystem, entityId, newName);
    });
  }, [fileSystem, toast, setOpenFiles]);

  const deleteFileSystemEntity = useCallback((entityId: string) => {
    const entityToDeleteInfo = findEntityAndParentRecursive(fileSystem, entityId);
    if (!entityToDeleteInfo) {
        toast({ title: "Delete Error", description: "Item not found.", variant: "destructive" });
        return;
    }
    const entityToDelete = entityToDeleteInfo.entity;

    const confirmDelete = window.confirm(`Are you sure you want to delete "${entityToDelete.name}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    let filesToClose: string[] = [];
    if (entityToDelete.type === 'file') {
        filesToClose.push(entityToDelete.id);
    } else if (entityToDelete.type === 'folder' && entityToDelete.children) {
        const collectDescendantFiles = (folder: ArcodeFolder) => {
            folder.children?.forEach(child => {
                if (child.type === 'file') filesToClose.push(child.id);
                else if (child.type === 'folder') collectDescendantFiles(child);
            });
        };
        collectDescendantFiles(entityToDelete);
    }
    
    filesToClose.forEach(fileId => closeFile(fileId)); // This handles activeFileId logic

    setFileSystem(prevFileSystem => {
      const deleteRecursive = (items: ArcodeFileSystemEntity[], targetId: string): ArcodeFileSystemEntity[] => {
        const filteredItems = items.filter(item => item.id !== targetId);
        return filteredItems.map(item => {
          if (item.type === 'folder' && item.children) {
            return { ...item, children: deleteRecursive(item.children, targetId) };
          }
          return item;
        });
      };
      return deleteRecursive(prevFileSystem, entityId);
    });

    toast({title: "Deleted", description: `"${entityToDelete.name}" has been deleted.`});
  }, [fileSystem, closeFile, toast]);


  return (
    <ArcodeContext.Provider value={{
      activeView, setActiveView,
      fileSystem, setFileSystem,
      openFiles, activeFileId,
      openFile, closeFile, setActiveFileId, updateFileContent, getFileById,
      activePanel, setActivePanel, isPanelOpen, togglePanel, setPanelOpen,
      isRightPanelOpen, setRightPanelOpen,
      terminalSessions, activeTerminalId, createTerminalSession, closeTerminalSession, setActiveTerminalId, addOutputToTerminalSession, clearTerminalSessionOutput,
      createFileInExplorer, createFolderInExplorer, importFilesFromComputer, importFolderFromComputerFlat,
      renameFileSystemEntity, deleteFileSystemEntity
    }}>
      {children}
    </ArcodeContext.Provider>
  );
};

export default ArcodeContext;


    