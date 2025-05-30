// src/app/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Settings, PlusCircle, FolderOpen, ExternalLink, Loader2, LogOut, Code2 } from 'lucide-react';
import type { ProjectType } from '@/types/dashboard';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/firebase/config';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, Timestamp, where } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

interface ProjectCardProps {
  project: ProjectType;
  onOpenProject: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpenProject }) => {
  const getLastModifiedString = (lastModified: ProjectType['lastModified']): string => {
    if (lastModified instanceof Timestamp) {
      return lastModified.toDate().toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
    }
    if (typeof lastModified === 'string') {
      return lastModified;
    }
    return 'Just now';
  };

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="aspect-[16/9] relative w-full">
          <Image
            src={project.imageUrl}
            alt={project.name}
            fill
            style={{objectFit:"cover"}}
            data-ai-hint={project.imageAiHint || "project image"}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg mb-1">{project.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-2 h-10 overflow-hidden text-ellipsis">
          {project.description}
        </CardDescription>
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <Code2 className="mr-1.5 h-3.5 w-3.5" />
          <span>{project.language}</span>
        </div>
        <p className="text-xs text-muted-foreground">Last modified: {getLastModifiedString(project.lastModified)}</p>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button onClick={() => onOpenProject(project.id)} className="w-full" variant="outline">
          <ExternalLink className="mr-2 h-4 w-4" /> Open Project
        </Button>
      </CardFooter>
    </Card>
  );
};

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (projectData: { name: string, description: string, language: string }) => Promise<void>;
  isCreating: boolean;
}

const supportedLanguages = ["JavaScript", "Python", "TypeScript", "HTML", "CSS", "Java", "C#", "C++", "Ruby", "Go", "PHP", "Other"];

const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({ open, onOpenChange, onCreateProject, isCreating }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('JavaScript'); // Default language
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (name.trim() && description.trim() && language) {
      await onCreateProject({ name, description, language });
      setName('');
      setDescription('');
      setLanguage('JavaScript'); // Reset to default
      onOpenChange(false);
    } else {
      toast({
        title: "Error",
        description: "Project name, description, and language are required.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details below to start a new project.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="My Awesome Project"
              disabled={isCreating}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="A brief description of your project."
              disabled={isCreating}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="language" className="text-right">
              Language
            </Label>
            <Select value={language} onValueChange={setLanguage} disabled={isCreating}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} disabled={!name.trim() || !description.trim() || !language || isCreating}>
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isCreating ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading, logout } = useAuth();

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const projectsCollection = collection(db, 'projects');
      const q = query(projectsCollection, where("userId", "==", user.uid) ,orderBy('lastModified', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedProjects: ProjectType[] = [];
      querySnapshot.forEach((doc) => {
        fetchedProjects.push({ id: doc.id, ...doc.data() } as ProjectType);
      });
      setProjects(fetchedProjects);
    } catch (error) {
      console.error("Error fetching projects: ", error);
      toast({
        title: "Error Fetching Projects",
        description: "Could not load projects from the database. Check console for index creation link if needed.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, user]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchProjects();
    } else if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, fetchProjects, router]);

  const handleCreateProject = async (projectData: { name: string, description: string, language: string }) => {
    if (!user) {
        toast({ title: "Not Authenticated", description: "You must be logged in to create a project.", variant: "destructive"});
        return;
    }
    setIsCreating(true);
    try {
      const newProjectData = {
        name: projectData.name,
        description: projectData.description,
        language: projectData.language, // Save selected language
        imageUrl: `https://placehold.co/600x400.png`,
        lastModified: serverTimestamp(),
        userId: user.uid,
        imageAiHint: projectData.name.toLowerCase().split(' ').slice(0, 2).join(' ') || 'project concept'
      };
      // const docRef = // Removed docRef as it's not used.
      await addDoc(collection(db, 'projects'), newProjectData);
      await fetchProjects();
      toast({
        title: "Project Created",
        description: `${projectData.name} has been successfully created.`,
      });
    } catch (error) {
      console.error("Error creating project: ", error);
      toast({
        title: "Error Creating Project",
        description: "Could not save the project to the database.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenProject = (projectId: string) => {
    router.push(`/ide/${projectId}`);
  };

  const handleOpenSettings = () => {
    router.push('/settings');
  };

  const handleLogout = async () => {
    await logout();
    toast({title: "Logged Out", description: "You have been successfully logged out."});
  };

  if (authLoading || (!authLoading && !user)) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-60 bg-card text-card-foreground p-4 flex flex-col justify-between border-r shadow-sm">
        <div>
          <div className="mb-10 flex items-center space-x-2 px-2">
            <Briefcase className="h-7 w-7 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Projects OS</h2>
          </div>
          <nav className="space-y-1">
            <Button variant="secondary" className="w-full justify-start text-sm">
              <FolderOpen className="mr-2 h-4 w-4" />
              My Projects
            </Button>
             <Button variant="ghost" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground" onClick={handleOpenSettings}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>
        </div>
        <div>
          <Button variant="outline" className="w-full justify-start text-sm text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-auto">
        <header className="p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <div className="container mx-auto flex justify-between items-center max-w-full px-2">
            <h1 className="text-xl font-semibold text-foreground">My Projects</h1>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Project
            </Button>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 container mx-auto max-w-full">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="shadow-lg">
                  <div className="aspect-[16/9] bg-muted animate-pulse"></div>
                  <CardContent className="p-4">
                    <div className="h-6 bg-muted rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-full mb-1 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-5/6 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-muted rounded w-1/3 mb-3 animate-pulse"></div> {/* Language placeholder */}
                    <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div> {/* Last modified placeholder */}
                  </CardContent>
                  <CardFooter className="p-4 border-t">
                    <div className="h-9 bg-muted rounded w-full animate-pulse"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground mt-10">
              <FolderOpen size={56} className="mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-medium mb-1">No projects yet.</h2>
              <p className="text-sm mb-4">Get started by creating your first project.</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} onOpenProject={handleOpenProject} />
              ))}
            </div>
          )}
        </div>
      </main>
      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateProject={handleCreateProject}
        isCreating={isCreating}
      />
    </div>
  );
}
