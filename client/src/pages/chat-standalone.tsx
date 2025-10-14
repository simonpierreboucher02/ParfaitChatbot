import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: { title: string; url: string | null }[];
}

export default function ChatStandalone() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Extract slug from URL path (/chat/company-slug)
  const slug = window.location.pathname.split('/').filter(Boolean)[1] || '';

  interface Chatbot {
    id: string;
    name: string;
    primaryColor: string;
    llmModel: string;
    systemPrompt?: string;
  }

  const { data: chatbot, isLoading, error } = useQuery<Chatbot>({
    queryKey: ["/api/chatbot", slug],
    enabled: !!slug,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          sessionId: sessionId || undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (reader) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "" },
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));
              
              if (data.done) {
                if (data.sessionId && !sessionId) {
                  setSessionId(data.sessionId);
                }
              } else if (data.content) {
                assistantMessage += data.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1].content = assistantMessage;
                  return updated;
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading chatbot...</p>
        </div>
      </div>
    );
  }

  // Error state - no slug or chatbot not found
  if (!slug || error || !chatbot) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-8">
          <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Chatbot Not Found</h2>
          <p className="text-muted-foreground mb-4">
            {!slug 
              ? "No company identifier in the URL."
              : "This chatbot doesn't exist or has been removed."}
          </p>
          <p className="text-sm text-muted-foreground">
            Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen w-screen flex flex-col"
      style={{
        backgroundColor: chatbot?.primaryColor 
          ? `${chatbot.primaryColor}10` 
          : "hsl(var(--background))",
      }}
    >
      {/* Header */}
      <div 
        className="border-b p-4 flex items-center gap-3"
        style={{
          backgroundColor: "hsl(var(--card))",
          borderColor: "hsl(var(--border))",
        }}
      >
        <div 
          className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: chatbot?.primaryColor || "hsl(var(--primary))",
          }}
        >
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-lg" data-testid="text-chatbot-name">
            {chatbot?.name || "AI Assistant"}
          </h1>
          <p className="text-xs text-muted-foreground">
            Powered by {chatbot?.llmModel?.split("/")[0] || "AI"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        data-testid="chat-messages"
      >
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground max-w-md">
              <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">
                Welcome to {chatbot?.name || "AI Assistant"}
              </h2>
              <p className="text-sm">
                {chatbot?.systemPrompt || "Ask me anything! I'm here to help."}
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            data-testid={`message-${idx}`}
          >
            {msg.role === "assistant" && (
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: chatbot?.primaryColor 
                    ? `${chatbot.primaryColor}20` 
                    : "hsl(var(--primary) / 0.1)",
                }}
              >
                <Bot 
                  className="h-4 w-4"
                  style={{
                    color: chatbot?.primaryColor || "hsl(var(--primary))",
                  }}
                />
              </div>
            )}
            
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.role === "user"
                  ? "text-white"
                  : "bg-card"
              }`}
              style={{
                backgroundColor: msg.role === "user" 
                  ? chatbot?.primaryColor || "hsl(var(--primary))"
                  : undefined,
              }}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <p className="text-xs opacity-70 mb-1">Sources:</p>
                  {msg.citations.map((citation, cidx) => (
                    <p key={cidx} className="text-xs opacity-70">
                      [{cidx + 1}] {citation.title}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium">U</span>
              </div>
            )}
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.content === "" && (
          <div className="flex gap-3 justify-start">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: chatbot?.primaryColor 
                  ? `${chatbot.primaryColor}20` 
                  : "hsl(var(--primary) / 0.1)",
              }}
            >
              <Loader2 
                className="h-4 w-4 animate-spin"
                style={{
                  color: chatbot?.primaryColor || "hsl(var(--primary))",
                }}
              />
            </div>
            <div className="max-w-[70%] rounded-lg p-3 bg-card">
              <p className="text-sm text-muted-foreground">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div 
        className="border-t p-4"
        style={{
          backgroundColor: "hsl(var(--card))",
          borderColor: "hsl(var(--border))",
        }}
      >
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isStreaming}
            className="flex-1"
            data-testid="input-chat-message"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            size="icon"
            style={{
              backgroundColor: chatbot?.primaryColor || "hsl(var(--primary))",
            }}
            data-testid="button-send-message"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Send className="h-4 w-4 text-white" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
