import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bot, Palette, Settings2, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

const chatbotSchema = z.object({
  name: z.string().min(1, "Name is required"),
  personality: z.string(),
  language: z.string(),
  primaryColor: z.string(),
  position: z.string(),
  llmModel: z.string(),
  temperature: z.string(),
  systemPrompt: z.string().optional(),
});

type ChatbotForm = z.infer<typeof chatbotSchema>;

const LLM_MODELS = [
  { value: "openai/gpt-5", label: "GPT-5 (Latest)", description: "Most advanced OpenAI model" },
  { value: "openai/gpt-4o", label: "GPT-4o", description: "Balanced performance" },
  { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet", description: "Anthropic's best" },
  { value: "anthropic/claude-3-opus", label: "Claude 3 Opus", description: "High reasoning" },
  { value: "google/gemini-pro", label: "Gemini Pro", description: "Google's flagship" },
  { value: "meta-llama/llama-3.1-70b", label: "Llama 3.1 70B", description: "Meta's open model" },
];

export default function ChatbotSetup() {
  const { toast } = useToast();
  const { data: chatbot, isLoading } = useQuery({
    queryKey: ["/api/chatbot"],
  });

  const form = useForm<ChatbotForm>({
    resolver: zodResolver(chatbotSchema),
    values: chatbot || {
      name: "AI Assistant",
      personality: "professional",
      language: "en",
      primaryColor: "#8b5cf6",
      position: "right",
      llmModel: "openai/gpt-5",
      temperature: "0.7",
      systemPrompt: "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ChatbotForm) => {
      return await apiRequest("PUT", "/api/chatbot", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot"] });
      toast({
        title: "Success",
        description: "Chatbot configuration saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save chatbot configuration",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ChatbotForm) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-chatbot-setup-title">Chatbot Setup</h1>
        <p className="text-muted-foreground mt-2">
          Configure your AI assistant's personality, model, and appearance
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                AI Configuration
              </CardTitle>
              <CardDescription>Choose the AI model and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chatbot Name</FormLabel>
                    <FormControl>
                      <Input placeholder="AI Assistant" {...field} data-testid="input-chatbot-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="llmModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Model</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-llm-model">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LLM_MODELS.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            <div>
                              <div className="font-medium">{model.label}</div>
                              <div className="text-xs text-muted-foreground">{model.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Select from 400+ models via OpenRouter</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature: {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={2}
                        step={0.1}
                        value={[parseFloat(field.value)]}
                        onValueChange={(vals) => field.onChange(vals[0].toString())}
                        data-testid="slider-temperature"
                      />
                    </FormControl>
                    <FormDescription>
                      Lower = more focused, Higher = more creative
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="personality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personality</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-personality">
                          <SelectValue placeholder="Select personality" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="concise">Concise</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the chatbot widget</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Color</FormLabel>
                    <div className="flex gap-3">
                      <FormControl>
                        <Input type="color" {...field} className="h-10 w-20" data-testid="input-primary-color" />
                      </FormControl>
                      <Input value={field.value} onChange={field.onChange} placeholder="#8b5cf6" data-testid="input-color-hex" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Widget Position</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-widget-position">
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="left">Bottom Left</SelectItem>
                        <SelectItem value="right">Bottom Right</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="systemPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="You are a helpful AI assistant for our company..."
                        className="min-h-[120px] resize-none"
                        {...field}
                        data-testid="textarea-system-prompt"
                      />
                    </FormControl>
                    <FormDescription>
                      Define custom behavior and context for your chatbot
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="md:col-span-2 flex justify-end gap-3">
            <Button type="submit" size="lg" disabled={updateMutation.isPending} data-testid="button-save-chatbot">
              <Settings2 className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
