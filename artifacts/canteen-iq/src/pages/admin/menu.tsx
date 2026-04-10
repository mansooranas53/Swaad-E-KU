import { useState } from "react";
import { useListMenuItems, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem, getListMenuItemsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const menuItemSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  price: z.coerce.number().min(0),
  imageUrl: z.string().url().optional().or(z.literal("")),
  available: z.boolean(),
  popular: z.boolean(),
  vegType: z.enum(["veg", "nonveg", "egg"]),
  stock: z.coerce.number().min(0),
});

export default function AdminMenu() {
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: menuItems = [], isLoading } = useListMenuItems({ query: { queryKey: ["adminMenuItems"] } });
  const createMenu = useCreateMenuItem();
  const updateMenu = useUpdateMenuItem();
  const deleteMenu = useDeleteMenuItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const form = useForm<z.infer<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "", category: "", price: 0, imageUrl: "", available: true, popular: false, vegType: "veg", stock: 100
    }
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
    queryClient.invalidateQueries({ queryKey: ["adminMenuItems"] });
  };

  const onAddSubmit = (values: z.infer<typeof menuItemSchema>) => {
    createMenu.mutate(
      { data: values },
      {
        onSuccess: () => {
          invalidate();
          setIsAddOpen(false);
          form.reset();
          toast({ title: "Item Added", description: `${values.name} added to menu.` });
        }
      }
    );
  };

  const onEditSubmit = (values: z.infer<typeof menuItemSchema>) => {
    if (!editingItem) return;
    updateMenu.mutate(
      { id: editingItem.id, data: values },
      {
        onSuccess: () => {
          invalidate();
          setEditingItem(null);
          toast({ title: "Item Updated", description: `${values.name} updated.` });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    deleteMenu.mutate(
      { id },
      {
        onSuccess: () => {
          invalidate();
          toast({ title: "Item Deleted" });
        }
      }
    );
  };

  const MenuForm = ({ onSubmit, isPending, submitLabel }: { onSubmit: any; isPending: boolean; submitLabel: string }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Name</FormLabel><FormControl><Input className="bg-muted/50 border-border" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem><FormLabel>Category</FormLabel><FormControl><Input className="bg-muted/50 border-border" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="price" render={({ field }) => (
            <FormItem><FormLabel>Price (₹)</FormLabel><FormControl><Input type="number" step="0.01" className="bg-muted/50 border-border" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="stock" render={({ field }) => (
            <FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" className="bg-muted/50 border-border" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        
        <FormField control={form.control} name="imageUrl" render={({ field }) => (
          <FormItem><FormLabel>Image URL (Optional)</FormLabel><FormControl><Input className="bg-muted/50 border-border" placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="vegType" render={({ field }) => (
            <FormItem>
              <FormLabel>Dietary Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger className="bg-muted/50 border-border"><SelectValue /></SelectTrigger></FormControl>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="veg">🟢 Vegetarian</SelectItem>
                  <SelectItem value="nonveg">🔴 Non-Veg</SelectItem>
                  <SelectItem value="egg">🟡 Egg</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          
          <div className="flex flex-col gap-3 justify-center pt-6">
            <FormField control={form.control} name="available" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border border-border p-2 bg-muted/30">
                <FormLabel className="text-xs">Available</FormLabel>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="popular" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border border-border p-2 bg-muted/30">
                <FormLabel className="text-xs">Popular</FormLabel>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )} />
          </div>
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isPending}>
          {isPending ? "Saving..." : submitLabel}
        </Button>
      </form>
    </Form>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Menu Management</h1>
          <p className="text-muted-foreground">Full CRUD control over the catalog.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-full glow-primary" onClick={() => form.reset()}>
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
            </DialogHeader>
            <MenuForm onSubmit={onAddSubmit} isPending={createMenu.isPending} submitLabel="Save Item" />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search items..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      <div className="rounded-xl border border-border bg-card/40 backdrop-blur-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Item</TableHead>
              <TableHead className="text-muted-foreground">Category</TableHead>
              <TableHead className="text-muted-foreground">Price</TableHead>
              <TableHead className="text-muted-foreground">Stock</TableHead>
              <TableHead className="text-muted-foreground">Diet</TableHead>
              <TableHead className="text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id} className="border-border hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-9 w-9 rounded-lg object-cover border border-border" />
                    ) : (
                      <div className="h-9 w-9 rounded-lg bg-muted border border-border flex items-center justify-center text-xs text-muted-foreground">—</div>
                    )}
                    <span className="font-medium text-foreground">{item.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{item.category}</TableCell>
                <TableCell className="text-foreground font-medium">₹{item.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={item.stock > 0 ? "outline" : "destructive"} className={item.stock > 0 ? "border-border" : ""}>
                    {item.stock} left
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-xs">
                    {item.vegType === "veg" ? "🟢 Veg" : item.vegType === "nonveg" ? "🔴 Non-Veg" : "🟡 Egg"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted" onClick={() => {
                      setEditingItem(item);
                      form.reset({ ...item, imageUrl: item.imageUrl ?? "" });
                    }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/20" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          <MenuForm onSubmit={onEditSubmit} isPending={updateMenu.isPending} submitLabel="Update Item" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
