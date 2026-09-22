import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PageTransition } from '../components/animations/PageTransition';
import { FiCornerDownLeft } from 'react-icons/fi';
import api from '../lib/axios';

export default function Allocations() {
  const [allocations, setAllocations] = useState([]);
  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  
  const [notification, setNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newAllocation, setNewAllocation] = useState({
    eventId: '',
    resourceId: '',
    quantityAllocated: 1
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [eventsRes, resourcesRes, allocationsRes] = await Promise.all([
        api.get('/events'),
        api.get('/resources'),
        api.get('/allocations').catch(() => ({ data: [] }))
      ]);
      setEvents(eventsRes.data);
      setResources(resourcesRes.data);
      setAllocations(allocationsRes.data);
    } catch (err) {
      console.error('Error loading allocation data:', err);
    }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    try {
      await api.post('/allocations', newAllocation);
      setNotification({ type: 'success', message: 'Resource allocated successfully!' });
      setIsModalOpen(false); 
      setNewAllocation({ eventId: '', resourceId: '', quantityAllocated: 1 }); 
      loadInitialData(); 
    } catch (error) {
      const msg = error.response?.data?.message || 'Allocation failed.';
      setNotification({ type: 'error', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturn = async (id) => {
    if (!window.confirm("Are you sure you want to return this resource?")) return;
    
    try {
      await api.patch(`/allocations/${id}/return`);
      setNotification({ type: 'success', message: 'Resource returned successfully.' });
      loadInitialData();
    } catch (err) {
      console.error("Failed to return allocation:", err);
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to return resource.' });
    }
  };

  const getEventName = (eventId) => {
    if (!eventId) return 'Unknown Event';
    if (typeof eventId === 'object') return eventId.name || 'Unnamed Event';
    const match = events.find(e => e._id === eventId);
    return match ? match.name : 'Unknown Event';
  };

  const getResourceName = (resourceId) => {
    if (!resourceId) return 'Unknown Resource';
    if (typeof resourceId === 'object') return resourceId.name || 'Unnamed Resource';
    const match = resources.find(r => (r._id || r.id) === resourceId);
    return match ? match.name : 'Unknown Resource';
  };

  return (
    <PageTransition>
      <div className="p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Resource Allocation</h1>
            <p className="text-muted-foreground">Manage active assignments and process returns.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white">
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
                <TableHead>Event</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-6">
                    No allocations found.
                  </TableCell>
                </TableRow>
              ) : (
                allocations.map((alloc) => (
                  <TableRow key={alloc._id} className={alloc.status === 'Returned' ? 'opacity-60' : ''}>
                    <TableCell className="font-semibold">{getEventName(alloc.eventId)}</TableCell>
                    <TableCell>{getResourceName(alloc.resourceId)}</TableCell>
                    <TableCell>{alloc.quantityAllocated} units</TableCell>
                    <TableCell>
                      <Badge variant={alloc.status === 'Returned' ? 'secondary' : 'default'}>
                        {alloc.status || 'Confirmed'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {alloc.status !== 'Returned' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleReturn(alloc._id)}
                          className="text-gray-500 hover:text-indigo-500 font-medium flex items-center gap-2 ml-auto"
                        >
                          <FiCornerDownLeft size={16} /> Return
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Assign Resource Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Assign Resource to Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAllocate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Event</label>
                <select 
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={newAllocation.eventId}
                  onChange={(e) => setNewAllocation({...newAllocation, eventId: e.target.value})}
                >
                  <option value="" disabled>-- Choose an Event --</option>
                  {events.map((ev) => (
                    <option key={ev._id} value={ev._id} className="bg-background text-foreground">
                      {ev.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Resource</label>
                <select 
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={newAllocation.resourceId}
                  onChange={(e) => setNewAllocation({...newAllocation, resourceId: e.target.value})}
                >
                  <option value="" disabled>-- Choose a Resource --</option>
                  {resources.filter(r => r.status !== 'Maintenance' && r.status !== 'Depleted').map((res) => (
                    <option key={res._id || res.id} value={res._id || res.id} className="bg-background text-foreground">
                      {res.name} (Capacity: {res.totalQuantity ?? 1})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity to Allocate</label>
                <Input 
                  required 
                  type="number"
                  min="1"
                  value={newAllocation.quantityAllocated}
                  onChange={(e) => setNewAllocation({
                    ...newAllocation, 
                    quantityAllocated: parseInt(e.target.value) || 1
                  })}
                />
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-primary text-white">
                  {isSubmitting ? 'Assigning...' : 'Confirm Allocation'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}