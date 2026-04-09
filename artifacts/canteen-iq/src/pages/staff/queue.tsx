import { useListOrders, useUpdateOrderStatus, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChefHat, CheckCircle2, Package, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StaffQueue() {
  const { data: orders = [], isLoading } = useListOrders({
    query: {
      queryKey: ["staffQueue"],
      refetchInterval: 10000,
    }
  });

  const updateStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const activeOrders = orders.filter(o => o.status !== "picked_up" && o.status !== "cancelled");
  // Sort by pickup time, then creation time
  activeOrders.sort((a, b) => {
    if (a.pickupTime === b.pickupTime) {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return a.pickupTime.localeCompare(b.pickupTime);
  });

  const handleUpdateStatus = (id: number, newStatus: any) => {
    updateStatus.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          queryClient.invalidateQueries({ queryKey: ["staffQueue"] });
          toast({ title: "Status Updated", description: `Order status set to ${newStatus.replace('_', ' ')}` });
        }
      }
    );
  };

  if (isLoading) {
    return <div className="h-32 w-full animate-pulse bg-card rounded-xl" />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Live Queue</h1>
          <p className="text-muted-foreground">Manage active orders in the kitchen.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Pending Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" /> Pending
            </h2>
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 border-none">
              {activeOrders.filter(o => o.status === "pending").length}
            </Badge>
          </div>
          
          <div className="space-y-4">
            {activeOrders.filter(o => o.status === "pending").map(order => (
              <Card key={order.id} className="glass-panel border-white/5 border-l-2 border-l-yellow-500 shadow-lg">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-muted-foreground">Token Number</div>
                      <div className="text-2xl font-black text-white">#{order.tokenNumber}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">{order.pickupTime}</div>
                      <div className="text-xs text-muted-foreground">{order.userFullName}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground mb-1">Items</div>
                    <div className="font-medium text-white/90">
                      {/* Would normally list items here, but Order model just has totalAmount and token unless it's OrderDetail */}
                      <span className="text-xs bg-white/10 px-2 py-1 rounded">View details for items</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white" 
                    size="sm"
                    disabled={updateStatus.isPending}
                    onClick={() => handleUpdateStatus(order.id, "preparing")}
                  >
                    <ChefHat className="h-4 w-4 mr-2" /> Start Preparing
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Preparing Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <ChefHat className="h-4 w-4 text-primary" /> Preparing
            </h2>
            <Badge variant="secondary" className="bg-primary/20 text-primary border-none">
              {activeOrders.filter(o => o.status === "preparing").length}
            </Badge>
          </div>
          
          <div className="space-y-4">
            {activeOrders.filter(o => o.status === "preparing").map(order => (
              <Card key={order.id} className="glass-panel border-white/5 border-l-2 border-l-primary shadow-lg bg-primary/5">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-primary/80">Token Number</div>
                      <div className="text-2xl font-black text-white">#{order.tokenNumber}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">{order.pickupTime}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <Button 
                    className="w-full bg-green-500 hover:bg-green-600 text-white" 
                    size="sm"
                    disabled={updateStatus.isPending}
                    onClick={() => handleUpdateStatus(order.id, "ready")}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Ready
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Ready Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" /> Ready
            </h2>
            <Badge variant="secondary" className="bg-green-500/20 text-green-500 border-none">
              {activeOrders.filter(o => o.status === "ready").length}
            </Badge>
          </div>
          
          <div className="space-y-4">
            {activeOrders.filter(o => o.status === "ready").map(order => (
              <Card key={order.id} className="glass-panel border-white/5 border-l-2 border-l-green-500 shadow-lg bg-green-500/5">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-green-500/80">Token Number</div>
                      <div className="text-3xl font-black text-green-400 glow-primary">#{order.tokenNumber}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">{order.userFullName}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <Button 
                    className="w-full bg-white text-black hover:bg-white/90" 
                    size="sm"
                    disabled={updateStatus.isPending}
                    onClick={() => handleUpdateStatus(order.id, "picked_up")}
                  >
                    <Package className="h-4 w-4 mr-2" /> Handed Over
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
