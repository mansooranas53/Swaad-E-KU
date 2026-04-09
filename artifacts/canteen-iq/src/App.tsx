import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { Layout } from "@/components/layout";

// Pages
import AuthPage from "@/pages/auth";
import StudentDashboard from "@/pages/student/index";
import StudentMenu from "@/pages/student/menu";
import StudentCart from "@/pages/student/cart";
import StudentOrders from "@/pages/student/orders";
import StudentHistory from "@/pages/student/history";
import StudentSupport from "@/pages/student/support";

import StaffDashboard from "@/pages/staff/index";
import StaffQueue from "@/pages/staff/queue";
import StaffMenu from "@/pages/staff/menu";
import StaffSummary from "@/pages/staff/summary";

import AdminDashboard from "@/pages/admin/index";
import AdminMenu from "@/pages/admin/menu";
import AdminUsers from "@/pages/admin/users";
import AdminPredictions from "@/pages/admin/predictions";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminPeakHours from "@/pages/admin/peak-hours";
import AdminSustainability from "@/pages/admin/sustainability";
import AdminFeedback from "@/pages/admin/feedback";
import AdminSupport from "@/pages/admin/support";

import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      {/* Student Routes */}
      <Route path="/student">
        <Layout><StudentDashboard /></Layout>
      </Route>
      <Route path="/student/menu">
        <Layout><StudentMenu /></Layout>
      </Route>
      <Route path="/student/cart">
        <Layout><StudentCart /></Layout>
      </Route>
      <Route path="/student/orders">
        <Layout><StudentOrders /></Layout>
      </Route>
      <Route path="/student/history">
        <Layout><StudentHistory /></Layout>
      </Route>
      <Route path="/student/support">
        <Layout><StudentSupport /></Layout>
      </Route>

      {/* Staff Routes */}
      <Route path="/staff">
        <Layout><StaffDashboard /></Layout>
      </Route>
      <Route path="/staff/queue">
        <Layout><StaffQueue /></Layout>
      </Route>
      <Route path="/staff/menu">
        <Layout><StaffMenu /></Layout>
      </Route>
      <Route path="/staff/summary">
        <Layout><StaffSummary /></Layout>
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        <Layout><AdminDashboard /></Layout>
      </Route>
      <Route path="/admin/menu">
        <Layout><AdminMenu /></Layout>
      </Route>
      <Route path="/admin/users">
        <Layout><AdminUsers /></Layout>
      </Route>
      <Route path="/admin/predictions">
        <Layout><AdminPredictions /></Layout>
      </Route>
      <Route path="/admin/analytics">
        <Layout><AdminAnalytics /></Layout>
      </Route>
      <Route path="/admin/peak-hours">
        <Layout><AdminPeakHours /></Layout>
      </Route>
      <Route path="/admin/sustainability">
        <Layout><AdminSustainability /></Layout>
      </Route>
      <Route path="/admin/feedback">
        <Layout><AdminFeedback /></Layout>
      </Route>
      <Route path="/admin/support">
        <Layout><AdminSupport /></Layout>
      </Route>

      <Route path="/">
        <div className="flex h-screen items-center justify-center bg-background">
           <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <CartProvider>
              <Router />
            </CartProvider>
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
