import { useGetSustainabilityMetrics } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Recycle, Wind, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function AdminSustainability() {
  const { data: metrics, isLoading } = useGetSustainabilityMetrics({ query: { queryKey: ["adminSustainability"] } });

  if (isLoading || !metrics) {
    return <div className="h-[60vh] w-full animate-pulse bg-card rounded-xl" />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <Leaf className="h-8 w-8 text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
          Sustainability Impact
        </h1>
        <p className="text-muted-foreground">Tracking how AI-driven demand prediction reduces food waste and carbon footprint.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-panel border-white/5 border-t-2 border-t-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Food Waste Reduced</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{metrics.wasteReducedPercent}%</div>
            <p className="text-xs text-muted-foreground mt-1">compared to last month</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5 border-t-2 border-t-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Food Saved (kg)</CardTitle>
            <Recycle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{metrics.foodSavedKg} kg</div>
            <p className="text-xs text-muted-foreground mt-1">total food saved this month</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5 border-t-2 border-t-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Carbon Impact</CardTitle>
            <Wind className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">-{metrics.carbonImpactKg} kg</div>
            <p className="text-xs text-muted-foreground mt-1">CO₂ emissions prevented</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5 border-t-2 border-t-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sustainability Score</CardTitle>
            <Leaf className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{metrics.sustainabilityScore}/100</div>
            <p className="text-xs text-primary mt-1 font-medium">Excellent rating</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-white/5">
        <CardHeader>
          <CardTitle className="text-white">Demand Planning Efficiency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white">AI Prediction Accuracy</span>
              <span className="text-primary font-bold">{metrics.improvedDemandPlanningPercent}%</span>
            </div>
            <Progress value={metrics.improvedDemandPlanningPercent} className="h-2 bg-white/10" />
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Our demand prediction model has reached {metrics.improvedDemandPlanningPercent}% accuracy this week, leading to optimal ingredient preparation and significantly reduced end-of-day surplus.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
