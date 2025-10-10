import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Search, Filter, DollarSign, Zap, Brain, Play, Copy, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  top_provider?: {
    max_completion_tokens?: number;
  };
  architecture?: {
    modality?: string;
    tokenizer?: string;
  };
}

export default function ModelsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [selectedModel, setSelectedModel] = useState<OpenRouterModel | null>(null);
  const [playgroundOpen, setPlaygroundOpen] = useState(false);
  const [testPrompt, setTestPrompt] = useState("Tell me a fun fact about AI");
  const [testResponse, setTestResponse] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const { data: models, isLoading } = useQuery<OpenRouterModel[]>({
    queryKey: ["/api/openrouter/models"],
  });

  // Extract unique providers from model IDs
  const providers = Array.from(
    new Set(models?.map(m => m.id.split("/")[0]) || [])
  ).sort();

  // Filter models
  const filteredModels = models?.filter(model => {
    const matchesSearch = 
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProvider = 
      providerFilter === "all" || 
      model.id.startsWith(providerFilter + "/");
    
    const promptPrice = parseFloat(model.pricing.prompt);
    const matchesPrice = 
      priceFilter === "all" ||
      (priceFilter === "free" && promptPrice === 0) ||
      (priceFilter === "low" && promptPrice > 0 && promptPrice < 0.000005) ||
      (priceFilter === "medium" && promptPrice >= 0.000005 && promptPrice < 0.00002) ||
      (priceFilter === "high" && promptPrice >= 0.00002);

    return matchesSearch && matchesProvider && matchesPrice;
  }) || [];

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (num === 0) return "Free";
    return `$${(num * 1000000).toFixed(2)}/M tokens`;
  };

  const testModel = async () => {
    if (!selectedModel || !testPrompt.trim()) return;

    setIsTesting(true);
    setTestResponse("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: testPrompt,
          chatbotId: "playground",
          conversationId: "playground",
          model: selectedModel.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to test model");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  setTestResponse(prev => prev + parsed.content);
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      }

      toast({
        title: "Test Complete",
        description: "Model response generated successfully",
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Failed to test model",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const copyModelId = () => {
    if (selectedModel) {
      navigator.clipboard.writeText(selectedModel.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Model ID copied to clipboard",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold" data-testid="heading-models">OpenRouter Model Marketplace</h1>
        </div>
        <p className="text-muted-foreground">
          Browse and select from 400+ AI models across multiple providers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-models"
          />
        </div>

        <Select value={providerFilter} onValueChange={setProviderFilter}>
          <SelectTrigger data-testid="select-provider-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Providers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            {providers.map(provider => (
              <SelectItem key={provider} value={provider}>
                {provider}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priceFilter} onValueChange={setPriceFilter}>
          <SelectTrigger data-testid="select-price-filter">
            <DollarSign className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Prices" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="low">Low ($0-5/M)</SelectItem>
            <SelectItem value="medium">Medium ($5-20/M)</SelectItem>
            <SelectItem value="high">High ($20+/M)</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-normal">
            {filteredModels.length} models
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModels.map(model => {
            const provider = model.id.split("/")[0];
            const promptPrice = parseFloat(model.pricing.prompt);
            const isFree = promptPrice === 0;

            return (
              <Card
                key={model.id}
                className={`hover-elevate cursor-pointer transition-all ${
                  selectedModel?.id === model.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedModel(model)}
                data-testid={`card-model-${model.id}`}
              >
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate" data-testid={`text-model-name-${model.id}`}>
                        {model.name}
                      </CardTitle>
                      <CardDescription className="text-xs truncate" data-testid={`text-model-id-${model.id}`}>
                        {model.id}
                      </CardDescription>
                    </div>
                    <Badge variant={isFree ? "default" : "secondary"} className="shrink-0">
                      {provider}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {model.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {model.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      {model.context_length.toLocaleString()} ctx
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {formatPrice(model.pricing.prompt)}
                    </Badge>
                    {model.architecture?.modality && (
                      <Badge variant="outline" className="text-xs">
                        <Brain className="h-3 w-3 mr-1" />
                        {model.architecture.modality}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && filteredModels.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No models found matching your criteria</p>
        </div>
      )}

      {selectedModel && (
        <Card className="sticky bottom-6">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="truncate" data-testid="text-selected-model-name">{selectedModel.name}</CardTitle>
                <CardDescription className="truncate" data-testid="text-selected-model-id">{selectedModel.id}</CardDescription>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Dialog open={playgroundOpen} onOpenChange={setPlaygroundOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" size="default" data-testid="button-test-model">
                      <Play className="h-4 w-4 mr-2" />
                      Test Model
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Model Playground</DialogTitle>
                      <DialogDescription>
                        Test {selectedModel.name} with a custom prompt
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Prompt</label>
                        <Textarea
                          value={testPrompt}
                          onChange={(e) => setTestPrompt(e.target.value)}
                          placeholder="Enter your test prompt..."
                          className="min-h-[100px]"
                          data-testid="textarea-test-prompt"
                        />
                      </div>
                      <Button 
                        onClick={testModel}
                        disabled={isTesting || !testPrompt.trim()}
                        className="w-full"
                        data-testid="button-run-test"
                      >
                        {isTesting ? "Testing..." : "Run Test"}
                      </Button>
                      {testResponse && (
                        <div>
                          <label className="text-sm font-medium mb-2 block">Response</label>
                          <div className="p-4 rounded-md bg-muted min-h-[200px] whitespace-pre-wrap" data-testid="text-test-response">
                            {testResponse}
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                <Button 
                  onClick={copyModelId}
                  variant="outline"
                  size="default"
                  data-testid="button-copy-model-id"
                >
                  {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedModel.description && (
              <p className="text-sm">{selectedModel.description}</p>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Context Length</p>
                <p className="font-medium">{selectedModel.context_length.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Input Price</p>
                <p className="font-medium">{formatPrice(selectedModel.pricing.prompt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Output Price</p>
                <p className="font-medium">{formatPrice(selectedModel.pricing.completion)}</p>
              </div>
              {selectedModel.top_provider?.max_completion_tokens && (
                <div>
                  <p className="text-xs text-muted-foreground">Max Output</p>
                  <p className="font-medium">
                    {selectedModel.top_provider.max_completion_tokens.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
