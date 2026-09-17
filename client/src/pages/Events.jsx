import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiPlus, FiMapPin, FiClock } from 'react-icons/fi';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StaggerContainer } from '../components/animations/StaggerContainer';
import { PageTransition } from '../components/animations/PageTransition';
import api from '../lib/axios';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEvents();
  }, []);

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
          <Button className="shrink-0 bg-primary hover:bg-primary/90 text-white shadow-md">
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
                  <Card className="glass-panel h-full border-t-4 border-t-indigo-500 cursor-pointer overflow-hidden group">
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
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </StaggerContainer>
        )}
      </div>
    </PageTransition>
  );
}