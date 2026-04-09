import { useState } from "react";
import { useListMenuItems } from "@workspace/api-client-react";
import { useCart } from "@/lib/cart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Search, Plus, ShoppingCart, Leaf, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const CATEGORIES = ["All", "Breakfast", "Lunch", "Snacks", "Beverages"];

export default function StudentMenu() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  
  const { data: menuItems = [], isLoading } = useListMenuItems({
    query: {
      queryKey: ["menuItems"]
    }
  });
  
  const { addToCart, items } = useCart();
  const { toast } = useToast();

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const filteredItems = menuItems.filter(item => {
    if (category !== "All" && item.category !== category) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAddToCart = (item: any) => {
    addToCart(item);
    toast({
      title: "Added to cart",
      description: `${item.name} added to your order.`,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Menu</h1>
          <p className="text-muted-foreground">Order ahead and skip the line.</p>
        </div>
        
        {cartItemCount > 0 && (
          <Link href="/student/cart">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-full glow-primary shrink-0">
              <ShoppingCart className="h-4 w-4 mr-2" />
              View Cart ({cartItemCount})
            </Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search for food..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-white/10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <Button 
              key={cat}
              variant={category === cat ? "default" : "outline"}
              className={`rounded-full shrink-0 ${category === cat ? 'bg-white text-black hover:bg-white/90' : 'bg-transparent border-white/10 hover:bg-white/5'}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-[300px] rounded-2xl bg-card animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map(item => (
            <Card key={item.id} className="glass-panel overflow-hidden flex flex-col group">
              <div className="h-48 relative bg-black/50 w-full overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <UtensilsCrossed className="h-10 w-10 opacity-20" />
                  </div>
                )}
                
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {item.popular && (
                    <Badge className="bg-primary hover:bg-primary text-white border-none shadow-lg">
                      <Flame className="h-3 w-3 mr-1" /> Popular
                    </Badge>
                  )}
                </div>
                
                <div className="absolute top-3 right-3">
                  {item.vegType === "veg" && (
                    <div className="h-6 w-6 rounded bg-white flex items-center justify-center shadow-lg p-1 border-2 border-green-600">
                      <div className="h-2.5 w-2.5 rounded-full bg-green-600" />
                    </div>
                  )}
                  {item.vegType === "nonveg" && (
                    <div className="h-6 w-6 rounded bg-white flex items-center justify-center shadow-lg p-1 border-2 border-red-600">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-600" />
                    </div>
                  )}
                  {item.vegType === "egg" && (
                    <div className="h-6 w-6 rounded bg-white flex items-center justify-center shadow-lg p-1 border-2 border-yellow-500">
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                    </div>
                  )}
                </div>
                
                {!item.available && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                    <Badge variant="destructive" className="text-sm py-1 px-3">Out of Stock</Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-white leading-tight">{item.name}</h3>
                  <span className="font-bold text-primary ml-2">${item.price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.category}</p>
                <div className="mt-auto">
                  <Badge variant="outline" className="bg-white/5 border-white/10 text-white/70">
                    {item.stock} left today
                  </Badge>
                </div>
              </CardContent>
              
              <CardFooter className="p-5 pt-0">
                <Button 
                  className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10" 
                  disabled={!item.available}
                  onClick={() => handleAddToCart(item)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
