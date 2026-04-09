import { useListOrders } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Clock, ChefHat, CheckCircle2, ListOrdered, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StaffDashboard() {
  const { data: orders = [] } = useListOrders({
    query: {
      queryKey: ["staffOrders", "today"],
    }
  });

  const pending = orders.filter(o => o.status === "pending").length;
  const preparing = orders.filter(o => o.status === "preparing").length;
  const ready = orders.filter(o => o.status === "ready").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Staff Dashboard</h1>
          <p className="text-muted-foreground">Kitchen overview and live order status.</p>
        </div>
        <Link href="/staff/queue">
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-full glow-primary">
            <ListOrdered className="h-4 w-4 mr-2" /> Live Queue
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass-panel border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Clock className="h-24 w-24 text-yellow-500" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black text-white">{pending}</div>
            <p className="text-xs text-yellow-500 mt-1 flex items-center gap-1 font-medium">
              <Clock className="h-3 w-3" /> Waiting to be started
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ChefHat className="h-24 w-24 text-primary" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Preparing</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black text-white">{preparing}</div>
            <p className="text-xs text-primary mt-1 flex items-center gap-1 font-medium">
              <ChefHat className="h-3 w-3" /> Currently in kitchen
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CheckCircle2 className="h-24 w-24 text-green-500" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ready for Pickup</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black text-white">{ready}</div>
            <p className="text-xs text-green-500 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 className="h-3 w-3" /> Waiting for student
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-panel border-white/5">
          <CardHeader>
            <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href="/staff/menu" className="flex items-center justify-between p-4 rounded-xl bg-black/40 hover:bg-white/5 transition-colors border border-white/5">
              <div className="font-medium text-white">Update Stock Levels</div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </Link>
            <Link href="/staff/summary" className="flex items-center justify-between p-4 rounded-xl bg-black/40 hover:bg-white/5 transition-colors border border-white/5">
              <div className="font-medium text-white">View Daily Summary</div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
