import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiPlus, FiMapPin, FiClock, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { StaggerContainer } from '../components/animations/StaggerContainer';
import { PageTransition } from '../components/animations/PageTransition';
import api from '../lib/axios';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    venue: ''
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.response?.data?.message || 'Unable to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/events', newEvent);
      setIsModalOpen(false); 
      setNewEvent({ name: '', description: '', date: '', time: '', venue: '' }); 
      fetchEvents(); 
    } catch (error) {
      console.error('Error creating event:', error);
      alert(error.response?.data?.message || 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NEW CRUD METHODS ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter(event => event._id !== id));
    } catch (err) {
      console.error("Failed to delete event", err);
      alert('Failed to delete event.');
    }
  };

  const openEditModal = (event) => {
    // Format date string for the input type="date"
    const formattedDate = event.date ? event.date.split('T')[0] : '';
    setEditingEvent({ ...event, date: formattedDate });
    setIsEditModalOpen(true);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.put(`/events/${editingEvent._id}`, editingEvent);
      setEvents(events.map(ev => ev._id === editingEvent._id ? response.data : ev));
      setIsEditModalOpen(false);
      setEditingEvent(null);
    } catch (err) {
      console.error("Failed to update event", err);
      alert('Failed to update event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEvents = events.filter(event => 
    event.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Event Management</h1>
            <p className="text-muted-foreground">Create and manage your campus events.</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="shrink-0 bg-primary hover:bg-primary/90 text-white shadow-md"
          >
            <FiPlus className="mr-2" /> Create Event
          </Button>
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <Input 
              placeholder="Search events..." 
              className="pl-10 bg-transparent border-gray-300 dark:border-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading live events...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">{error}</div>
        ) : (
          <StaggerContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <motion.div key={event._id} whileHover={{ y: -5 }}>
                  <Card className="glass-panel h-full border-t-4 border-t-indigo-500 overflow-hidden group flex flex-col justify-between">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-500 transition-colors">
                        {event.name}
                      </h3>
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{event.description}</p>
                      
                      <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <FiClock className="text-indigo-400" />
                          <span>{new Date(event.date).toLocaleDateString()} • {event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiMapPin className="text-pink-400" />
                          <span>{event.venue}</span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(event)} className="text-gray-500 hover:text-indigo-500">
                          <FiEdit2 size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(event._id)} className="text-gray-500 hover:text-red-500">
                          <FiTrash2 size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </StaggerContainer>
        )}

        {/* Create Event Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateEvent} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Name</label>
                <Input 
                  required 
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                  placeholder="e.g. Tech Symposium 2026"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input 
                  required 
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  placeholder="Brief details about the event"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input 
                    required 
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time</label>
                  <Input 
                    required 
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Venue</label>
                <Input 
                  required 
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({...newEvent, venue: e.target.value})}
                  placeholder="e.g. Main Auditorium"
                />
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-primary text-white">
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Event Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            {editingEvent && (
              <form onSubmit={handleUpdateEvent} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Event Name</label>
                  <Input 
                    required 
                    value={editingEvent.name}
                    onChange={(e) => setEditingEvent({...editingEvent, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input 
                    required 
                    value={editingEvent.description}
                    onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Input 
                      required 
                      type="date"
                      value={editingEvent.date}
                      onChange={(e) => setEditingEvent({...editingEvent, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time</label>
                    <Input 
                      required 
                      type="time"
                      value={editingEvent.time}
                      onChange={(e) => setEditingEvent({...editingEvent, time: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Venue</label>
                  <Input 
                    required 
                    value={editingEvent.venue}
                    onChange={(e) => setEditingEvent({...editingEvent, venue: e.target.value})}
                  />
                </div>
                <DialogFooter className="mt-6">
                  <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-primary text-white">
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </PageTransition>
  );
}