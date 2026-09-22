import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PageTransition } from '../components/animations/PageTransition';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext'; 

export default function Resources() {
  const { user } = useAuth(); // Fetch user for RBAC checks
  const [resources, setResources] = useState([]);
  const [allocations, setAllocations] = useState([]);
  
  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newResource, setNewResource] = useState({
    name: '',
    category: 'Venue',
    totalQuantity: 1,
    status: 'Available'
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  const fetchInitialData = async () => {
    try {
      // Fetch both resources and allocations to calculate true availability
      const [resData, allocData] = await Promise.all([
        api.get('/resources'),
        api.get('/allocations').catch(() => ({ data: [] }))
      ]);
      setResources(resData.data);
      setAllocations(allocData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Compute availability dynamically based on active allocations
  const getResourceAvailability = (resource) => {
    const activeUsages = allocations.filter(a => 
      (a.resourceId?._id === resource._id || a.resourceId === resource._id) && 
      a.status === 'Confirmed'
    );
    const allocated = activeUsages.reduce((sum, alloc) => sum + (alloc.quantityAllocated || 1), 0);
    const available = resource.totalQuantity - allocated;
    
    return { allocated, available: Math.max(0, available) };
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/resources', newResource);
      setIsModalOpen(false);
      setNewResource({ name: '', category: 'Venue', totalQuantity: 1, status: 'Available' });
      fetchInitialData(); 
    } catch (error) {
      console.error('Error creating resource:', error);
      alert('Failed to create resource.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      await api.delete(`/resources/${id}`);
      setResources(resources.filter(resource => resource._id !== id));
    } catch (err) {
      console.error("Failed to delete resource", err);
      alert('Failed to delete resource.');
    }
  };

  const openEditModal = (resource) => {
    setEditingResource({ ...resource });
    setIsEditModalOpen(true);
  };

  const handleUpdateResource = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.put(`/resources/${editingResource._id}`, editingResource);
      setResources(resources.map(res => res._id === editingResource._id ? response.data : res));
      setIsEditModalOpen(false);
      setEditingResource(null);
    } catch (err) {
      console.error("Failed to update resource", err);
      alert('Failed to update resource.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Resource Inventory</h1>
            <p className="text-muted-foreground">Monitor and manage equipment, venues, and personnel availability.</p>
          </div>
          
          {/* RBAC: Only Admins can add new resources */}
          {user?.role === 'Admin' && (
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="shrink-0 bg-primary hover:bg-primary/90 text-white shadow-md"
            >
              <FiPlus className="mr-2" /> Add New Resource
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, index) => {
            const { allocated, available } = getResourceAvailability(resource);
            const isDepleted = available === 0 || resource.status === 'Depleted';

            return (
              <motion.div
                key={resource._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className={`glass-panel border-l-4 ${isDepleted ? 'border-l-red-500 opacity-80' : 'border-l-indigo-500'} hover:shadow-lg transition-all`}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          {resource.category}
                        </span>
                        <h3 className="text-xl font-bold mt-1">{resource.name}</h3>
                      </div>
                      <Badge variant={
                        resource.status === 'Available' && available > 0 ? 'default' :
                        resource.status === 'Maintenance' ? 'secondary' : 'destructive'
                      }>
                        {available === 0 && resource.status === 'Available' ? 'In Use' : resource.status}
                      </Badge>
                    </div>

                    <div className="bg-black/5 dark:bg-black/20 rounded-md p-3 grid grid-cols-3 text-center divide-x divide-gray-200 dark:divide-gray-700 border border-gray-100 dark:border-gray-800 text-sm">
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Total</div>
                        <div className="font-semibold text-foreground">{resource.totalQuantity}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Allocated</div>
                        <div className="font-semibold text-foreground">{allocated}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Available</div>
                        <div className={`font-bold ${available > 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>{available}</div>
                      </div>
                    </div>

                    {/* RBAC: Only Admins can edit or delete resources */}
                    {user?.role === 'Admin' && (
                      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(resource)} className="text-gray-500 hover:text-indigo-500">
                          <FiEdit2 size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(resource._id)} className="text-gray-500 hover:text-red-500">
                          <FiTrash2 size={16} />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Add Resource Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateResource} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Resource Name</label>
                <Input 
                  required 
                  value={newResource.name}
                  onChange={(e) => setNewResource({...newResource, name: e.target.value})}
                  placeholder="e.g. 4K Projector"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={newResource.category}
                  onChange={(e) => setNewResource({...newResource, category: e.target.value})}
                >
                  <option value="Venue" className="bg-background text-foreground">Venue</option>
                  <option value="Equipment" className="bg-background text-foreground">Equipment</option>
                  <option value="Personnel" className="bg-background text-foreground">Personnel</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity</label>
                  <Input 
                    required 
                    type="number"
                    min="1"
                    value={newResource.totalQuantity}
                    onChange={(e) => setNewResource({...newResource, totalQuantity: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={newResource.status}
                    onChange={(e) => setNewResource({...newResource, status: e.target.value})}
                  >
                    <option value="Available" className="bg-background text-foreground">Available</option>
                    <option value="Maintenance" className="bg-background text-foreground">Maintenance</option>
                    <option value="Depleted" className="bg-background text-foreground">Depleted</option>
                  </select>
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-primary text-white">
                  {isSubmitting ? 'Adding...' : 'Add Resource'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Resource Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Resource</DialogTitle>
            </DialogHeader>
            {editingResource && (
              <form onSubmit={handleUpdateResource} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Resource Name</label>
                  <Input 
                    required 
                    value={editingResource.name}
                    onChange={(e) => setEditingResource({...editingResource, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={editingResource.category}
                    onChange={(e) => setEditingResource({...editingResource, category: e.target.value})}
                  >
                    <option value="Venue" className="bg-background text-foreground">Venue</option>
                    <option value="Equipment" className="bg-background text-foreground">Equipment</option>
                    <option value="Personnel" className="bg-background text-foreground">Personnel</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quantity</label>
                    <Input 
                      required 
                      type="number"
                      min="1"
                      value={editingResource.totalQuantity}
                      onChange={(e) => setEditingResource({...editingResource, totalQuantity: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={editingResource.status}
                      onChange={(e) => setEditingResource({...editingResource, status: e.target.value})}
                    >
                      <option value="Available" className="bg-background text-foreground">Available</option>
                      <option value="Maintenance" className="bg-background text-foreground">Maintenance</option>
                      <option value="Depleted" className="bg-background text-foreground">Depleted</option>
                    </select>
                  </div>
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