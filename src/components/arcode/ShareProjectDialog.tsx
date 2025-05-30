
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, Mail, Check } from 'lucide-react';

interface ShareProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectUrl: string;
}

const ShareProjectDialog: React.FC<ShareProjectDialogProps> = ({ open, onOpenChange, projectUrl }) => {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(projectUrl);
      setCopied(true);
      toast({ title: "Link Copied!", description: "Project link copied to clipboard." });
      setTimeout(() => setCopied(false), 2000); // Reset icon after 2s
    } catch (err) {
      toast({ title: "Copy Failed", description: "Could not copy link to clipboard.", variant: "destructive" });
      console.error('Failed to copy: ', err);
    }
  };

  const handleMailLink = () => {
    const subject = encodeURIComponent("Invitation to collaborate on Arcode project");
    const body = encodeURIComponent(`Hi,\n\nYou've been invited to collaborate on an Arcode project. You can access it here:\n${projectUrl}\n\nBest regards,\nAn Arcode User`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
          <DialogDescription>
            Copy the link below or send it via email to invite collaborators.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          <div>
            <Label htmlFor="project-link" className="sr-only">Project Link</Label>
            <div className="flex items-center space-x-2">
              <Input id="project-link" value={projectUrl} readOnly className="flex-1" />
              <Button type="button" size="icon" variant="outline" onClick={handleCopyLink} aria-label="Copy link">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Button type="button" onClick={handleMailLink} className="w-full">
            <Mail className="mr-2 h-4 w-4" /> Mail Link
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareProjectDialog;
