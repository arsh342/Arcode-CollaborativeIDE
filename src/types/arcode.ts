
export interface ArcodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
  path: string;
  type: 'file';
  children?: undefined; // Files don't have children
}

export interface ArcodeFolder {
  id: string;
  name: string;
  path: string;
  type: 'folder';
  children?: (ArcodeFile | ArcodeFolder)[];
  content?: undefined; // Folders don't have content directly
  language?: undefined; // Folders don't have a language
}

export type ArcodeFileSystemEntity = ArcodeFile | ArcodeFolder;

export type ActiveView = 'explorer' | 'ai' | 'chat' | 'settings';
export type ActivePanel = 'terminal' | 'problems' | 'output' | 'debug';

export interface TerminalSession {
  id: string;
  name: string;
  output: string[];
}

export const initialFiles: ArcodeFileSystemEntity[] = [
  { 
    id: '1', 
    name: 'README.md', 
    type: 'file', 
    content: '# Arcode Project\n\nWelcome to Arcode!\n\nThis is a sample README.md file. You can edit it and see changes reflected in the editor.\n\n## Features\n\n- VS Code like UI\n- File Explorer\n- Monaco Editor\n- AI Assistant\n- Chat Panel (placeholder)\n- Terminal (placeholder)', 
    language: 'markdown', 
    path: '/README.md' 
  },
  { 
    id: '2', 
    name: 'src', 
    type: 'folder', 
    path: '/src', 
    children: [
      { 
        id: '3', 
        name: 'app.js', 
        type: 'file', 
        content: 'import React from "react";\n\nfunction App() {\n  return (\n    <div>\n      <h1>Hello, Arcode!</h1>\n      <p>This is a sample JavaScript file.</p>\n    </div>\n  );\n}\n\nexport default App;\n', 
        language: 'javascript', 
        path: '/src/app.js' 
      },
      { 
        id: '4', 
        name: 'styles', 
        type: 'folder', 
        path: '/src/styles', 
        children: [
          { 
            id: '5', 
            name: 'main.css', 
            type: 'file', 
            content: 'body {\n  font-family: Arial, Helvetica, sans-serif;\n  margin: 0;\n  padding: 0;\n  background-color: hsl(var(--background));\n  color: hsl(var(--foreground));\n}\n\nh1 {\n  color: hsl(var(--primary));\n}', 
            language: 'css', 
            path: '/src/styles/main.css' 
          }
        ]
      }
    ]
  },
  { 
    id: '6', 
    name: 'package.json', 
    type: 'file', 
    content: '{\n  "name": "arcode-project",\n  "version": "1.0.0",\n  "description": "A sample project for Arcode IDE",\n  "main": "src/app.js",\n  "scripts": {\n    "start": "echo \\"Starting project...\\" "\n  },\n  "keywords": ["arcode", "ide", "sample"],\n  "author": "Arcode Team",\n  "license": "MIT"\n}', 
    language: 'json', 
    path: '/package.json' 
  },
  {
    id: '7',
    name: 'example.py',
    type: 'file',
    content: '# This is a sample Python file.\ndef greet(name):\n    print(f"Hello, {name}!")\n\nif __name__ == "__main__":\n    greet("Arcode User")\n',
    language: 'python',
    path: '/example.py'
  }
];
