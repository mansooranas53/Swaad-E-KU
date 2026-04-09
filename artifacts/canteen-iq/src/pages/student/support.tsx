import { useCreateSupportTicket } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ticketSchema = z.object({
  issueType: z.string().min(1, "Please select an issue type"),
  message: z.string().min(10, "Please provide more details (min 10 characters)"),
});

export default function StudentSupport() {
  const createTicket = useCreateSupportTicket();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof ticketSchema>>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { issueType: "", message: "" },
  });

  const onSubmit = (values: z.infer<typeof ticketSchema>) => {
    createTicket.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast({ title: "Ticket Submitted", description: "Support team will contact you shortly." });
          form.reset();
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to submit ticket.", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Help & Support</h1>
        <p className="text-muted-foreground">Have an issue with your order? Let us know.</p>
      </div>

      <Card className="glass-panel border-white/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Submit a Ticket
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="issueType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">Issue Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-black/50 border-white/10 text-white focus:ring-primary">
                          <SelectValue placeholder="Select what you need help with" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-white/10">
                        <SelectItem value="missing_item">Missing Item in Order</SelectItem>
                        <SelectItem value="wrong_item">Received Wrong Item</SelectItem>
                        <SelectItem value="food_quality">Food Quality Issue</SelectItem>
                        <SelectItem value="app_bug">App Bug / Technical Issue</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please describe your issue in detail..." 
                        className="bg-black/50 border-white/10 min-h-[150px] resize-none text-white focus-visible:ring-primary" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg glow-primary" disabled={createTicket.isPending}>
                {createTicket.isPending ? "Submitting..." : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Submit Ticket
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
