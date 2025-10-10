import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Array<{ title: string; url?: string | null }>;
}

export default function ChatTest() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, sessionId }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));
              
              if (data.content) {
                assistantMessage += data.content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  
                  if (lastMessage?.role === "assistant") {
                    newMessages[newMessages.length - 1] = {
                      ...lastMessage,
                      content: assistantMessage,
                    };
                  } else {
                    newMessages.push({
                      role: "assistant",
                      content: assistantMessage,
                    });
                  }
                  
                  return newMessages;
                });
              }

              if (data.done && data.sessionId) {
                setSessionId(data.sessionId);
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
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-chat-test-title">
          Chat Test
        </h1>
        <p className="text-muted-foreground mt-2">
          Test your AI chatbot with real-time streaming responses
        </p>
      </div>

      <Card className="max-w-4xl mx-auto w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Assistant
          </CardTitle>
          <CardDescription>
            Powered by OpenRouter and your knowledge base
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t">
            <div
              ref={scrollRef}
              className="h-[500px] overflow-y-auto p-6 space-y-4"
              data-testid="chat-messages"
            >
              {messages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm font-medium mb-1">Start a conversation</p>
                  <p className="text-xs">Ask me anything about your company or documents</p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  data-testid={`message-${idx}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
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
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3 justify-start">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-primary/50 animate-bounce" />
                      <div className="h-2 w-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="h-2 w-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-muted/20">
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1"
                  data-testid="input-chat-message"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
