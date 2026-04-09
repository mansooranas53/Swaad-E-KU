import { useGetStaffDailySummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, TrendingUp, Clock, FileWarning, DollarSign, Package } from "lucide-react";

export default function StaffSummary() {
  const { data: summary, isLoading } = useGetStaffDailySummary({
    query: { queryKey: ["staffSummary"] }
  });

  if (isLoading || !summary) {
    return <div className="h-[60vh] w-full animate-pulse bg-card rounded-xl" />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Daily Summary</h1>
        <p className="text-muted-foreground">End of day metrics and operational performance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glass-panel border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders Served</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{summary.totalOrdersServed}</div>
            <p className="text-xs text-green-500 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Most Ordered Item</CardTitle>
            <Utensils className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white truncate">{summary.mostOrderedItem || "N/A"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.quantitySold} portions prepared
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">${summary.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Busiest Hour</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{summary.busiestHour}</div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{summary.pendingOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently in queue</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cancelled Orders</CardTitle>
            <FileWarning className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{summary.cancelledOrders}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
