import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BookOpen, 
  Bot, 
  Upload, 
  Settings, 
  Code, 
  BarChart3,
  MessageSquare,
  Palette
} from "lucide-react";

type DocSection = {
  id: string;
  title: string;
  icon: any;
  content: React.ReactNode;
};

export default function Documentation() {
  const [selectedSection, setSelectedSection] = useState("getting-started");

  const sections: DocSection[] = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <BookOpen className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Welcome to AgentiLab ChatBuilder</h3>
            <p className="text-muted-foreground mb-4">
              AgentiLab ChatBuilder allows you to create intelligent AI chatbots trained on your company's knowledge base.
              Follow this guide to get started quickly.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">Quick Start Steps</h4>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Set up your company profile in Settings</li>
              <li>Upload documents or crawl your website to build the knowledge base</li>
              <li>Configure your chatbot's personality and model in Chatbot settings</li>
              <li>Get your widget code or standalone chatbot URL from Widget page</li>
              <li>Deploy your chatbot on your website or share the link</li>
            </ol>
          </div>

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm">
              <strong>Tip:</strong> Start by configuring your company profile and uploading at least a few documents 
              before testing your chatbot to ensure it has enough context to provide helpful answers.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "company-setup",
      title: "Company Setup",
      icon: <Settings className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Configure Your Company Profile</h3>
            <p className="text-muted-foreground mb-4">
              Your company profile is the foundation of your chatbot's identity and branding.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">Settings Page</h4>
            <p className="text-muted-foreground mb-3">Navigate to <strong>Settings</strong> from the sidebar to configure:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Company Name:</strong> Your business name (automatically generates a unique URL slug)</li>
              <li><strong>Company Logo:</strong> Upload your brand logo for chatbot customization</li>
              <li><strong>Brand Colors:</strong> Customize primary and secondary colors to match your brand</li>
            </ul>
          </div>

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm">
              <strong>Important:</strong> Your company slug (generated from company name) is used in your public 
              chatbot URL. For example: <code className="bg-background px-1 py-0.5 rounded">https://yourapp.com/chat/acme-corp</code>
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "knowledge-base",
      title: "Knowledge Base",
      icon: <Upload className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Build Your Knowledge Base</h3>
            <p className="text-muted-foreground mb-4">
              Train your chatbot by uploading documents or crawling your website.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">Upload Documents</h4>
            <p className="text-muted-foreground mb-3">Go to <strong>Documents</strong> page to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Upload PDF, DOCX, or TXT files containing your company information</li>
              <li>Documents are automatically processed and converted into embeddings</li>
              <li>Chatbot uses these documents to answer customer questions</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2 mt-4">Website Crawler</h4>
            <p className="text-muted-foreground mb-3">Automatically extract content from your website:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Enter your website URL in the crawler section</li>
              <li>Set crawl depth (how many pages to follow from the starting URL)</li>
              <li>Click "Start Crawling" to automatically extract and process website content</li>
            </ul>
          </div>

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm">
              <strong>Best Practice:</strong> Upload your most important documents first (FAQs, product docs, policies). 
              You can always add more content later to improve chatbot responses.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "chatbot-config",
      title: "Chatbot Configuration",
      icon: <Bot className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Configure Your AI Chatbot</h3>
            <p className="text-muted-foreground mb-4">
              Customize your chatbot's behavior, personality, and AI model.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">Chatbot Settings</h4>
            <p className="text-muted-foreground mb-3">Navigate to <strong>Chatbot</strong> page to configure:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Chatbot Name:</strong> The name displayed to users in the chat interface</li>
              <li><strong>Personality:</strong> Define how the chatbot should behave (professional, friendly, technical, etc.)</li>
              <li><strong>AI Model:</strong> Choose from 400+ models including GPT-4, Claude, Gemini, Llama</li>
              <li><strong>Temperature:</strong> Control response creativity (0 = consistent, 1 = creative)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2 mt-4">Model Selection</h4>
            <p className="text-muted-foreground mb-3">
              Visit the <strong>Models</strong> page to browse and test 400+ available AI models:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Search models by name or provider</li>
              <li>Filter by price tier (Free, Low, Medium, High)</li>
              <li>Test models in the live playground before selecting</li>
              <li>Copy model ID to use in chatbot configuration</li>
            </ul>
          </div>

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm">
              <strong>Recommendation:</strong> Start with <code className="bg-background px-1 py-0.5 rounded">openai/gpt-4o-mini</code> 
              for a balance of quality and cost. Test different models in the playground to find the best fit.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "deployment",
      title: "Deployment & Widget",
      icon: <Code className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Deploy Your Chatbot</h3>
            <p className="text-muted-foreground mb-4">
              Embed your chatbot on your website or share a standalone chatbot page.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">Widget Integration</h4>
            <p className="text-muted-foreground mb-3">Go to <strong>Widget</strong> page to get your embed code:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Copy the provided JavaScript snippet</li>
              <li>Paste it before the closing <code className="bg-background px-1 py-0.5 rounded">&lt;/body&gt;</code> tag on your website</li>
              <li>The chatbot widget will appear in the bottom-right corner</li>
              <li>Customize widget appearance using the preview</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2 mt-4">Standalone Chatbot URL</h4>
            <p className="text-muted-foreground mb-3">
              Share a direct link to your chatbot without embedding:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Get your unique chatbot URL from the Widget page</li>
              <li>Format: <code className="bg-background px-1 py-0.5 rounded">https://yourapp.com/chat/your-company-slug</code></li>
              <li>Share this link on social media, emails, or QR codes</li>
              <li>Opens a fullscreen chatbot interface (no sidebar/header)</li>
            </ul>
          </div>

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm">
              <strong>Security Note:</strong> Your chatbot URL is public and can be accessed by anyone. 
              Make sure your knowledge base contains only information you want to be publicly accessible.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "analytics",
      title: "Analytics & Monitoring",
      icon: <BarChart3 className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Monitor Your Chatbot Performance</h3>
            <p className="text-muted-foreground mb-4">
              Track conversations, visitor data, and chatbot effectiveness.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">Conversations</h4>
            <p className="text-muted-foreground mb-3">Navigate to <strong>Conversations</strong> page to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>View all chat sessions with timestamps and locations</li>
              <li>Search conversations by session ID or IP address</li>
              <li>Click on any conversation to view full message history</li>
              <li>Identify common questions and improve your knowledge base</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2 mt-4">Analytics Dashboard</h4>
            <p className="text-muted-foreground mb-3">Go to <strong>Analytics</strong> page for insights:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Total visitors and active sessions</li>
              <li>Visitor geographic distribution on interactive map</li>
              <li>Top countries accessing your chatbot</li>
              <li>Popular topics and frequently asked questions</li>
              <li>Average response times</li>
            </ul>
          </div>

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm">
              <strong>Privacy Note:</strong> Geolocation is based on IP addresses. Private IPs (internal networks) 
              show as "Unknown Location" to protect privacy.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "customization",
      title: "Branding & Customization",
      icon: <Palette className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Customize Your Chatbot Appearance</h3>
            <p className="text-muted-foreground mb-4">
              Make your chatbot match your brand identity with custom colors and styling.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">Brand Colors</h4>
            <p className="text-muted-foreground mb-3">In <strong>Settings</strong> page, customize:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Primary Color:</strong> Main brand color used for buttons and highlights</li>
              <li><strong>Secondary Color:</strong> Supporting color for accents and backgrounds</li>
              <li>Colors automatically adapt to light and dark themes</li>
              <li>Preview changes in real-time before saving</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2 mt-4">Chatbot Personality</h4>
            <p className="text-muted-foreground mb-3">
              Define how your chatbot communicates in <strong>Chatbot</strong> settings:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Professional tone for corporate environments</li>
              <li>Friendly and casual for customer-facing services</li>
              <li>Technical and precise for developer documentation</li>
              <li>Use the personality field to guide AI behavior</li>
            </ul>
          </div>

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm">
              <strong>Example Personality:</strong> "You are a helpful and friendly customer support assistant for Acme Corp. 
              Be professional but approachable. Keep responses concise and always offer to help with additional questions."
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "testing",
      title: "Testing Your Chatbot",
      icon: <MessageSquare className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Test Before Deploying</h3>
            <p className="text-muted-foreground mb-4">
              Always test your chatbot thoroughly before making it public.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">Test Chat Interface</h4>
            <p className="text-muted-foreground mb-3">Use the <strong>Chat Test</strong> feature to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Send test messages and verify chatbot responses</li>
              <li>Check if the bot retrieves correct information from your documents</li>
              <li>Test different question formats and edge cases</li>
              <li>Verify streaming responses work correctly</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2 mt-4">Model Playground</h4>
            <p className="text-muted-foreground mb-3">
              Test different AI models in the <strong>Models</strong> page:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Compare responses from different models</li>
              <li>Test model quality before committing</li>
              <li>Verify model understands your use case</li>
              <li>Check response speed and streaming performance</li>
            </ul>
          </div>

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm">
              <strong>Testing Checklist:</strong> Test common questions, verify document retrieval, check response quality, 
              test edge cases, verify mobile responsiveness, and ensure widget loads correctly on your website.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const selectedSectionData = sections.find(s => s.id === selectedSection) || sections[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Documentation</h1>
        <p className="text-muted-foreground">
          Learn how to use AgentiLab ChatBuilder to create and deploy AI-powered chatbots
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop Navigation */}
        <div className="hidden lg:block lg:w-64 space-y-2">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={selectedSection === section.id ? "default" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setSelectedSection(section.id)}
              data-testid={`button-doc-${section.id}`}
            >
              {section.icon}
              {section.title}
            </Button>
          ))}
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger className="w-full" data-testid="select-doc-section">
              <SelectValue placeholder="Select a topic" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((section) => (
                <SelectItem key={section.id} value={section.id}>
                  <div className="flex items-center gap-2">
                    {section.icon}
                    {section.title}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {selectedSectionData.icon}
                </div>
                <div>
                  <CardTitle>{selectedSectionData.title}</CardTitle>
                  <CardDescription>Complete guide and best practices</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              {selectedSectionData.content}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
