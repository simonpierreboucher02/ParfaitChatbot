import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Code, Eye, Palette, Settings2, ExternalLink, Copy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Widget() {
  const { toast } = useToast();
  const { data: chatbot } = useQuery({
    queryKey: ["/api/chatbot"],
  });

  const { data: company } = useQuery({
    queryKey: ["/api/company"],
  });

  const [config, setConfig] = useState({
    primaryColor: chatbot?.primaryColor || "#8b5cf6",
    position: chatbot?.position || "right",
    title: chatbot?.name || "AI Assistant",
  });

  const widgetCode = `<!-- AgentiLab ChatBuilder Widget -->
<script>
  window.agentiLabConfig = {
    botId: "${chatbot?.id || 'your-bot-id'}",
    primaryColor: "${config.primaryColor}",
    position: "${config.position}",
    title: "${config.title}"
  };
</script>
<script src="${window.location.origin}/widget.js"></script>`;

  const chatbotUrl = company?.slug 
    ? `${window.location.origin}/chat/${company.slug}`
    : `${window.location.origin}/chat`;

  const copyCode = () => {
    navigator.clipboard.writeText(widgetCode);
    toast({
      title: "Copied!",
      description: "Widget code copied to clipboard",
    });
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(chatbotUrl);
    toast({
      title: "Copied!",
      description: "Chatbot URL copied to clipboard",
    });
  };

  const openChatbot = () => {
    window.open(chatbotUrl, "_blank", "width=500,height=700");
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-widget-title">Widget Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Customize and embed your chatbot on any website
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary" />
            Standalone Chatbot
          </CardTitle>
          <CardDescription>
            Open your chatbot in a dedicated window or share the direct link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-muted rounded-md text-sm font-mono">
              <span className="truncate" data-testid="text-chatbot-url">{chatbotUrl}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={copyUrl}
                data-testid="button-copy-chatbot-url"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </Button>
              <Button
                onClick={openChatbot}
                data-testid="button-open-chatbot"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Chatbot
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Use this URL to open the chatbot in fullscreen mode or share it with your team for testing
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription>Customize your widget's look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="widget-title">Widget Title</Label>
              <Input
                id="widget-title"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                placeholder="AI Assistant"
                data-testid="input-widget-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="widget-color">Primary Color</Label>
              <div className="flex gap-3">
                <Input
                  id="widget-color"
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  className="h-10 w-20"
                  data-testid="input-widget-color"
                />
                <Input
                  value={config.primaryColor}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  placeholder="#8b5cf6"
                  data-testid="input-widget-color-hex"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="widget-position">Position</Label>
              <Select value={config.position} onValueChange={(value) => setConfig({ ...config, position: value })}>
                <SelectTrigger id="widget-position" data-testid="select-widget-position">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Bottom Left</SelectItem>
                  <SelectItem value="right">Bottom Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Live Preview
            </CardTitle>
            <CardDescription>See how your widget will appear</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative h-80 bg-muted/20 rounded-lg border overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                <p>Website Preview</p>
              </div>
              
              {/* Widget Bubble */}
              <button
                className="absolute bottom-6 shadow-lg rounded-full h-14 w-14 flex items-center justify-center transition-transform hover:scale-105"
                style={{
                  backgroundColor: config.primaryColor,
                  [config.position === "left" ? "left" : "right"]: "1.5rem",
                }}
                data-testid="preview-widget-bubble"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="white"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              The widget will appear as a floating button on your website
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="code" className="w-full">
        <TabsList>
          <TabsTrigger value="code" data-testid="tab-embed-code">
            <Code className="h-4 w-4 mr-2" />
            Embed Code
          </TabsTrigger>
          <TabsTrigger value="instructions" data-testid="tab-instructions">
            <Settings2 className="h-4 w-4 mr-2" />
            Installation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
              <CardDescription>
                Copy and paste this code into your website's HTML
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto max-h-64" data-testid="code-widget-embed">
                  <code>{widgetCode}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={copyCode}
                  data-testid="button-copy-widget-code"
                >
                  Copy Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Installation Instructions</CardTitle>
              <CardDescription>
                Follow these steps to add the chatbot to your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">1</span>
                  Copy the embed code
                </h4>
                <p className="text-sm text-muted-foreground ml-8">
                  Click the "Copy Code" button in the Embed Code tab above
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">2</span>
                  Add to your website
                </h4>
                <p className="text-sm text-muted-foreground ml-8">
                  Paste the code just before the closing <code className="bg-muted px-1 rounded">&lt;/body&gt;</code> tag in your HTML
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">3</span>
                  Publish and test
                </h4>
                <p className="text-sm text-muted-foreground ml-8">
                  Deploy your website and verify the chatbot appears in the configured position
                </p>
              </div>

              <div className="border-t pt-4 mt-6">
                <h4 className="font-medium mb-2">Supported Platforms</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>✓ WordPress</div>
                  <div>✓ Shopify</div>
                  <div>✓ Wix</div>
                  <div>✓ Webflow</div>
                  <div>✓ Custom HTML</div>
                  <div>✓ React/Next.js</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
