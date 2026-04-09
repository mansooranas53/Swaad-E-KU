import { useAuth } from "@/lib/auth";
import { useListOrders } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { UtensilsCrossed, Clock, CheckCircle2, ChevronRight, Activity } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  
  const { data: activeOrders = [] } = useListOrders({
    query: {
      queryKey: ["activeOrders", "student"],
    }
  });

  const currentOrders = activeOrders.filter(o => 
    o.status !== "picked_up" && o.status !== "cancelled"
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Welcome back, {user?.fullName?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground">What are you craving today?</p>
        </div>
        <Link href="/student/menu">
          <Button className="bg-primary hover:bg-primary/90 glow-primary rounded-full">
            <UtensilsCrossed className="mr-2 h-4 w-4" />
            Order Now
          </Button>
        </Link>
      </div>

      {currentOrders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-white">Active Orders</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {currentOrders.map(order => (
              <Link href="/student/orders" key={order.id}>
                <Card className="glass-panel hover:bg-card/80 transition-all cursor-pointer border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                      <span>Token #{order.tokenNumber}</span>
                      <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs capitalize">
                        {order.status.replace('_', ' ')}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white mb-1">
                      ${order.totalAmount.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Pickup at {order.pickupTime}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-lg text-white">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href="/student/menu" className="flex items-center justify-between p-4 rounded-xl bg-black/40 hover:bg-white/5 transition-colors border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                  <UtensilsCrossed className="h-5 w-5" />
                </div>
                <div className="font-medium text-white">Browse Menu</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
            <Link href="/student/history" className="flex items-center justify-between p-4 rounded-xl bg-black/40 hover:bg-white/5 transition-colors border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/20 text-secondary">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="font-medium text-white">Order History</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        <Card className="glass-panel overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-20">
             <CheckCircle2 className="h-32 w-32 text-primary" />
          </div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-lg text-white">Why CanteenIQ?</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4 text-muted-foreground">
            <p>Our AI predicts demand to ensure your favorites are always in stock.</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> Skip the line with exact pickup times</li>
              <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-secondary" /> Reduce food waste campus-wide</li>
              <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-green-500" /> Track your order in real-time</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
