import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useCreateOrder } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";

export default function StudentCart() {
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const [pickupTime, setPickupTime] = useState("");
  const createOrder = useCreateOrder();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handlePlaceOrder = () => {
    if (!pickupTime) {
      toast({ title: "Select Pickup Time", description: "Please select a time to pick up your order.", variant: "destructive" });
      return;
    }
    
    createOrder.mutate(
      { 
        data: {
          pickupTime,
          items: items.map(item => ({ menuItemId: item.id, quantity: item.quantity }))
        }
      },
      {
        onSuccess: (data) => {
          clearCart();
          toast({ title: "Order Placed!", description: `Token #${data.tokenNumber} — track it in Live Orders.` });
          setLocation("/student/orders");
        },
        onError: () => {
          toast({ title: "Order Failed", description: "Could not place your order.", variant: "destructive" });
        }
      }
    );
  };

  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    let current = new Date(now.getTime() + 15 * 60000);
    const minutes = current.getMinutes();
    const remainder = minutes % 15;
    current.setMinutes(minutes + (15 - remainder));
    for (let i = 0; i < 8; i++) {
      const timeString = current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      slots.push(timeString);
      current = new Date(current.getTime() + 15 * 60000);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in">
        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">Looks like you haven't added any items yet.</p>
        <Link href="/student/menu">
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-full glow-primary px-8">
            Browse Menu
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Your Cart</h1>
        <p className="text-muted-foreground">Review your items and choose a pickup time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="glass-panel border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden shrink-0 border border-border">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                  <p className="text-sm text-primary font-medium">₹{item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-muted/60 rounded-lg border border-border">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground hover:bg-muted hover:text-foreground" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground hover:bg-muted hover:text-foreground" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/20" onClick={() => removeFromCart(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="glass-panel border-border sticky top-8">
            <CardHeader>
              <CardTitle className="text-foreground">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Pickup Time</label>
                <Select value={pickupTime} onValueChange={setPickupTime}>
                  <SelectTrigger className="w-full bg-muted/50 border-border text-foreground">
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time} className="text-foreground focus:bg-muted focus:text-foreground">
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-foreground font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg glow-primary" 
                size="lg"
                disabled={createOrder.isPending || !pickupTime}
                onClick={handlePlaceOrder}
              >
                {createOrder.isPending ? "Placing Order..." : (
                  <>
                    Place Order <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
