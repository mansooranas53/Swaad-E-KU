import { useListOrders, useUpdateOrderStatus, useGetOrder, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChefHat, CheckCircle2, Package, Clock, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function OrderItemsList({ orderId }: { orderId: number }) {
  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { queryKey: ["orderDetail", orderId] }
  });

  if (isLoading) {
    return <div className="h-4 w-full animate-pulse bg-muted rounded mt-1" />;
  }

  if (!order?.items?.length) {
    return <p className="text-xs text-muted-foreground italic">No items found</p>;
  }

  return (
    <ul className="space-y-1">
      {order.items.map((item: any) => (
        <li key={item.id} className="flex items-center justify-between text-sm">
          <span className="text-foreground font-medium">
            <span className="text-primary font-bold mr-1">×{item.quantity}</span>
            {item.menuItemName}
          </span>
          <span className="text-muted-foreground text-xs">₹{(item.price * item.quantity).toFixed(0)}</span>
        </li>
      ))}
    </ul>
  );
}

function OrderCard({ order, statusColor, actionLabel, actionColor, actionStatus, onAction, isPending }: any) {
  return (
    <Card className={`glass-panel border-border border-l-2 ${statusColor} shadow-lg`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Token</div>
            <div className="text-2xl font-black text-foreground">#{order.tokenNumber}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-foreground">{order.pickupTime}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[100px]">{order.userFullName}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3">
        <div className="bg-muted/40 rounded-lg p-3 border border-border">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Order Items</div>
          <OrderItemsList orderId={order.id} />
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <IndianRupee className="h-3 w-3" />
          <span className="font-semibold text-foreground">₹{order.totalAmount.toFixed(2)}</span>
          <span>total</span>
        </div>
        <Button 
          className={`w-full text-white ${actionColor}`}
          size="sm"
          disabled={isPending}
          onClick={() => onAction(order.id, actionStatus)}
        >
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

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
          toast({ title: "Status Updated", description: `Order marked as ${newStatus.replace('_', ' ')}` });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[1,2,3].map(i => <div key={i} className="h-48 rounded-xl animate-pulse bg-card" />)}
      </div>
    );
  }

  const pending = activeOrders.filter(o => o.status === "pending");
  const preparing = activeOrders.filter(o => o.status === "preparing");
  const ready = activeOrders.filter(o => o.status === "ready");

  const ColHeader = ({ icon: Icon, label, count, color }: any) => (
    <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
      <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} /> {label}
      </h2>
      <Badge variant="secondary" className={`border-none text-xs font-bold ${color.replace('text-', 'bg-').replace('500', '500/20')} ${color}`}>
        {count}
      </Badge>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Live Queue</h1>
        <p className="text-muted-foreground">Manage active orders in the kitchen.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Pending */}
        <div>
          <ColHeader icon={Clock} label="Pending" count={pending.length} color="text-yellow-500" />
          <div className="space-y-4">
            {pending.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No pending orders</p>}
            {pending.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                statusColor="border-l-yellow-500"
                actionLabel={<><ChefHat className="h-4 w-4 mr-2" /> Start Preparing</>}
                actionColor="bg-primary hover:bg-primary/90"
                actionStatus="preparing"
                onAction={handleUpdateStatus}
                isPending={updateStatus.isPending}
              />
            ))}
          </div>
        </div>

        {/* Preparing */}
        <div>
          <ColHeader icon={ChefHat} label="Preparing" count={preparing.length} color="text-primary" />
          <div className="space-y-4">
            {preparing.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nothing being prepared</p>}
            {preparing.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                statusColor="border-l-primary"
                actionLabel={<><CheckCircle2 className="h-4 w-4 mr-2" /> Mark Ready</>}
                actionColor="bg-green-600 hover:bg-green-700"
                actionStatus="ready"
                onAction={handleUpdateStatus}
                isPending={updateStatus.isPending}
              />
            ))}
          </div>
        </div>

        {/* Ready */}
        <div>
          <ColHeader icon={CheckCircle2} label="Ready for Pickup" count={ready.length} color="text-green-500" />
          <div className="space-y-4">
            {ready.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nothing ready yet</p>}
            {ready.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                statusColor="border-l-green-500"
                actionLabel={<><Package className="h-4 w-4 mr-2" /> Handed Over</>}
                actionColor="bg-white text-black hover:bg-white/90"
                actionStatus="picked_up"
                onAction={handleUpdateStatus}
                isPending={updateStatus.isPending}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
