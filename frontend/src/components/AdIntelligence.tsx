import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Megaphone, Target, TrendingUp, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "@/config";

interface AdStrategy {
  format: string;
  messaging_type: string;
  spend_bracket: string;
  top_hooks: string[];
}

interface CompetitorStrategy {
  name: string;
  strategy: string;
  strength: string;
  weakness: string;
}

interface MessagingBreakdown {
  discount: number;
  aspirational: number;
  ugc: number;
  comparison: number;
  feature: number;
}

interface AdIntelligenceData {
  keywords_extracted: string[];
  ad_strategy: AdStrategy;
  competitor_strategies: CompetitorStrategy[];
  messaging_breakdown: MessagingBreakdown;
  strategic_gaps: string[];
  recommendations: string[];
}

interface AdIntelligenceProps {
  brandName: string;
  domain: string;
  competitors?: Array<{ name: string; domain: string }>;
  category?: string;
}

export function AdIntelligence({
  brandName,
  domain,
  competitors = [],
  category = "Technology",
}: AdIntelligenceProps) {
  const { data, isLoading, error } = useQuery<AdIntelligenceData>({
    queryKey: ["/api/ad-intelligence", brandName, domain],
    queryFn: async ({ signal }) => {
      // Create abort controller with extended timeout for slow OpenAI API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout
      
      try {
        const res = await fetch(`${API_BASE_URL}/api/ad-intelligence`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand_name: brandName,
            category,
            competitors,
            website_data: { title: brandName, description: domain },
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          if (res.status === 429) {
            throw new Error("OpenAI rate limit reached. Please wait a few minutes and try again.");
          }
          throw new Error(errorData.detail || "Failed to fetch ad intelligence");
        }
        return res.json();
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          throw new Error("Request timed out. The analysis is taking longer than expected.");
        }
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border border-red-200 bg-red-50">
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Ad Intelligence Unavailable</h3>
          <p className="text-sm text-red-700">
            {error?.message || "Unable to load ad intelligence. Please try again."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = Object.entries(data.messaging_breakdown).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
  }));

  return (
    <div className="space-y-6">
      {/* Keywords */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4" />
            Brand Keywords
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.keywords_extracted.map((kw, i) => (
              <Badge key={i} variant="secondary" className="text-sm px-3 py-1">
                {kw}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ad Strategy + Messaging Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ad Strategy */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              Recommended Ad Strategy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Format</p>
                <p className="text-sm font-medium">{data.ad_strategy.format}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Spend Bracket</p>
                <p className="text-sm font-medium">{data.ad_strategy.spend_bracket}</p>
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Messaging Type</p>
              <p className="text-sm font-medium">{data.ad_strategy.messaging_type}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Top Hooks</p>
              <div className="space-y-2">
                {data.ad_strategy.top_hooks.map((hook, i) => (
                  <div key={i} className="flex gap-2 p-3 border border-border rounded-lg">
                    <span className="text-xs font-bold text-muted-foreground shrink-0">{i + 1}.</span>
                    <p className="text-xs text-foreground leading-relaxed">"{hook}"</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messaging Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Messaging Mix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
              >
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                <Tooltip formatter={(value) => [`${value}%`, "Share"]} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="hsl(var(--chart-1))">
                  {chartData.map((_, i) => (
                    <Cell key={i} fill="hsl(var(--chart-1))" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Competitor Strategies */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Competitor Ad Strategies</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.competitor_strategies.map((comp, i) => (
            <Card key={i} className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{comp.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">{comp.strategy}</p>
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <span className="text-xs text-green-600 font-medium shrink-0">+</span>
                    <p className="text-xs text-muted-foreground">{comp.strength}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs text-red-500 font-medium shrink-0">−</span>
                    <p className="text-xs text-muted-foreground">{comp.weakness}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Strategic Gaps */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            Strategic Gaps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.strategic_gaps.map((gap, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <span className="text-red-500 shrink-0 mt-0.5">•</span>
                {gap}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 p-3 bg-muted rounded-lg">
                <span className="text-sm font-bold text-primary shrink-0">{i + 1}.</span>
                <p className="text-sm text-foreground leading-relaxed">{rec}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
