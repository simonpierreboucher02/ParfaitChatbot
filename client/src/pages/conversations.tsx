import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Calendar, MapPin, Bot } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Conversation {
  id: string;
  sessionId: string;
  visitorIp: string;
  visitorCountry: string | null;
  visitorCity: string | null;
  messageCount: number;
  createdAt: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Array<{ title: string; url: string | null }>;
  createdAt: string;
}

export default function Conversations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const { data: conversations, isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: messages } = useQuery<Message[]>({
    queryKey: ["/api/conversations", selectedConversation?.id, "messages"],
    enabled: !!selectedConversation,
  });

  const filteredConversations = conversations?.filter((conv) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      conv.visitorCountry?.toLowerCase().includes(search) ||
      conv.visitorCity?.toLowerCase().includes(search) ||
      conv.sessionId?.toLowerCase().includes(search) ||
      conv.visitorIp?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-conversations-title">Conversations</h1>
        <p className="text-muted-foreground mt-2">
          View and analyze chat history with your visitors
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversation History</CardTitle>
          <CardDescription>
            All chatbot interactions with visitors
          </CardDescription>
          <div className="pt-4">
            <Input
              placeholder="Search by location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
              data-testid="input-search-conversations"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredConversations?.length > 0 ? (
            <div className="space-y-2" data-testid="list-conversations">
              {filteredConversations.map((conv: any) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className="w-full text-left p-4 rounded-lg border hover-elevate transition-all"
                  data-testid={`conversation-${conv.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">Conversation #{conv.sessionId.slice(0, 8)}</p>
                          <Badge variant="outline" className="text-xs">
                            {conv.messageCount || 0} messages
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {conv.visitorCity && conv.visitorCountry 
                              ? `${conv.visitorCity}, ${conv.visitorCountry}` 
                              : conv.visitorCountry || "Unknown Location"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(conv.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm font-medium mb-1">No conversations yet</p>
              <p className="text-xs">Conversations will appear here once visitors start chatting</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedConversation} onOpenChange={(open) => !open && setSelectedConversation(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Conversation Details</DialogTitle>
            <DialogDescription>
              {selectedConversation?.visitorCity && selectedConversation?.visitorCountry
                ? `${selectedConversation.visitorCity}, ${selectedConversation.visitorCountry}`
                : selectedConversation?.visitorCountry || "Unknown location"}
              {" • "}
              {selectedConversation?.createdAt && new Date(selectedConversation.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4" data-testid="conversation-messages">
            {messages?.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                data-testid={`message-${msg.id}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs opacity-70 mb-1">Sources:</p>
                      {msg.citations.map((citation: any, idx: number) => (
                        <p key={idx} className="text-xs opacity-70">
                          [{idx + 1}] {citation.title}
                        </p>
                      ))}
                    </div>
                  )}
                  <p className="text-xs opacity-70 mt-2">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary flex-shrink-0">
                    <span className="text-xs font-medium">U</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
