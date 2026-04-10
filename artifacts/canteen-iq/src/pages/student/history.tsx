import { useListOrders } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { format } from "date-fns";
import { Receipt, RefreshCcw } from "lucide-react";

export default function StudentHistory() {
  const { data: orders = [], isLoading } = useListOrders({
    query: {
      queryKey: ["allOrders", "student"],
    }
  });

  const historyOrders = orders.filter(o => o.status === "picked_up" || o.status === "cancelled");
  const sortedOrders = [...historyOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (isLoading) {
    return <div className="h-32 w-full animate-pulse bg-card rounded-xl" />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Order History</h1>
        <p className="text-muted-foreground">Your past orders and receipts.</p>
      </div>

      {sortedOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[40vh]">
          <Receipt className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-xl font-semibold text-foreground">No history found</h2>
          <p className="text-muted-foreground mt-2">You haven't completed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map(order => (
            <Card key={order.id} className="glass-panel border-border hover:bg-muted/10 transition-colors">
              <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-foreground">Token #{order.tokenNumber}</span>
                    <Badge variant={order.status === "picked_up" ? "outline" : "destructive"} className="uppercase text-[10px] tracking-wider">
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="text-left md:text-right flex-1 md:flex-none">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold text-foreground">₹{order.totalAmount.toFixed(2)}</p>
                  </div>
                  <Link href="/student/menu">
                    <Button variant="secondary" size="sm" className="shrink-0 bg-muted hover:bg-muted/80 text-foreground">
                      <RefreshCcw className="h-3 w-3 mr-2" /> Reorder
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
