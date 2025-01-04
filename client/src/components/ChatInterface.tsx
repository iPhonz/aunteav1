import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, ExternalLink, Plus } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Message = {
  role: "user" | "assistant";
  content: string;
  references?: Array<{
    title: string;
    url: string;
    imageUrl?: string;
  }>;
};

type ChatSession = {
  id: number;
  title: string;
  messages: Message[];
};

export function ChatInterface() {
  const [input, setInput] = useState("");
  const [activeSession, setActiveSession] = useState<string>("new");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch chat sessions
  const { data: sessions, isLoading: isLoadingSessions, refetch: refetchSessions } = useQuery<ChatSession[]>({
    queryKey: ["/api/chat/sessions"],
  });

  // Create new session mutation
  const { mutate: createSession } = useMutation({
    mutationFn: async (title: string) => {
      const response = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) throw new Error("Failed to create session");
      return response.json();
    },
  });

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [sessions]);

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async ({ message, sessionId }: { message: string; sessionId: string }) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: () => {
      setInput("");
      refetchSessions();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    if (activeSession === "new") {
      // Create new session with first message as title
      createSession(input.slice(0, 50), {
        onSuccess: (newSession) => {
          setActiveSession(newSession.id.toString());
          sendMessage({ message: input, sessionId: newSession.id.toString() });
        },
      });
    } else {
      sendMessage({ message: input, sessionId: activeSession });
    }
  };

  if (isLoadingSessions) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <Tabs
        value={activeSession}
        onValueChange={setActiveSession}
        className="w-full h-full flex flex-col"
      >
        <div className="border-b px-4 py-2">
          <TabsList className="h-10 w-full overflow-x-auto flex gap-2">
            <TabsTrigger value="new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Chat
            </TabsTrigger>
            {sessions?.map((session) => (
              <TabsTrigger key={session.id} value={session.id.toString()}>
                {session.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="new" className="flex-1 flex flex-col">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Start a new chat with AunTea
            </div>
          </ScrollArea>
          <ChatInput
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isPending={isPending}
          />
        </TabsContent>

        {sessions?.map((session) => (
          <TabsContent
            key={session.id}
            value={session.id.toString()}
            className="flex-1 flex flex-col"
          >
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
              {session.messages.map((message, i) => (
                <ChatMessage key={i} message={message} />
              ))}
              {isPending && <ThinkingIndicator />}
            </ScrollArea>
            <ChatInput
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isPending={isPending}
            />
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}

function ChatMessage({ message }: { message: Message }) {
  return (
    <div
      className={`mb-6 ${
        message.role === "user" ? "flex justify-end" : "flex justify-start"
      }`}
    >
      <div className="flex items-start max-w-[80%] gap-3">
        {message.role === "assistant" && (
          <Avatar className="w-8 h-8">
            <span className="font-semibold text-sm">AT</span>
          </Avatar>
        )}
        <div>
          <div
            className={`p-4 rounded-lg ${
              message.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}
          >
            {message.content}
          </div>
          {message.references && message.references.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.references.map((ref, idx) => (
                <a
                  key={idx}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-2 rounded-md bg-card hover:bg-secondary/50 transition-colors"
                >
                  {ref.imageUrl && (
                    <img
                      src={ref.imageUrl}
                      alt={ref.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{ref.title}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Read full article
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <Avatar className="w-8 h-8">
        <span className="font-semibold text-sm">AT</span>
      </Avatar>
      <div className="flex items-center gap-2 p-4 rounded-lg bg-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-muted-foreground">AunTea is thinking...</span>
      </div>
    </div>
  );
}

function ChatInput({
  input,
  setInput,
  handleSubmit,
  isPending,
}: {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}) {
  return (
    <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask AunTea about the news..."
        disabled={isPending}
        className="flex-1"
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}