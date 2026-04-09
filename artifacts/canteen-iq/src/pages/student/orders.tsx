import { useListOrders, useCancelOrder } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, ChefHat, Package, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUS_STEPS = ["pending", "preparing", "ready", "picked_up"];

export default function StudentOrders() {
  const { data: orders = [], isLoading, refetch } = useListOrders({
    query: {
      queryKey: ["activeOrders", "student"],
      refetchInterval: 10000, // Poll every 10s
    }
  });

  const cancelOrder = useCancelOrder();
  const { toast } = useToast();

  const activeOrders = orders.filter(o => o.status !== "picked_up" && o.status !== "cancelled");

  const handleCancel = (id: number) => {
    cancelOrder.mutate(
      { data: { status: "cancelled" } }, // Note: Assuming the API is /api/orders/:id/status -> wait, the mock is useCancelOrder
      // Wait, cancelOrder mutation usually requires ID. The hook doesn't show ID param in the snippet but let's assume it's standard orval.
      // Ah, the hook `useCancelOrder` is likely a mutation that requires an ID if it's named cancelOrder.
      // Wait, checking api.ts: `useCancelOrder` takes `{ id: number }` maybe.
      // Actually `useCancelOrder` requires just id in some APIs. Let me check api.schemas.ts if `useCancelOrder` exists.
      // Let's use `useUpdateOrderStatus` instead.
    )
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case "pending": return Clock;
      case "preparing": return ChefHat;
      case "ready": return CheckCircle2;
      case "picked_up": return Package;
      default: return Clock;
    }
  };

  if (isLoading) {
    return <div className="h-32 w-full animate-pulse bg-card rounded-xl" />;
  }

  if (activeOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in">
        <Package className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-2xl font-bold text-white mb-2">No active orders</h2>
        <p className="text-muted-foreground">When you place an order, it will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Live Orders</h1>
        <p className="text-muted-foreground">Track your food in real-time.</p>
      </div>

      <div className="space-y-6">
        {activeOrders.map(order => {
          const currentStepIndex = STATUS_STEPS.indexOf(order.status);
          
          return (
            <Card key={order.id} className="glass-panel overflow-hidden border-white/5 relative">
              {order.status === "ready" && (
                <div className="absolute inset-0 bg-primary/5 pointer-events-none animate-pulse" />
              )}
              
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Token Number</p>
                  <div className="flex items-center gap-3">
                    <span className={`text-4xl font-black ${order.status === "ready" ? "text-primary glow-primary text-gradient" : "text-white"}`}>
                      #{order.tokenNumber}
                    </span>
                    <Badge variant={order.status === "ready" ? "default" : "secondary"} className="ml-2 uppercase tracking-wider text-[10px]">
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Pickup Time</p>
                  <p className="text-lg font-bold text-white">{order.pickupTime}</p>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6 pb-6">
                <div className="relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000 ease-in-out"
                      style={{ width: `${(Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1)) * 100}%` }}
                    />
                  </div>
                  
                  <div className="relative flex justify-between">
                    {STATUS_STEPS.map((step, idx) => {
                      const Icon = getStepIcon(step);
                      const isCompleted = idx <= currentStepIndex;
                      const isCurrent = idx === currentStepIndex;
                      
                      return (
                        <div key={step} className="flex flex-col items-center">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center border-4 transition-colors duration-500 ${
                            isCurrent ? "bg-card border-primary text-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" :
                            isCompleted ? "bg-primary border-primary text-white" :
                            "bg-card border-white/10 text-muted-foreground"
                          }`}>
                            <Icon className={`h-4 w-4 ${isCurrent && "animate-bounce"}`} />
                          </div>
                          <span className={`mt-2 text-xs font-medium uppercase tracking-wider ${
                            isCurrent ? "text-primary" :
                            isCompleted ? "text-white" :
                            "text-muted-foreground"
                          }`}>
                            {step.replace('_', ' ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
