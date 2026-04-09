import { useListSupportTickets } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AdminSupport() {
  const { data: tickets = [], isLoading } = useListSupportTickets({ query: { queryKey: ["adminSupportTickets"] } });

  if (isLoading) {
    return <div className="h-[60vh] w-full animate-pulse bg-card rounded-xl" />;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge variant="destructive" className="bg-red-500/20 text-red-500 border-none">Open</Badge>;
      case 'in_progress': return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 border-none">In Progress</Badge>;
      case 'resolved': return <Badge variant="outline" className="border-green-500/30 text-green-500 bg-green-500/10">Resolved</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Support Tickets</h1>
        <p className="text-muted-foreground">Manage user inquiries and issues.</p>
      </div>

      <div className="rounded-xl border border-white/5 bg-card/40 backdrop-blur-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/70">Ticket ID</TableHead>
              <TableHead className="text-white/70">User</TableHead>
              <TableHead className="text-white/70">Issue Type</TableHead>
              <TableHead className="text-white/70">Status</TableHead>
              <TableHead className="text-white/70">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id} className="border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="font-medium text-white">#{ticket.id}</TableCell>
                <TableCell className="text-white">{ticket.userFullName || `User ${ticket.userId}`}</TableCell>
                <TableCell className="text-muted-foreground capitalize">{ticket.issueType.replace('_', ' ')}</TableCell>
                <TableCell>
                  {getStatusBadge(ticket.status)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                </TableCell>
              </TableRow>
            ))}
            {tickets.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                  No support tickets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
