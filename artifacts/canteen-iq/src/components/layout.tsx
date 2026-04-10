import React from "react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Utensils, 
  ShoppingCart, 
  History, 
  MessageSquare,
  LogOut,
  ListOrdered,
  BarChart3,
  Users,
  BrainCircuit,
  Leaf,
  Activity,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const studentNav: NavItem[] = [
  { name: "Dashboard", href: "/student", icon: LayoutDashboard },
  { name: "Menu", href: "/student/menu", icon: Utensils },
  { name: "Cart", href: "/student/cart", icon: ShoppingCart },
  { name: "Live Orders", href: "/student/orders", icon: Activity },
  { name: "History", href: "/student/history", icon: History },
  { name: "Support", href: "/student/support", icon: MessageSquare },
];

const staffNav: NavItem[] = [
  { name: "Dashboard", href: "/staff", icon: LayoutDashboard },
  { name: "Live Queue", href: "/staff/queue", icon: ListOrdered },
  { name: "Menu Stock", href: "/staff/menu", icon: Utensils },
  { name: "Daily Summary", href: "/staff/summary", icon: BarChart3 },
];

const adminNav: NavItem[] = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Menu Management", href: "/admin/menu", icon: Utensils },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "AI Predictions", href: "/admin/predictions", icon: BrainCircuit },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Peak Hours", href: "/admin/peak-hours", icon: Activity },
  { name: "Sustainability", href: "/admin/sustainability", icon: Leaf },
  { name: "Feedback", href: "/admin/feedback", icon: MessageSquare },
  { name: "Support Tickets", href: "/admin/support", icon: MessageSquare },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  let navItems: NavItem[] = [];
  if (user.role === "student") navItems = studentNav;
  if (user.role === "staff") navItems = staffNav;
  if (user.role === "admin") navItems = adminNav;

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-border bg-card/40 backdrop-blur-xl shrink-0">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <Utensils className="h-4 w-4 text-white" />
            </div>
            <span>Swaad<span className="text-primary">-E-KU</span></span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || (location.startsWith(item.href) && item.href !== `/${user.role}`);
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-border">
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-foreground">{user.fullName}</span>
              <span className="truncate text-xs text-muted-foreground capitalize">{user.role}</span>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto text-muted-foreground hover:text-destructive shrink-0" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none -z-10" />
        <div className="container mx-auto p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
