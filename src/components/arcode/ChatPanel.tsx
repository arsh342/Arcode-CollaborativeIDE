"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Send, UserCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  user: string;
  avatar?: string;
  text: string;
  timestamp: string;
  isCurrentUser?: boolean;
}

const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [usersOnline, setUsersOnline] = useState([
    { id: '1', name: 'Alice', online: true, avatar: 'https://placehold.co/40x40.png?text=A' },
    { id: '2', name: 'Bob', online: true, avatar: 'https://placehold.co/40x40.png?text=B' },
    { id: '3', name: 'Charlie', online: false, avatar: 'https://placehold.co/40x40.png?text=C' },
  ]);

  useEffect(() => {
    // Mock initial messages
    setMessages([
      { id: '1', user: 'Alice', text: 'Hey everyone, starting on the new feature!', timestamp: new Date(Date.now() - 60000 * 5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), avatar: 'https://placehold.co/40x40.png?text=A' },
      { id: '2', user: 'Bob', text: 'Sounds good! Let me know if you need help with the API.', timestamp: new Date(Date.now() - 60000 * 3).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), avatar: 'https://placehold.co/40x40.png?text=B' },
      { id: '3', user: 'You', text: 'Will do, thanks Bob!', timestamp: new Date(Date.now() - 60000 * 1).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isCurrentUser: true },
    ]);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    const msg: ChatMessage = {
      id: String(Date.now()),
      user: 'You',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true,
    };
    setMessages(prev => [...prev, msg]);
    setNewMessage('');

    // Mock a reply for demo
    setTimeout(() => {
      const replyUser = usersOnline.find(u => u.id === '1' && u.online) || usersOnline.find(u => u.online);
      if (replyUser) {
        setMessages(prev => [...prev, {
          id: String(Date.now() + 1),
          user: replyUser.name,
          avatar: replyUser.avatar,
          text: `Got it, thanks for the update!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      }
    }, 1500);
  };

  return (
    <Card className="h-full flex flex-col border-0 shadow-none rounded-none">
      <CardHeader className="py-2 px-3 border-b">
        <CardTitle className="text-xs font-medium uppercase tracking-wider">Project Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0 flex flex-col overflow-hidden">
        <div className="p-3 border-b">
          <h3 className="text-xs font-medium mb-2">Online Users</h3>
          <div className="flex space-x-2">
            {usersOnline.map(user => (
              <div key={user.id} className="flex flex-col items-center">
                <Avatar className="h-8 w-8 relative" data-ai-hint="person avatar">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  {user.online && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />}
                </Avatar>
                <span className="text-xs mt-1 text-muted-foreground">{user.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
        <ScrollArea className="flex-grow p-3 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2 ${msg.isCurrentUser ? 'justify-end' : ''}`}>
              {!msg.isCurrentUser && (
                <Avatar className="h-8 w-8" data-ai-hint="person avatar">
                  <AvatarImage src={msg.avatar} alt={msg.user} />
                  <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-[70%] p-2 rounded-lg shadow-sm ${msg.isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {!msg.isCurrentUser && <p className="text-xs font-semibold mb-0.5">{msg.user}</p>}
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground/70'} ${msg.isCurrentUser ? 'text-right' : 'text-left'}`}>{msg.timestamp}</p>
              </div>
               {msg.isCurrentUser && (
                <Avatar className="h-8 w-8" data-ai-hint="person avatar">
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
            placeholder="Type a message..."
            className="flex-grow h-9 text-sm"
          />
          <Button type="submit" size="icon" className="h-9 w-9 shrink-0">
            <Send size={18} />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatPanel;
