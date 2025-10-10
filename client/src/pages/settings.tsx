import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Code, Save, Upload as UploadIcon, Image } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  description: z.string().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  industry: z.string().optional(),
  logoUrl: z.string().optional(),
});

type CompanyForm = z.infer<typeof companySchema>;

export default function Settings() {
  const { toast } = useToast();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const { data: company, isLoading } = useQuery({
    queryKey: ["/api/company"],
  });

  const { data: chatbot } = useQuery({
    queryKey: ["/api/chatbot"],
  });

  const form = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    values: company || {
      name: "",
      description: "",
      website: "",
      industry: "",
      logoUrl: "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CompanyForm) => {
      return await apiRequest("PUT", "/api/company", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company"] });
      toast({
        title: "Success",
        description: "Company settings saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save company settings",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CompanyForm) => {
    updateMutation.mutate(data);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("logo", file);

    try {
      const response: any = await apiRequest("POST", "/api/company/logo", formData);
      form.setValue("logoUrl", response.logoUrl);
      queryClient.invalidateQueries({ queryKey: ["/api/company"] });
      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  };

  const widgetCode = `<script src="${window.location.origin}/widget.js" data-bot="${chatbot?.id || 'your-bot-id'}"></script>`;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-settings-title">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your company information and integration settings
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Company Information
              </CardTitle>
              <CardDescription>
                Update your company details for better chatbot context
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Inc." {...field} data-testid="input-company-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} data-testid="input-website" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input placeholder="Technology, Healthcare, Finance..." {...field} data-testid="input-industry" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your company and what you do..."
                        className="min-h-[100px] resize-none"
                        {...field}
                        data-testid="textarea-description"
                      />
                    </FormControl>
                    <FormDescription>
                      This helps the AI understand your business context
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Logo</FormLabel>
                    <div className="flex items-center gap-4">
                      {field.value && (
                        <Avatar className="h-16 w-16 rounded-md">
                          <AvatarImage src={field.value} alt="Company logo" />
                          <AvatarFallback className="rounded-md">
                            <Image className="h-8 w-8 text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById("logo-upload")?.click()}
                            disabled={uploadingLogo}
                            data-testid="button-upload-logo"
                          >
                            <UploadIcon className="h-4 w-4 mr-2" />
                            {uploadingLogo ? "Uploading..." : "Upload Logo"}
                          </Button>
                          <input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </div>
                        <FormControl>
                          <Input 
                            placeholder="Or enter logo URL: https://example.com/logo.png" 
                            {...field} 
                            data-testid="input-logo-url"
                            className="text-sm"
                          />
                        </FormControl>
                      </div>
                    </div>
                    <FormDescription>
                      Upload an image or provide a URL. Displayed in the chatbot widget.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={updateMutation.isPending} data-testid="button-save-settings">
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </Form>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            Widget Integration
          </CardTitle>
          <CardDescription>
            Embed your chatbot on any website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Embed Code</p>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto" data-testid="code-widget-embed">
                  <code>{widgetCode}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    navigator.clipboard.writeText(widgetCode);
                    toast({
                      title: "Copied!",
                      description: "Widget code copied to clipboard",
                    });
                  }}
                  data-testid="button-copy-code"
                >
                  Copy
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Add this code snippet to your website's HTML, just before the closing &lt;/body&gt; tag
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
