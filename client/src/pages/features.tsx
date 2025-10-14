import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Brain, Globe, MessageSquare, BarChart3, Zap, Shield, Palette } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: "AI-Powered Chatbots",
      description: "Create intelligent chatbots trained on your company's knowledge base using advanced RAG technology."
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "400+ LLM Models",
      description: "Access GPT-5, Claude 3.5, Gemini Pro, Llama 3.1, and 400+ models via OpenRouter integration."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Website Crawling",
      description: "Automatically crawl and process your website content to build a comprehensive knowledge base."
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Real-time Streaming",
      description: "Deliver fast, streaming responses for natural conversations with your customers."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics & Insights",
      description: "Track conversations, visitor locations, and chatbot performance with detailed analytics."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Easy Integration",
      description: "Embed your chatbot anywhere with a simple widget or share standalone chatbot URLs."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Multi-Tenant Security",
      description: "Enterprise-grade security with complete data isolation for each company account."
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Custom Branding",
      description: "Personalize your chatbot with custom colors, logos, and personality to match your brand."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2" data-testid="link-home">
              <Bot className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl">AgentiLab ChatBuilder</span>
            </a>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth">
              <Button variant="ghost" data-testid="button-login">
                Login
              </Button>
            </Link>
            <Link href="/auth">
              <Button data-testid="button-get-started">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="flex flex-col items-center text-center gap-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Build Intelligent AI Chatbots
            <span className="text-primary"> Powered by Your Knowledge</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Transform your content into conversational AI experiences. Train chatbots on your data,
            deploy anywhere, and deliver exceptional customer support 24/7.
          </p>
          <div className="flex gap-4 mt-4">
            <Link href="/auth">
              <Button size="lg" data-testid="button-hero-start">
                Start Building
              </Button>
            </Link>
            <Button size="lg" variant="outline" asChild data-testid="button-hero-demo">
              <a href="#features">View Features</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create, deploy, and manage AI chatbots for your business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover-elevate" data-testid={`card-feature-${index}`}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get your AI chatbot up and running in minutes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload Your Content</h3>
            <p className="text-muted-foreground">
              Add documents or crawl your website to build your knowledge base
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2">Configure Your Bot</h3>
            <p className="text-muted-foreground">
              Choose from 400+ AI models and customize personality and branding
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2">Deploy Anywhere</h3>
            <p className="text-muted-foreground">
              Embed on your website or share a standalone chatbot URL
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <div className="bg-primary/5 rounded-2xl p-12 text-center border">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Your AI Chatbot?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join businesses using AgentiLab ChatBuilder to provide instant, intelligent support
          </p>
          <Link href="/auth">
            <Button size="lg" data-testid="button-cta-start">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 AgentiLab ChatBuilder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
