import { useQuery } from "@tanstack/react-query";
import { Bot, FileText, MessageSquare, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const statCards = [
    {
      title: "Total Conversations",
      value: stats?.conversations || 0,
      icon: MessageSquare,
      description: "Active chat sessions",
      color: "text-chart-1",
    },
    {
      title: "Documents Indexed",
      value: stats?.documents || 0,
      icon: FileText,
      description: "Knowledge base size",
      color: "text-chart-2",
    },
    {
      title: "Active Chatbots",
      value: stats?.chatbots || 1,
      icon: Bot,
      description: "Live AI agents",
      color: "text-chart-3",
    },
    {
      title: "Interactions",
      value: stats?.interactions || 0,
      icon: TrendingUp,
      description: "Last 30 days",
      color: "text-chart-4",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-dashboard-title">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor your AI chatbot performance and analytics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover-elevate" data-testid={`card-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold" data-testid={`text-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {stat.value.toLocaleString()}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest chatbot interactions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4" data-testid="list-recent-activity">
                {stats?.recentConversations?.length > 0 ? (
                  stats.recentConversations.map((conv: any) => (
                    <div key={conv.id} className="flex items-start gap-4 p-3 rounded-lg hover-elevate">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{conv.visitorCountry || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(conv.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No conversations yet</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your chatbot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/chatbot"
              className="flex items-center gap-3 p-4 rounded-lg border hover-elevate transition-all"
              data-testid="link-configure-chatbot"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Configure Chatbot</p>
                <p className="text-xs text-muted-foreground">Set up AI model and personality</p>
              </div>
            </a>
            <a
              href="/documents"
              className="flex items-center gap-3 p-4 rounded-lg border hover-elevate transition-all"
              data-testid="link-upload-documents"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Upload Documents</p>
                <p className="text-xs text-muted-foreground">Add knowledge to your chatbot</p>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
