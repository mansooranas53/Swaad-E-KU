import { useListFeedback } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";
import { format } from "date-fns";

export default function AdminFeedback() {
  const { data: feedbackList = [], isLoading } = useListFeedback({ query: { queryKey: ["adminFeedback"] } });

  if (isLoading) {
    return <div className="h-[60vh] w-full animate-pulse bg-card rounded-xl" />;
  }

  const averageRating = feedbackList.length 
    ? (feedbackList.reduce((acc, f) => acc + f.rating, 0) / feedbackList.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-primary glow-primary" />
          Student Feedback
        </h1>
        <p className="text-muted-foreground">What users are saying about the canteen experience.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass-panel border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="text-4xl font-black text-white">{averageRating}</div>
            <div className="flex text-yellow-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`h-5 w-5 ${star <= parseFloat(averageRating) ? 'fill-current' : 'opacity-30'}`} />
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-panel border-white/5 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Feedback Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{feedbackList.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Total reviews submitted</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {feedbackList.map(feedback => (
          <Card key={feedback.id} className="glass-panel border-white/5 hover:bg-white/5 transition-colors">
            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-base text-white">{feedback.userFullName || "Anonymous"}</CardTitle>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(new Date(feedback.createdAt), "MMM d, yyyy")}
                </div>
              </div>
              <div className="flex text-yellow-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`h-3 w-3 ${star <= feedback.rating ? 'fill-current' : 'opacity-30'}`} />
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <p className="text-white/80 text-sm leading-relaxed">{feedback.message}</p>
            </CardContent>
          </Card>
        ))}
        {feedbackList.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No feedback received yet.
          </div>
        )}
      </div>
    </div>
  );
}
