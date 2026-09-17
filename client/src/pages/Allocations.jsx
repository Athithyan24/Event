import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageTransition } from '../components/animations/PageTransition';
import AllocationModal from '../components/animations/AllocationModal';
import api from '../lib/axios';

export default function Allocations() {
  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [eventsRes, resourcesRes] = await Promise.all([
        api.get('/events'),
        api.get('/resources')
      ]);
      setEvents(eventsRes.data);
      setResources(resourcesRes.data);
    } catch (err) {
      // Fallback mock data if server is offline during development
      setResources([
        { id: 1, name: "Main Auditorium", category: "Venue", available: 1, totalQuantity: 1 },
        { id: 2, name: "4K Laser Projector", category: "Equipment", available: 0, totalQuantity: 3 },
      ]);
    }
  };

  const handleAllocate = async (allocationData) => {
    try {
      await api.post('/allocations', allocationData);
      setNotification({ type: 'success', message: 'Resource allocated successfully!' });
      loadInitialData();
    } catch (error) {
      const msg = error.response?.data?.message || 'Allocation failed. Conflict detected.';
      setNotification({ type: 'error', message: msg });
    }
  };

  return (
    <PageTransition>
      <div className="p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Resource Allocation</h1>
            <p className="text-muted-foreground">Assign available assets and manage double-booking rules.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-primary text-white">
            + Assign Resource
          </Button>
        </div>

        {notification && (
          <div className={`p-4 rounded-xl text-sm font-medium ${
            notification.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-500' : 'bg-green-500/10 border border-green-500/20 text-green-500'
          }`}>
            {notification.message}
          </div>
        )}

        <div className="glass-panel p-1 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((item) => (
                <TableRow key={item.id || item._id}>
                  <TableCell className="font-semibold">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.available ?? 0} / {item.totalQuantity ?? 1} units</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={(item.available ?? 1) > 0 ? 'default' : 'destructive'}>
                      {(item.available ?? 1) > 0 ? 'Available' : 'Fully Booked'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <AllocationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          events={events}
          resources={resources}
          onAllocate={handleAllocate}
        />
      </div>
    </PageTransition>
  );
}