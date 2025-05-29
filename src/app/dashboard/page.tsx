// src/app/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Briefcase, Settings, PlusCircle, FolderOpen, ExternalLink } from 'lucide-react';
import type { ProjectType } from '@/types/dashboard';
import { useToast } from "@/hooks/use-toast";

const initialProjects: ProjectType[] = [
  { id: 'proj1', name: 'E-commerce Platform', description: 'A full-featured online store with payment integration and admin panel.', imageUrl: 'https://placehold.co/600x400.png', lastModified: '2 days ago', imageAiHint: 'online store' },
  { id: 'proj2', name: 'Blog CMS', description: 'Content management system for creating and managing blog posts efficiently.', imageUrl: 'https://placehold.co/600x400.png', lastModified: '5 days ago', imageAiHint: 'writing content' },
  { id: 'proj3', name: 'Task Manager App', description: 'A collaborative tool for tracking project tasks, assignments, and deadlines.', imageUrl: 'https://placehold.co/600x400.png', lastModified: '1 week ago', imageAiHint: 'tasks list' },
  { id: 'proj4', name: 'Portfolio Website', description: 'Personal portfolio to showcase projects and skills with a modern design.', imageUrl: 'https://placehold.co/600x400.png', lastModified: '2 weeks ago', imageAiHint: 'personal website' },
];

interface ProjectCardProps {
  project: ProjectType;
  onOpenProject: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpenProject }) => {
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
        <p className="text-xs text-muted-foreground">Last modified: {project.lastModified}</p>
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
  onCreateProject: (projectData: { name: string, description: string }) => void;
}

const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({ open, onOpenChange, onCreateProject }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (name.trim() && description.trim()) {
      onCreateProject({ name, description });
      toast({
        title: "Project Created",
        description: `${name} has been successfully created.`,
      });
      setName('');
      setDescription('');
      onOpenChange(false); // Close dialog on successful creation
    } else {
      toast({
        title: "Error",
        description: "Project name and description cannot be empty.",
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} disabled={!name.trim() || !description.trim()}>Create Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching projects
    setTimeout(() => {
      setProjects(initialProjects);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleCreateProject = (projectData: { name: string, description: string }) => {
    const newProject: ProjectType = {
      id: String(Date.now()), // Using timestamp as a simple unique ID
      name: projectData.name,
      description: projectData.description,
      imageUrl: `https://placehold.co/600x400.png`,
      lastModified: new Date().toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }),
      imageAiHint: projectData.name.toLowerCase().split(' ').slice(0, 2).join(' ') || 'project concept'
    };
    setProjects(prevProjects => [newProject, ...prevProjects]);
    // Toast is handled in dialog
  };

  const handleOpenProject = (projectId: string) => {
    router.push(`/ide/${projectId}`);
  };

  const handleOpenSettings = () => {
    router.push('/settings');
  };

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
            {/* Future nav items
            <Button variant="ghost" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground">
              <Users className="mr-2 h-4 w-4" />
              Teams
            </Button>
            */}
          </nav>
        </div>
        <div>
          <Button variant="ghost" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground" onClick={handleOpenSettings}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
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
                    <div className="h-4 bg-muted rounded w-5/6 mb-3 animate-pulse"></div>
                    <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
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
      <CreateProjectDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onCreateProject={handleCreateProject} />
    </div>
  );
}

    