import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLogin, useSignup } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Utensils } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  role: z.enum(["student", "staff", "admin"]),
});

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuth();
  const loginMutation = useLogin();
  const signupMutation = useSignup();
  const { toast } = useToast();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", fullName: "", role: "student" },
  });

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          localStorage.setItem("canteeniq_token", data.token);
          window.location.href = `/${data.user.role}`;
        },
        onError: (err) => {
          toast({ title: "Login Failed", description: "Invalid credentials", variant: "destructive" });
        },
      }
    );
  };

  const onSignupSubmit = (values: z.infer<typeof signupSchema>) => {
    signupMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          localStorage.setItem("canteeniq_token", data.token);
          window.location.href = `/${data.user.role}`;
        },
        onError: (err) => {
          toast({ title: "Signup Failed", description: "Could not create account", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/30">
      <div className="hidden lg:flex w-1/2 relative bg-card flex-col items-center justify-center overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />
        <div className="z-10 text-center max-w-md p-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg glow-primary">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-white">Canteen<span className="text-primary text-gradient">IQ</span></span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-white">Smart Canteen, Smarter Campus</h1>
          <p className="text-muted-foreground text-lg">Predict demand. Prepare efficiently. Pickup seamlessly. The AI-powered OS for modern dining.</p>
        </div>
      </div>
      
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-secondary/10 via-background to-background lg:hidden pointer-events-none" />
        
        <div className="w-full max-w-md glass-panel p-8 rounded-2xl relative z-10">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary shadow-lg">
              <Utensils className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Canteen<span className="text-primary">IQ</span></span>
          </div>

          <div className="flex items-center justify-center mb-8 bg-black/40 p-1 rounded-lg border border-white/5">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white"}`}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white"}`}
              onClick={() => setIsLogin(false)}
            >
              Create Account
            </button>
          </div>

          {isLogin ? (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">College Email</FormLabel>
                      <FormControl>
                        <Input placeholder="student@college.edu" className="bg-black/50 border-white/10 focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" className="bg-black/50 border-white/10 focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg glow-primary mt-2" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                <FormField
                  control={signupForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" className="bg-black/50 border-white/10 focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">College Email</FormLabel>
                      <FormControl>
                        <Input placeholder="jane@college.edu" className="bg-black/50 border-white/10 focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" className="bg-black/50 border-white/10 focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-white/80">I am a</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2 rounded-lg border border-white/10 p-3 bg-black/30 hover:bg-white/5 transition-colors cursor-pointer">
                            <RadioGroupItem value="student" id="r1" className="border-primary text-primary" />
                            <Label htmlFor="r1" className="flex-1 cursor-pointer font-medium text-white/90">Student</Label>
                          </div>
                          <div className="flex items-center space-x-2 rounded-lg border border-white/10 p-3 bg-black/30 hover:bg-white/5 transition-colors cursor-pointer">
                            <RadioGroupItem value="staff" id="r2" className="border-primary text-primary" />
                            <Label htmlFor="r2" className="flex-1 cursor-pointer font-medium text-white/90">Staff Member</Label>
                          </div>
                          <div className="flex items-center space-x-2 rounded-lg border border-white/10 p-3 bg-black/30 hover:bg-white/5 transition-colors cursor-pointer">
                            <RadioGroupItem value="admin" id="r3" className="border-primary text-primary" />
                            <Label htmlFor="r3" className="flex-1 cursor-pointer font-medium text-white/90">Administrator</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg glow-primary mt-2" disabled={signupMutation.isPending}>
                  {signupMutation.isPending ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
