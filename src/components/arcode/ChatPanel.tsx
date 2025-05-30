
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Send, UserCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase/config';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  userId: string;
  userName?: string;
  text: string;
  timestamp: Timestamp | Date | null;
}

interface Collaborator {
  id: string;
  name: string;
  avatarUrl?: string;
  isOnline: boolean;
}

const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();
  const params = useParams();
  const projectId = params.projectId as string;
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    if (user) {
      // Only show the current authenticated user
      const currentUserAsCollaborator: Collaborator = {
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'You',
        avatarUrl: user.photoURL || undefined,
        isOnline: true, // Assume current user is online
      };
      setCollaborators([currentUserAsCollaborator]);
    } else {
      setCollaborators([]);
    }
  }, [user]);


  useEffect(() => {
    if (!projectId || !user) {
        setIsLoadingMessages(false);
        return;
    }

    setIsLoadingMessages(true);
    const messagesCollection = collection(db, 'projects', projectId, 'chatMessages');
    const q = query(messagesCollection, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages: ChatMessage[] = [];
      querySnapshot.forEach((doc) => {
        fetchedMessages.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setMessages(fetchedMessages);
      setIsLoadingMessages(false);
    }, (error) => {
      console.error("Error fetching chat messages: ", error);
      toast({ title: "Chat Error", description: "Could not load messages.", variant: "destructive"});
      setIsLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [projectId, user, toast]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user || !projectId || isSending) return;

    setIsSending(true);
    try {
      await addDoc(collection(db, 'projects', projectId, 'chatMessages'), {
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        text: newMessage,
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message: ", error);
      toast({ title: "Send Error", description: "Could not send message.", variant: "destructive"});
    } finally {
        setIsSending(false);
    }
  };

  const formatTimestamp = (timestamp: ChatMessage['timestamp']): string => {
    if (!timestamp) return '';
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (timestamp instanceof Date) {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return '';
  };
  
  const getSenderAvatar = (messageUserId: string, messageUserName?: string): string | undefined => {
     // For messages from others, try to find them in the collaborators list (if it were populated from DB)
     // For now, this will mostly be for the current user or fall back.
    const collaborator = collaborators.find(c => c.id === messageUserId);
    return collaborator?.avatarUrl;
  };
  
  const getSenderName = (messageUserId: string, messageUserName?: string): string => {
    if (messageUserId === user?.uid) return user.displayName || user.email?.split('@')[0] || 'You';
    const collaborator = collaborators.find(c => c.id === messageUserId);
    return collaborator?.name || messageUserName || 'User';
  }


  return (
    <Card className="h-full flex flex-col border-0 shadow-none rounded-none">
      <CardHeader className="py-2 px-3 border-b">
        <CardTitle className="text-xs font-medium uppercase tracking-wider">Project Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0 flex flex-col overflow-hidden">
        <div className="px-3 py-2 border-b">
          <h4 className="text-xs font-semibold mb-1.5 text-muted-foreground">Collaborators</h4>
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {collaborators.map(collab => (
              <div key={collab.id} className="flex flex-col items-center text-center w-14" title={collab.name}>
                <div className="relative">
                  <Avatar className="h-8 w-8 mb-0.5" data-ai-hint="person avatar">
                    {collab.avatarUrl ? <AvatarImage src={collab.avatarUrl} alt={collab.name} /> : null }
                    <AvatarFallback>{collab.name.substring(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {collab.isOnline && (
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-card" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate w-full">{collab.id === user?.uid ? 'You' : collab.name.split(' ')[0]}</p>
              </div>
            ))}
             {collaborators.length === 0 && !user && (
                <p className="text-xs text-muted-foreground">Login to see collaborators.</p>
            )}
            {collaborators.length === 0 && user && (
                 <div key={user.uid} className="flex flex-col items-center text-center w-14" title={user.displayName || user.email?.split('@')[0] || 'You'}>
                    <div className="relative">
                        <Avatar className="h-8 w-8 mb-0.5" data-ai-hint="person avatar">
                            {user.photoURL ? <AvatarImage src={user.photoURL} alt={user.displayName || 'Your avatar'} /> : null }
                            <AvatarFallback>{(user.displayName || user.email || 'U').substring(0,1).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-card" />
                    </div>
                     <p className="text-xs text-muted-foreground truncate w-full">You</p>
                 </div>
            )}
          </div>
        </div>

        <ScrollArea className="flex-grow p-3 space-y-3" ref={scrollAreaRef}>
          {isLoadingMessages && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoadingMessages && messages.length === 0 && (
            <div className="flex justify-center items-center h-full">
              <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          )}
          {!isLoadingMessages && messages.map(msg => (
            <div key={msg.id} className={`flex gap-2 ${msg.userId === user?.uid ? 'justify-end' : ''}`}>
              {msg.userId !== user?.uid && (
                <Avatar className="h-8 w-8" data-ai-hint="person avatar">
                   <AvatarImage src={getSenderAvatar(msg.userId, msg.userName) || `https://placehold.co/40x40.png?text=${(msg.userName || 'U').charAt(0).toUpperCase()}`} alt={getSenderName(msg.userId, msg.userName)} />
                  <AvatarFallback>{getSenderName(msg.userId, msg.userName).charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-[70%] p-2 rounded-lg shadow-sm ${msg.userId === user?.uid ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {msg.userId !== user?.uid && <p className="text-xs font-semibold mb-0.5">{getSenderName(msg.userId, msg.userName)}</p>}
                <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.userId === user?.uid ? 'text-primary-foreground/70' : 'text-muted-foreground/70'} ${msg.userId === user?.uid ? 'text-right' : 'text-left'}`}>
                  {formatTimestamp(msg.timestamp)}
                </p>
              </div>
               {msg.userId === user?.uid && user && (
                <Avatar className="h-8 w-8" data-ai-hint="person avatar">
                  {user.photoURL ? <AvatarImage src={user.photoURL} alt="Your avatar"/> : null}
                  <AvatarFallback><UserCircle size={20}/></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-2 border-t">
        <form onSubmit={handleSendMessage} className="w-full flex items-center gap-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={user ? "Type a message..." : "Please log in to chat"}
            className="flex-grow h-9 text-sm"
            disabled={!user || !projectId || isSending || isLoadingMessages}
          />
          <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={!user || !projectId || isSending || isLoadingMessages || newMessage.trim() === ''}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={18} />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatPanel;
