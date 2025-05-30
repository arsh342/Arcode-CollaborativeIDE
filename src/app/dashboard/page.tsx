
// src/app/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Settings, PlusCircle, FolderOpen, ExternalLink, Loader2, LogOut, Code2, Users, Trash2, Copy, Check, MailIcon } from 'lucide-react';
import type { ProjectType } from '@/types/dashboard';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/firebase/config';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, Timestamp, where, doc, updateDoc, arrayUnion, arrayRemove, type FieldValue, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cva } from 'class-variance-authority';

interface ProjectCardProps {
  project: ProjectType;
  onOpenProject: (projectId: string) => void;
  onManageProject: (project: ProjectType) => void;
  onInitiateDelete: (project: ProjectType) => void;
  currentUserId: string | null;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpenProject, onManageProject, onInitiateDelete, currentUserId }) => {
  const getLastModifiedString = (lastModified: ProjectType['lastModified']): string => {
    if (lastModified instanceof Timestamp) {
      return lastModified.toDate().toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
    }
    if (typeof lastModified === 'string') {
      return lastModified;
    }
    return 'Just now';
  };

  const isOwner = currentUserId === project.ownerId;

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
      <CardFooter className="p-4 border-t flex items-center gap-2">
        <Button onClick={() => onOpenProject(project.id)} className="flex-1" variant="outline">
          <ExternalLink className="mr-2 h-4 w-4" /> Open
        </Button>
        {isOwner && (
          <>
            <Button onClick={() => onManageProject(project)} className="flex-grow" variant="secondary">
              <Users className="mr-2 h-4 w-4" /> Manage
            </Button>
            <Button onClick={() => onInitiateDelete(project)} variant="destructive" size="icon" className="shrink-0" aria-label="Delete project">
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
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
  const [language, setLanguage] = useState('JavaScript');
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (name.trim() && description.trim() && language) {
      await onCreateProject({ name, description, language });
      setName('');
      setDescription('');
      setLanguage('JavaScript');
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

interface ManageCollaboratorsDialogProps {
  project: ProjectType | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCollaboratorsUpdate: () => void; 
}

const ManageCollaboratorsDialog: React.FC<ManageCollaboratorsDialogProps> = ({ project, isOpen, onOpenChange, onCollaboratorsUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newCollaboratorUid, setNewCollaboratorUid] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [projectUrl, setProjectUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (project && typeof window !== "undefined") {
      setProjectUrl(`${window.location.origin}/ide/${project.id}`);
    }
  }, [project, isOpen]); // Re-calculate if project or isOpen changes

  if (!project || !user) return null;

  const handleRemoveCollaborator = async (collaboratorUid: string) => {
    if (collaboratorUid === project.ownerId) {
      toast({ title: "Error", description: "Cannot remove the project owner.", variant: "destructive" });
      return;
    }
    setIsUpdating(true);
    try {
      const projectRef = doc(db, 'projects', project.id);
      const currentCollaborators = { ...project.collaborators };
      delete currentCollaborators[collaboratorUid];

      await updateDoc(projectRef, {
        collaborators: currentCollaborators,
        memberUids: arrayRemove(collaboratorUid)
      });
      toast({ title: "Collaborator Removed", description: `User ${collaboratorUid.substring(0,6)}... removed.` });
      onCollaboratorsUpdate(); 
    } catch (error: any) {
      console.error("Error removing collaborator:", error);
      toast({ title: "Error", description: error.message || "Could not remove collaborator.", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddCollaborator = async () => {
    if (!newCollaboratorUid.trim()) {
      toast({ title: "Error", description: "Please enter a User ID.", variant: "destructive" });
      return;
    }
    if (newCollaboratorUid.trim() === user.uid) {
      toast({ title: "Error", description: "You cannot add yourself as a collaborator.", variant: "destructive" });
      return;
    }
    if (project.collaborators[newCollaboratorUid.trim()]) {
      toast({ title: "Already a Collaborator", description: `User ${newCollaboratorUid.substring(0,6)}... is already part of this project.`, variant: "default" });
      setNewCollaboratorUid('');
      return;
    }

    setIsUpdating(true);
    try {
      const projectRef = doc(db, 'projects', project.id);
      const collaboratorId = newCollaboratorUid.trim();
      
      await updateDoc(projectRef, {
        [`collaborators.${collaboratorId}`]: 'developer' as 'developer',
        memberUids: arrayUnion(collaboratorId)
      });
      
      toast({ title: "Collaborator Added", description: `User ${collaboratorId.substring(0,6)}... added as a developer.` });
      setNewCollaboratorUid('');
      onCollaboratorsUpdate(); 
    } catch (error: any) {
      console.error("Error adding collaborator:", error);
      toast({ title: "Error", description: error.message || "Could not add collaborator.", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!projectUrl) return;
    try {
      await navigator.clipboard.writeText(projectUrl);
      setCopied(true);
      toast({ title: "Link Copied!", description: "Project link copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ title: "Copy Failed", description: "Could not copy link to clipboard.", variant: "destructive" });
      console.error('Failed to copy: ', err);
    }
  };

  const handleMailLink = () => {
    if (!projectUrl) return;
    const subject = encodeURIComponent(`Invitation to collaborate on Arcode project: ${project.name}`);
    const body = encodeURIComponent(`Hi,\n\nYou've been invited to collaborate on the Arcode project "${project.name}".\n\nYou can access it here:\n${projectUrl}\n\nBest regards,\n${user.displayName || 'An Arcode User'}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleShareOnWhatsApp = () => {
    if (!projectUrl) return;
    const text = encodeURIComponent(`Check out this Arcode project "${project.name}": ${projectUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Collaborators for {project.name}</DialogTitle>
          <DialogDescription>Add or remove collaborators, and share the project.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div>
            <h4 className="font-medium mb-2 text-sm">Current Collaborators</h4>
            {Object.keys(project.collaborators).length > 0 ? (
              <ScrollArea className="h-40 border rounded-md p-2">
                <ul className="space-y-1">
                  {Object.entries(project.collaborators).map(([uid, role]) => (
                    <li key={uid} className="flex justify-between items-center text-xs p-1.5 rounded hover:bg-muted/50">
                      <div>
                        <span className="font-medium block truncate max-w-[200px]">{uid === user.uid ? `${uid.substring(0,10)}... (You)` : `${uid.substring(0,10)}...`}</span>
                        <span className="text-muted-foreground capitalize">{role}</span>
                      </div>
                      {role === 'developer' && project.ownerId === user.uid && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveCollaborator(uid)}
                          disabled={isUpdating}
                          aria-label="Remove collaborator"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <p className="text-xs text-muted-foreground">No collaborators yet (besides you, the owner).</p>
            )}
          </div>

          {project.ownerId === user.uid && (
            <div>
              <h4 className="font-medium mb-2 text-sm">Add Collaborator by User ID</h4>
              <div className="flex items-center space-x-2">
                <Input
                  id="collaborator-uid"
                  placeholder="Enter User ID to invite as developer"
                  value={newCollaboratorUid}
                  onChange={(e) => setNewCollaboratorUid(e.target.value)}
                  className="text-sm"
                  disabled={isUpdating}
                />
                <Button onClick={handleAddCollaborator} disabled={isUpdating || !newCollaboratorUid.trim()} size="sm">
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Note: This adds users directly. A full email invitation system is coming soon.
              </p>
            </div>
          )}

          <div>
            <h4 className="font-medium mb-2 text-sm">Share Project</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="project-link-manage" className="text-xs">Project Link</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input id="project-link-manage" value={projectUrl} readOnly className="flex-1 h-9 text-xs" />
                  <Button type="button" size="icon" variant="outline" onClick={handleCopyLink} aria-label="Copy link" className="h-9 w-9">
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="button" onClick={handleMailLink} variant="outline" size="sm" className="flex-1">
                  <MailIcon className="mr-2 h-4 w-4" /> Mail Link
                </Button>
                <Button type="button" onClick={handleShareOnWhatsApp} variant="outline" size="sm" className="flex-1">
                  {/* Using text as Lucide doesn't have a WhatsApp icon */}
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.35 3.43 16.84L2.05 22L7.31 20.62C8.76 21.41 10.37 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 9.27 20.92 6.83 19.17 4.97C17.42 3.11 14.83 2 12.04 2M12.04 3.67C14.21 3.67 16.22 4.5 17.72 5.94C19.22 7.38 20.28 9.48 20.28 11.91C20.28 16.46 16.65 20.14 12.04 20.14C10.53 20.14 9.09 19.75 7.85 19L7.55 18.83L4.43 19.65L5.29 16.63L5.1 16.32C4.18 14.93 3.79 13.32 3.79 11.91C3.79 7.36 7.42 3.67 12.04 3.67M17.02 14.62C16.87 14.77 16.33 15.09 16.04 15.17C15.76 15.24 15.39 15.31 15.04 15.17C14.69 15.02 14.05 14.71 13.31 14.01C12.44 13.2 11.85 12.23 11.7 12.08C11.56 11.94 11.42 11.78 11.27 11.6C11.12 11.41 11.05 11.27 10.88 11.03C10.79 10.91 10.64 10.8 10.46 10.68C10.27 10.56 10.09 10.48 9.92 10.48C9.75 10.48 9.59 10.41 9.45 10.56C9.31 10.71 8.85 11.17 8.71 11.32C8.56 11.47 8.42 11.54 8.27 11.54C8.12 11.54 7.98 11.47 7.84 11.32C7.69 11.17 7.15 10.62 7 10.47C6.55 9.86 6.24 9.27 6.24 8.63C6.24 7.98 6.38 7.67 6.53 7.52C6.68 7.37 6.89 7.22 7.1 7.22C7.17 7.22 7.24 7.22 7.31 7.22C7.45 7.22 7.53 7.22 7.62 7.41C7.72 7.59 7.86 7.91 7.93 8C8.01 8.1 8.08 8.24 8.15 8.24C8.23 8.24 8.3 8.17 8.37 8.1C8.44 8.02 8.48 7.88 8.55 7.73C8.63 7.59 8.7 7.45 8.77 7.3C8.85 7.16 8.92 7.05 8.99 6.93C9.06 6.81 9.11 6.74 9.11 6.63C9.11 6.52 9.04 6.37 8.97 6.3C8.9 6.23 8.78 6.16 8.63 6.09C8.48 6.01 8.34 5.98 8.22 5.98C8.1 5.98 7.87 6.05 7.62 6.27C7.38 6.49 7.08 6.74 6.87 6.93C6.41 7.32 6.05 7.81 6.05 8.63C6.05 9.74 6.64 10.74 6.78 10.89C6.93 11.04 7.52 11.67 8.12 11.94C8.71 12.21 9.17 12.32 9.45 12.32C9.69 12.32 9.91 12.28 10.09 12.21C10.27 12.13 10.84 11.81 11.03 11.57C11.23 11.32 11.27 11.08 11.34 10.97C11.42 10.86 11.53 10.75 11.67 10.64C11.81 10.53 11.92 10.48 12.03 10.48C12.15 10.48 12.26 10.52 12.37 10.64C12.48 10.75 12.87 11.17 13.02 11.32C13.17 11.47 13.24 11.54 13.35 11.54C13.47 11.54 13.78 11.43 14.03 11.29C14.28 11.14 15.19 10.56 15.34 10.41C15.49 10.26 15.49 10.08 15.41 9.93C15.34 9.79 15.06 9.68 14.81 9.58C14.57 9.48 14.32 9.45 14.11 9.45C13.89 9.45 13.71 9.48 13.53 9.55C13.35 9.62 13.21 9.76 13.14 9.9C13.06 10.05 12.82 10.41 12.54 10.75C12.26 11.09 11.99 11.16 11.81 11.16C11.64 11.16 11.36 11.02 11.12 10.56C10.88 10.1 10.34 9.16 10.23 8.95C10.13 8.74 9.92 8.56 9.64 8.56C9.36 8.56 9.11 8.77 9.01 9.09C8.9 9.41 8.66 10.13 8.66 10.24C8.66 10.35 8.66 10.46 8.73 10.53C8.8 10.6 8.91 10.64 8.98 10.64C9.05 10.64 9.23 10.56 9.37 10.41C9.52 10.26 9.66 10.01 9.8 9.83C9.95 9.64 10.16 9.43 10.37 9.43C10.59 9.43 10.83 9.64 10.9 9.75C10.97 9.86 11.01 10.05 11.01 10.19C11.01 10.34 11.01 10.48 10.97 10.59C10.94 10.71 10.87 10.85 10.8 10.96C10.73 11.07 10.62 11.21 10.48 11.36C10.34 11.51 10.09 11.72 9.81 11.83C9.53 11.94 9.22 12.01 8.94 12.01C8.66 12.01 8.21 11.9 7.58 11.57C6.94 11.24 6.23 10.56 6.12 10.41C5.94 10.13 5.4 9.27 5.4 8.63C5.4 7.71 5.94 7.04 6.16 6.82C6.38 6.6 6.75 6.32 7.24 6.18C7.73 6.04 8.12 5.98 8.22 5.98C8.5 5.98 8.92 6.08 9.24 6.43C9.55 6.78 9.77 7.24 9.77 7.38C9.77 7.52 9.73 7.63 9.73 7.7C9.73 7.77 9.69 7.88 9.62 7.95C9.55 8.02 9.48 8.06 9.41 8.06C9.34 8.06 9.27 8.02 9.16 7.88C9.06 7.73 8.75 7.19 8.68 7.08C8.61 6.97 8.54 6.87 8.36 6.87C8.19 6.87 8.05 6.94 7.94 7.05C7.84 7.16 7.77 7.33 7.77 7.48C7.77 7.63 7.84 7.8 7.94 7.91C8.05 8.02 8.19 8.09 8.29 8.09C8.44 8.09 8.62 8.02 8.76 7.77C8.9 7.52 9.15 6.98 9.15 6.98C9.33 6.54 9.79 6.11 10.34 6.11C10.79 6.11 11.15 6.32 11.33 6.6C11.51 6.88 11.65 7.34 11.65 7.84C11.65 8.73 11.15 9.55 10.94 9.83C10.73 10.1 10.62 10.21 10.62 10.35C10.62 10.49 10.69 10.6 10.8 10.67C10.9 10.75 11.01 10.82 11.08 10.85C11.15 10.89 11.22 10.92 11.29 10.92C11.54 10.92 11.76 10.82 11.97 10.45C12.18 10.08 12.5 9.45 12.71 9.14C12.92 8.83 13.26 8.73 13.47 8.73C13.72 8.73 14.11 8.83 14.32 9.05C14.54 9.27 14.64 9.55 14.68 9.65C14.72 9.76 14.72 9.93 14.68 10.04C14.64 10.14 14.57 10.25 14.5 10.32C14.43 10.39 14.32 10.46 14.21 10.53C14.11 10.6 13.93 10.68 13.79 10.75C13.64 10.82 13.33 10.96 13.09 11.14C12.84 11.32 12.44 11.6 12.44 11.98C12.44 12.35 12.8 12.72 13.02 12.91C13.24 13.1 13.72 13.42 14.47 13.63C15.21 13.84 15.79 13.91 16.07 13.91C16.36 13.91 16.87 13.81 17.02 14.62"></path></svg>
                  Share on WhatsApp
                </Button>
              </div>
            </div>
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface DeleteProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  projectName: string | undefined;
}

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
       },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);


const DeleteProjectDialog: React.FC<DeleteProjectDialogProps> = ({ isOpen, onOpenChange, onConfirm, isDeleting, projectName }) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the project
            <strong className="mx-1">{projectName ? `"${projectName}"` : "this project"}</strong>
            and remove all its data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isDeleting} className={buttonVariants({ variant: "destructive" })}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? "Deleting..." : "Delete Project"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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

  const [selectedProjectForManagement, setSelectedProjectForManagement] = useState<ProjectType | null>(null);
  const [isManageCollaboratorsDialogOpen, setIsManageCollaboratorsDialogOpen] = useState(false);

  const [projectToDelete, setProjectToDelete] = useState<ProjectType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);


  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const projectsCollection = collection(db, 'projects');
      // Query for projects where the current user's UID is in the memberUids array
      const q = query(projectsCollection, where("memberUids", "array-contains", user.uid), orderBy('lastModified', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedProjects: ProjectType[] = [];
      querySnapshot.forEach((doc) => {
        fetchedProjects.push({ id: doc.id, ...doc.data() } as ProjectType);
      });
      setProjects(fetchedProjects);
    } catch (error: any) {
      console.error("Error fetching projects: ", error);
      // Check if error message contains "firestore/indexes" and provide specific guidance
      const specificError = "firestore/indexes";
      if (error.message && typeof error.message === 'string' && error.message.toLowerCase().includes(specificError)) {
        toast({
            title: "Firestore Index Required",
            description: "A Firestore index is needed for this query. Please check the browser console for a link to create it, or create it manually for 'projects' collection with 'memberUids' (array-contains) and 'lastModified' (descending).",
            variant: "destructive",
            duration: 9000, // Longer duration for this important message
        });
      } else {
        toast({
            title: "Error Fetching Projects",
            description: error.message || "Could not load projects.",
            variant: "destructive",
        });
      }
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
        ...projectData, // Includes name, description, language from form
        imageUrl: `https://placehold.co/600x400.png`, 
        lastModified: serverTimestamp() as FieldValue,
        ownerId: user.uid,
        collaborators: { [user.uid]: 'owner' as 'owner' },
        memberUids: [user.uid], // Initialize with owner's UID
        imageAiHint: "gradient abstract"
      };
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

  const handleManageProject = (project: ProjectType) => {
    setSelectedProjectForManagement(project);
    setProjectToDelete(null); 
    setIsDeleteDialogOpen(false);
    setIsManageCollaboratorsDialogOpen(true);
  };

  const handleInitiateDeleteProject = (project: ProjectType) => {
    setSelectedProjectForManagement(null); 
    setProjectToDelete(project);
    setIsManageCollaboratorsDialogOpen(false);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteProject = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'projects', projectToDelete.id));
      toast({ title: "Project Deleted", description: `"${projectToDelete.name}" has been successfully deleted.` });
      fetchProjects(); 
    } catch (error: any) {
      console.error("Error deleting project: ", error);
      toast({ title: "Error Deleting Project", description: error.message || "Could not delete the project.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
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
            <h2 className="text-xl font-bold text-foreground">Arcode</h2>
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
                    <div className="h-3 bg-muted rounded w-1/3 mb-3 animate-pulse"></div>
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
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpenProject={handleOpenProject}
                  onManageProject={handleManageProject}
                  onInitiateDelete={handleInitiateDeleteProject}
                  currentUserId={user?.uid || null}
                />
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
      {selectedProjectForManagement && (
        <ManageCollaboratorsDialog
          project={selectedProjectForManagement}
          isOpen={isManageCollaboratorsDialogOpen}
          onOpenChange={(isOpen) => {
            setIsManageCollaboratorsDialogOpen(isOpen);
            if (!isOpen) setSelectedProjectForManagement(null); 
          }}
          onCollaboratorsUpdate={fetchProjects}
        />
      )}
      <DeleteProjectDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDeleteProject}
        isDeleting={isDeleting}
        projectName={projectToDelete?.name}
      />
    </div>
  );
}


    