import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiBox, FiCheckCircle, FiAlertTriangle, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageTransition } from '../components/animations/PageTransition';

const initialResources = [
  { id: 1, name: 'Main Auditorium', category: 'Venue', total: 1, available: 0, status: 'Allocated' },
  { id: 2, name: 'Seminar Hall A', category: 'Venue', total: 2, available: 1, status: 'Available' },
  { id: 3, name: '4K Laser Projector', category: 'Equipment', total: 5, available: 3, status: 'Available' },
  { id: 4, name: 'PA Sound System', category: 'Equipment', total: 3, available: 0, status: 'Maintenance' },
  { id: 5, name: 'Student Volunteers', category: 'Personnel', total: 50, available: 32, status: 'Available' },
];

export default function Resources() {
  const [resources, setResources] = useState(initialResources);

  return (
    <PageTransition>
      <div className="p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Resource Inventory</h1>
            <p className="text-muted-foreground">Monitor and manage equipment, venues, and personnel.</p>
          </div>
          <Button className="shrink-0 bg-primary hover:bg-primary/90 text-white shadow-md">
            <FiPlus className="mr-2" /> Add New Resource
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Card className="glass-panel border-l-4 border-l-indigo-500 hover:shadow-lg transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {resource.category}
                      </span>
                      <h3 className="text-xl font-bold mt-1">{resource.name}</h3>
                    </div>
                    <Badge variant={
                      resource.status === 'Available' ? 'default' :
                      resource.status === 'Allocated' ? 'secondary' : 'destructive'
                    }>
                      {resource.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-sm">
                    <span className="text-gray-500">Available Quantity</span>
                    <span className="font-semibold text-base">{resource.available} / {resource.total}</span>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-indigo-500">
                      <FiEdit2 size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
                      <FiTrash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}