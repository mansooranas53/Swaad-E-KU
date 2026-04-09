import { useListPredictions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, TrendingUp, TrendingDown, Minus, AlertTriangle, Leaf } from "lucide-react";

export default function AdminPredictions() {
  const { data: predictions = [], isLoading } = useListPredictions({ query: { queryKey: ["adminPredictions"] } });

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getRiskBadge = (risk: string) => {
    if (risk === 'high') return <Badge variant="destructive" className="bg-red-500/20 text-red-500 border-none">High Waste Risk</Badge>;
    if (risk === 'medium') return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 border-none">Medium Risk</Badge>;
    return <Badge variant="outline" className="border-green-500/30 text-green-500 bg-green-500/10">Low Risk</Badge>;
  };

  if (isLoading) {
    return <div className="h-[60vh] w-full animate-pulse bg-card rounded-xl" />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-primary glow-primary" />
          AI Demand Predictions
        </h1>
        <p className="text-muted-foreground">Machine learning models predict today's demand to optimize kitchen prep.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-panel border-white/5 bg-gradient-to-br from-primary/10 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5 text-primary" /> Recommendation: Scale Up
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/90">
            Based on historical data and current campus events, expect a <strong className="text-primary">20% surge</strong> in Lunch orders between 12 PM - 1 PM. 
            Prepare extra <strong className="text-primary">Rajma Rice</strong> (+45 plates) today.
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5 bg-gradient-to-br from-destructive/10 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Recommendation: Reduce Prep
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/90">
            Demand for Pasta is trending down significantly compared to yesterday. 
            Reduce prep by <strong className="text-destructive">30%</strong> to prevent potential food waste.
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {predictions.map(pred => (
          <Card key={pred.id} className="glass-panel border-white/5 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2 flex flex-row justify-between items-start">
              <CardTitle className="text-lg font-bold text-white">{pred.itemName}</CardTitle>
              {getRiskBadge(pred.wasteRisk)}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Predicted Demand</div>
                  <div className="text-4xl font-black text-white glow-primary">{pred.predictedQuantity} <span className="text-base font-normal text-muted-foreground">units</span></div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    Confidence: <span className="text-primary font-bold">{pred.confidence}%</span>
                  </div>
                  {getTrendIcon(pred.trend)}
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Yesterday Sold:</span>
                <span className="text-white font-medium">{pred.yesterdaySold} units</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
