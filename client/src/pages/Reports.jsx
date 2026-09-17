import { useState } from 'react';
import { FiPrinter, FiDownload, FiSearch } from 'react-icons/fi';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageTransition } from '../components/animations/PageTransition';

const reportData = [
  { id: "REP-01", event: "Annual Tech Symposium", resource: "Main Auditorium", date: "Oct 15, 2026", status: "Approved" },
  { id: "REP-02", event: "Guest Lecture: AI Trends", resource: "4K Laser Projector", date: "Oct 18, 2026", status: "Approved" },
  { id: "REP-03", event: "Cultural Fest", resource: "Student Volunteers (20)", date: "Oct 20, 2026", status: "Pending" },
];

export default function Reports() {
  const [filter, setFilter] = useState('');

  return (
    <PageTransition>
      <div className="p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Reports</h1>
            <p className="text-muted-foreground">Audit event allocations and export operational logs.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <FiPrinter className="mr-2" /> Print Report
            </Button>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center">
          <div className="relative flex-1 max-w-sm">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search report logs..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 bg-transparent"
            />
          </div>
        </div>

        <div className="glass-panel p-1 rounded-2xl overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
              <TableRow>
                <TableHead>Log ID</TableHead>
                <TableHead>Event Name</TableHead>
                <TableHead>Resource Allocated</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Approval Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs">{row.id}</TableCell>
                  <TableCell className="font-medium">{row.event}</TableCell>
                  <TableCell>{row.resource}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      row.status === 'Approved' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {row.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageTransition>
  );
}