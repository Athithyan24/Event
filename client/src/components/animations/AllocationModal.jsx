import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export default function AllocationModal({ isOpen, onClose, events, resources, onAllocate }) {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedResource, setSelectedResource] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  const currentResource = resources.find(r => r.id === Number(selectedResource));
  const isExceedingCapacity = currentResource && quantity > currentResource.available;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedEvent || !selectedResource) {
      setError('Please select both an event and a resource.');
      return;
    }
    if (isExceedingCapacity) {
      setError('Requested quantity exceeds available stock.');
      return;
    }

    onAllocate({ eventId: selectedEvent, resourceId: selectedResource, quantity });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass-panel border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Assign Resource</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-2">
              <FiAlertCircle /> {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Event</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-white/5 border border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" className="dark:bg-gray-900">Choose Event...</option>
              {events.map((e) => (
                <option key={e.id} value={e.id} className="dark:bg-gray-900">{e.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Resource</label>
            <select
              value={selectedResource}
              onChange={(e) => {
                setSelectedResource(e.target.value);
                setError('');
              }}
              className="w-full p-2.5 rounded-lg bg-white/5 border border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" className="dark:bg-gray-900">Choose Resource...</option>
              {resources.map((r) => (
                <option key={r.id} value={r.id} className="dark:bg-gray-900">
                  {r.name} ({r.available} available)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quantity</label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="bg-white/5 border-gray-700"
            />
          </div>

          {currentResource && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              isExceedingCapacity ? 'bg-amber-500/10 text-amber-400' : 'bg-green-500/10 text-green-400'
            }`}>
              {isExceedingCapacity ? <FiAlertCircle /> : <FiCheckCircle />}
              <span>{currentResource.available} units currently remaining in stock.</span>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isExceedingCapacity} className="bg-primary text-white">
              Confirm Allocation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}