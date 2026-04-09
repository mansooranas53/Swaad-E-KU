import { useGetPeakHours } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Clock } from "lucide-react";

export default function AdminPeakHours() {
  const { data: peakHours, isLoading } = useGetPeakHours({ query: { queryKey: ["adminPeakHours"] } });

  if (isLoading || !peakHours) {
    return <div className="h-[60vh] w-full animate-pulse bg-card rounded-xl" />;
  }

  // Assuming peakHours is an array of { hour, orders }
  const data = peakHours || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <Clock className="h-8 w-8 text-primary glow-primary" />
          Peak Hours
        </h1>
        <p className="text-muted-foreground">Analyze the busiest times of day to optimize staffing.</p>
      </div>

      <Card className="glass-panel border-white/5">
        <CardHeader>
          <CardTitle className="text-white">Orders by Time of Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="hour" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
                  {data.map((entry: any, index: number) => {
                    // Highlight the highest bar
                    const maxOrders = Math.max(...data.map((d: any) => d.orders));
                    const isMax = entry.orders === maxOrders;
                    return (
                      <Cell key={`cell-${index}`} fill={isMax ? 'hsl(var(--primary))' : 'hsl(var(--secondary))'} />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
