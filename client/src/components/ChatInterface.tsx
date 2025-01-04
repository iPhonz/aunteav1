import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, ExternalLink } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Avatar } from "@/components/ui/avatar";

type Message = {
  role: "user" | "assistant";
  content: string;
  references?: Array<{
    title: string;
    url: string;
    imageUrl?: string;
  }>;
};

export function ChatInterface() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
  }, [messages]);

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          references: data.references || []
        }
      ]);
      setInput("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    sendMessage(input);
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        {messages.map((message, i) => (
          <div
            key={i}
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
        ))}
        {isPending && (
          <div className="flex items-start gap-3">
            <Avatar className="w-8 h-8">
              <span className="font-semibold text-sm">AT</span>
            </Avatar>
            <div className="flex items-center gap-2 p-4 rounded-lg bg-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-muted-foreground">AunTea is thinking...</span>
            </div>
          </div>
        )}
      </ScrollArea>

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
    </Card>
  );
}