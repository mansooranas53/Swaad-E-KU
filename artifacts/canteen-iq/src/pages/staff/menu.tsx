import { useState } from "react";
import { useListMenuItems, useUpdateMenuItem, getListMenuItemsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StaffMenu() {
  const [search, setSearch] = useState("");
  const { data: menuItems = [], isLoading } = useListMenuItems({ query: { queryKey: ["staffMenuItems"] } });
  const updateMenu = useUpdateMenuItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleAvailable = (id: number, available: boolean) => {
    updateMenu.mutate(
      { id, data: { available } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["staffMenuItems"] });
          queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
        }
      }
    );
  };

  const handleUpdateStock = (id: number, stock: number) => {
    updateMenu.mutate(
      { id, data: { stock } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["staffMenuItems"] });
          toast({ title: "Stock updated" });
        }
      }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Menu Stock</h1>
        <p className="text-muted-foreground">Manage item availability and stock levels.</p>
      </div>

      <div className="flex items-center max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search items..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card border-white/10"
        />
      </div>

      <div className="rounded-xl border border-white/5 bg-card/40 backdrop-blur-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/70">Item Name</TableHead>
              <TableHead className="text-white/70">Category</TableHead>
              <TableHead className="text-white/70">Status</TableHead>
              <TableHead className="text-white/70 text-center">Available</TableHead>
              <TableHead className="text-white/70 text-right w-[150px]">Stock Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id} className={`border-white/5 ${!item.available ? 'opacity-50' : ''} hover:bg-white/5 transition-colors`}>
                <TableCell className="font-medium text-white">{item.name}</TableCell>
                <TableCell className="text-muted-foreground">{item.category}</TableCell>
                <TableCell>
                  {item.stock <= 5 && item.stock > 0 ? (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 border-none">Low Stock</Badge>
                  ) : item.stock === 0 || !item.available ? (
                    <Badge variant="destructive" className="border-none">Out of Stock</Badge>
                  ) : (
                    <Badge variant="outline" className="border-green-500/30 text-green-500 bg-green-500/10">In Stock</Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Switch 
                    checked={item.available} 
                    onCheckedChange={(checked) => handleToggleAvailable(item.id, checked)}
                    disabled={updateMenu.isPending}
                    className="data-[state=checked]:bg-primary"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Input 
                    type="number" 
                    defaultValue={item.stock}
                    className="w-24 ml-auto bg-black/40 border-white/10 text-right"
                    onBlur={(e) => handleUpdateStock(item.id, parseInt(e.target.value) || 0)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
