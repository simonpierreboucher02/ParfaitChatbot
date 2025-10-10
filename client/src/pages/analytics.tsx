import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Users, Globe, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import VisitorMap from "@/components/visitor-map";

interface AnalyticsData {
  totalVisitors: number;
  activeSessions: number;
  countriesCount: number;
  avgResponseTime: number;
  topCountries: Array<{ name: string; count: number; percentage: number }>;
  topTopics: Array<{ topic: string; count: number }>;
  visitorLocations: Array<{ lat: number; lon: number; country: string | null; city: string | null }>;
}

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  const metrics = [
    {
      title: "Total Visitors",
      value: analytics?.totalVisitors || 0,
      icon: Users,
      trend: "+12%",
      color: "text-chart-1",
    },
    {
      title: "Active Sessions",
      value: analytics?.activeSessions || 0,
      icon: Activity,
      trend: "+5%",
      color: "text-chart-2",
    },
    {
      title: "Countries Reached",
      value: analytics?.countriesCount || 0,
      icon: Globe,
      trend: "+3",
      color: "text-chart-3",
    },
    {
      title: "Avg. Response Time",
      value: analytics?.avgResponseTime ? `${analytics.avgResponseTime}ms` : "0ms",
      icon: TrendingUp,
      trend: "-15%",
      color: "text-chart-4",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-analytics-title">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track visitor engagement and chatbot performance
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="hover-elevate" data-testid={`card-metric-${metric.title.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold" data-testid={`text-metric-${metric.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    {metric.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-chart-1">{metric.trend}</span> from last month
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Visitor locations worldwide</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="space-y-4" data-testid="list-geographic-distribution">
                {analytics?.topCountries?.length > 0 ? (
                  analytics.topCountries.map((country, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Globe className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{country.name}</p>
                          <p className="text-xs text-muted-foreground">{country.count} visitors</p>
                        </div>
                      </div>
                      <div className="text-sm font-medium">{country.percentage}%</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No geographic data yet</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Topics</CardTitle>
            <CardDescription>Most discussed subjects</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="space-y-4" data-testid="list-popular-topics">
                {analytics?.topTopics?.length > 0 ? (
                  analytics.topTopics.map((topic, idx) => {
                    const maxCount = analytics!.topTopics[0].count;
                    const percentage = Math.round((topic.count / maxCount) * 100);
                    return (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1 capitalize">{topic.topic}</p>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="ml-4 text-sm font-medium">{topic.count}</div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No topic data yet</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Real-Time Visitor Map</CardTitle>
          <CardDescription>
            Live visualization of chatbot interactions worldwide
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : analytics?.visitorLocations && analytics.visitorLocations.length > 0 ? (
            <VisitorMap locations={analytics.visitorLocations} />
          ) : (
            <div className="relative h-96 bg-muted/20 rounded-lg border border-border flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Globe className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm font-medium mb-1">No Visitor Data Yet</p>
                <p className="text-xs">Start a conversation to see visitor locations on the map</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
