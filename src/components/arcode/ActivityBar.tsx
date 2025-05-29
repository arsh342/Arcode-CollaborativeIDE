"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Files, Bot, MessageSquare, Settings, Search, GitFork, PlayCircle, Puzzle, UserCircle } from 'lucide-react';
import { useArcodeContext } from '@/hooks/useArcodeContext';
import type { ActiveView } from '@/types/arcode';

const activityBarItemsTop = [
  { id: 'explorer', label: 'Explorer', icon: Files },
  { id: 'search', label: 'Search (Soon)', icon: Search, disabled: true },
  { id: 'source-control', label: 'Source Control (Soon)', icon: GitFork, disabled: true },
  { id: 'run-debug', label: 'Run and Debug (Soon)', icon: PlayCircle, disabled: true },
  { id: 'extensions', label: 'Extensions (Soon)', icon: Puzzle, disabled: true },
  { id: 'ai', label: 'AI Assistant', icon: Bot },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
];

const activityBarItemsBottom = [
  { id: 'account', label: 'Account (Soon)', icon: UserCircle, disabled: true },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const ActivityBar: React.FC = () => {
  const { activeView, setActiveView } = useArcodeContext();

  return (
    <TooltipProvider delayDuration={0}>
      <div className="h-full w-12 bg-card flex flex-col justify-between items-center py-2 border-r">
        <div className="flex flex-col space-y-1">
          {activityBarItemsTop.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeView === item.id ? 'secondary' : 'ghost'}
                  size="icon"
                  className={`w-10 h-10 ${activeView === item.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => !item.disabled && setActiveView(item.id as ActiveView)}
                  disabled={item.disabled}
                  aria-label={item.label}
                >
                  <item.icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-background text-foreground border-border">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <div className="flex flex-col space-y-1">
          {activityBarItemsBottom.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                   variant={activeView === item.id ? 'secondary' : 'ghost'}
                   size="icon"
                   className={`w-10 h-10 ${activeView === item.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                   onClick={() => !item.disabled && setActiveView(item.id as ActiveView)}
                   disabled={item.disabled}
                   aria-label={item.label}
                >
                  <item.icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-background text-foreground border-border">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ActivityBar;
