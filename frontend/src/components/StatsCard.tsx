import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

function getScoreColor(value: string | number): string {
  const num = typeof value === "number" ? value : parseFloat(String(value));
  if (isNaN(num)) return "";
  if (num >= 80) return "text-green-600";
  if (num >= 60) return "text-yellow-600";
  if (num >= 40) return "text-orange-500";
  return "text-red-600";
}

export default function StatsCard({ title, value, subtitle, icon: Icon, trend }: StatsCardProps) {
  // Only apply score color when value is a pure number (scores, not rank strings like "#3")
  const isNumericScore = typeof value === "number";
  const colorClass = isNumericScore ? getScoreColor(value) : "";

  return (
    <Card data-testid={`card-stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div
          className={`text-3xl font-bold ${colorClass}`}
          data-testid={`text-value-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {value}
        </div>
        {subtitle && (
          <p className="text-xs mt-1 text-muted-foreground">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
