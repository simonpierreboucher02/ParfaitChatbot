import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FileText, Upload, Globe, Trash2, AlertCircle, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Documents() {
  const { toast } = useToast();
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [crawlerType, setCrawlerType] = useState<"internal" | "exa">("internal");

  const { data: documents, isLoading } = useQuery({
    queryKey: ["/api/documents"],
  });

  const crawlMutation = useMutation({
    mutationFn: async ({ url, type }: { url: string; type: "internal" | "exa" }) => {
      return await apiRequest("POST", "/api/crawl", { url, crawlerType: type });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Crawl completed",
        description: data.message || "Your website content has been successfully indexed",
      });
      setWebsiteUrl("");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.message || "Failed to crawl website";
      toast({
        title: "Crawl failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      await apiRequest("POST", "/api/documents/upload", formData);
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: `${files.length} file(s) uploaded successfully`,
      });
      e.target.value = "";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCrawl = () => {
    if (!websiteUrl) return;
    crawlMutation.mutate({ url: websiteUrl, type: crawlerType });
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-documents-title">Documents</h1>
        <p className="text-muted-foreground mt-2">
          Upload files or crawl your website to build your chatbot's knowledge base
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Documents are automatically processed and converted into embeddings for semantic search
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upload" data-testid="tab-upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </TabsTrigger>
          <TabsTrigger value="crawl" data-testid="tab-crawl">
            <Globe className="h-4 w-4 mr-2" />
            Crawl Website
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>
                Upload PDF, DOCX, TXT, CSV files to enhance your chatbot's knowledge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover-elevate transition-all">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-sm font-medium mb-1">
                      Click to upload or drag and drop
                    </div>
                    <div className="text-xs text-muted-foreground">
                      PDF, DOCX, TXT, CSV (max 10MB each)
                    </div>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    data-testid="input-file-upload"
                    disabled={uploading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crawl" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Crawl Website</CardTitle>
              <CardDescription>
                Extract content from your website automatically with AI-powered crawling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Crawler Type</Label>
                  <Select value={crawlerType} onValueChange={(val: "internal" | "exa") => setCrawlerType(val)}>
                    <SelectTrigger data-testid="select-crawler-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Internal Crawler</div>
                            <div className="text-xs text-muted-foreground">Basic web scraping</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="exa">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <div>
                            <div className="font-medium">Exa AI Crawler</div>
                            <div className="text-xs text-muted-foreground">Neural embeddings-based extraction</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3">
                  <Input
                    placeholder="https://example.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    data-testid="input-website-url"
                  />
                  <Button
                    onClick={handleCrawl}
                    disabled={!websiteUrl || crawlMutation.isPending}
                    data-testid="button-start-crawl"
                  >
                    {crawlerType === "exa" ? (
                      <Sparkles className="h-4 w-4 mr-2" />
                    ) : (
                      <Globe className="h-4 w-4 mr-2" />
                    )}
                    {crawlMutation.isPending ? "Crawling..." : "Start Crawl"}
                  </Button>
                </div>
                
                {crawlMutation.isPending && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Crawling in progress... This may take a few minutes depending on website size.
                    </AlertDescription>
                  </Alert>
                )}
                
                {crawlerType === "exa" && (
                  <Alert>
                    <Sparkles className="h-4 w-4 text-primary" />
                    <AlertDescription>
                      Exa AI uses neural search to extract high-quality content with better understanding of page structure and relevance
                    </AlertDescription>
                  </Alert>
                )}
                
                <p className="text-sm text-muted-foreground">
                  {crawlerType === "exa" 
                    ? "Exa AI will intelligently extract semantic content from your website (up to 10 pages)"
                    : "Basic crawler will extract text content from your website (up to 10 pages)"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Indexed Documents</CardTitle>
          <CardDescription>
            {documents?.length || 0} documents in your knowledge base
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : documents?.length > 0 ? (
            <div className="space-y-2" data-testid="list-documents">
              {documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover-elevate transition-all"
                  data-testid={`document-${doc.id}`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" data-testid={`text-doc-title-${doc.id}`}>
                        {doc.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {doc.sourceType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(doc.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${doc.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm font-medium mb-1">No documents yet</p>
              <p className="text-xs">Upload files or crawl your website to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
