import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, Package, TrendingUp, AlertTriangle, Clock, TrendingDown } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary({
    query: { queryKey: ["adminSummary"] }
  });

  if (isLoading || !summary) {
    return <div className="h-[60vh] w-full animate-pulse bg-card rounded-xl" />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Admin Overview</h1>
        <p className="text-muted-foreground">Platform performance and key metrics.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-panel border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Today</CardTitle>
            <IndianRupee className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">₹{summary.revenueToday.toFixed(2)}</div>
            <p className="text-xs text-green-500 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +15% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orders Today</CardTitle>
            <Package className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{summary.totalOrdersToday}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.completedOrders} completed
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Est. Food Waste</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{summary.wasteEstimate} kg</div>
            <p className="text-xs text-green-500 mt-1 flex items-center">
              <TrendingDown className="h-3 w-3 mr-1" /> -5% with AI prediction
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Peak Hour</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{summary.peakHour}</div>
            <p className="text-xs text-muted-foreground mt-1">Busiest time block</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-panel border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Top Selling Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-primary glow-primary text-gradient bg-clip-text text-transparent">
              {summary.topSellingItem}
            </div>
            <Link href="/admin/predictions" className="text-sm text-primary hover:underline mt-4 inline-block">
              View AI Demand Predictions →
            </Link>
          </CardContent>
        </Card>

        <Card className="glass-panel border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Live Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pending in Queue</span>
                <span className="font-bold text-foreground bg-muted px-2 py-1 rounded">{summary.pendingOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Preparing Now</span>
                <span className="font-bold text-primary bg-primary/10 px-2 py-1 rounded">{summary.preparingOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Ready for Pickup</span>
                <span className="font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">{summary.readyOrders}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
