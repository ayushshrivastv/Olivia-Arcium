'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { Send } from 'lucide-react';

type Message = {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  isUser: boolean;
};

const initialMessages: Message[] = [
  {
    id: '1',
    sender: 'TradingBot',
    text: 'Welcome to the live chat! Ask questions about this market or discuss trading ideas.',
    timestamp: new Date(Date.now() - 3600000 * 2),
    isUser: false,
  },
  {
    id: '2',
    sender: 'Alex',
    text: 'Anyone else watching the SOL/USDC price action?',
    timestamp: new Date(Date.now() - 1200000),
    isUser: false,
  },
  {
    id: '3',
    sender: 'Trader123',
    text: 'Strong resistance at 95.50, need to break through for more upside.',
    timestamp: new Date(Date.now() - 600000),
    isUser: false,
  },
];

export default function ChatArea({ market }: { market: string }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const message: Message = {
      id: Date.now().toString(),
      sender: 'You',
      text: newMessage,
      timestamp: new Date(),
      isUser: true,
    };

    setMessages((prevMessages) => [...prevMessages, message]);
    setNewMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full border-t border-border/20 pt-2 bg-background text-foreground">
      <div className="sticky top-0 bg-background z-20 py-1 px-2 flex items-center justify-between">
        <div className="font-medium text-sm">Live Chat: {market}</div>
        <div className="px-2 py-1 text-xs bg-secondary/20 rounded-full">
          {messages.length} messages
        </div>
      </div>

      <ScrollArea className="flex-grow h-[calc(100%-90px)]" type="always">
        <div className="space-y-3 p-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex max-w-[85%] ${
                  message.isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {!message.isUser && (
                  <Avatar className="h-6 w-6 mr-1">
                    <AvatarFallback className="bg-primary/20 text-xs">
                      {message.sender.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg px-2 py-1 text-sm ${
                    message.isUser
                      ? 'bg-primary/20 text-primary-foreground ml-1'
                      : 'bg-secondary/20 text-secondary-foreground'
                  }`}
                >
                  {!message.isUser && (
                    <div className="font-medium text-xs">{message.sender}</div>
                  )}
                  <div className="text-white font-semibold">{message.text}</div>
                  <div className="text-xs opacity-70 text-right">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-2 border-t border-border/20 mt-auto">
        <div className="flex">
          <Input
            className="flex-1 h-8 text-sm bg-background border-border/30 focus-visible:ring-primary"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            size="sm"
            className="ml-1 h-8 w-8 p-0 bg-primary/20 hover:bg-primary/30 text-foreground"
            onClick={handleSendMessage}
            disabled={newMessage.trim() === ''}
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
