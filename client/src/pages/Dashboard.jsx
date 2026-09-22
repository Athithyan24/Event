import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FiCalendar, FiBox, FiCheckCircle, FiAlertCircle, FiActivity } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageTransition } from '../components/animations/PageTransition';
import { motion } from 'framer-motion';
import api from '../lib/axios';

// Animation variants for buttery smooth staggering
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white/50 dark:bg-gray-800/50 rounded-xl animate-pulse backdrop-blur-sm border border-gray-100 dark:border-gray-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <div className="col-span-4 h-[400px] bg-white/50 dark:bg-gray-800/50 rounded-xl animate-pulse" />
          <div className="col-span-3 h-[400px] bg-white/50 dark:bg-gray-800/50 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <FiActivity className="text-primary animate-pulse" /> Live Overview
          </p>
        </motion.div>

        {/* Staggered Stat Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants}>
            <StatCard title="Total Events" value={data?.stats?.totalEvents || 0} icon={<FiCalendar />} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard title="Total Resources" value={data?.stats?.totalResources || 0} icon={<FiBox />} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard title="Allocated" value={data?.stats?.totalAllocations || 0} icon={<FiCheckCircle />} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard 
              title="Alerts" 
              value={data?.stats?.alerts || 0} 
              icon={<FiAlertCircle />} 
              className={data?.stats?.alerts > 0 ? "text-red-500 border-l-red-500 shadow-red-500/10" : "text-gray-400 border-l-gray-300"} 
            />
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* Chart Container */}
          <motion.div 
            className="col-span-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 20 }}
          >
            <Card className="glass-panel h-full border-t-4 border-t-indigo-500 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle>12-Month Event Overview</CardTitle>
              </CardHeader>
              <CardContent className="h-[320px] pb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888833" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{fill: 'rgba(79, 70, 229, 0.05)'}} 
                      contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', backdropFilter: 'blur(8px)' }} 
                    />
                    {/* Added animation duration and easings for smooth bar growth */}
                    <Bar dataKey="events" fill="#4f46e5" radius={[6, 6, 0, 0]} animationDuration={1500} animationEasing="ease-out" />
                    <Bar dataKey="resources" fill="#db2777" radius={[6, 6, 0, 0]} animationDuration={1500} animationEasing="ease-out" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Allocations List */}
          <motion.div 
            className="col-span-3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
          >
            <Card className="glass-panel h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle>Recent Allocations</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <motion.div 
                  className="space-y-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  {data?.recentAllocations?.length > 0 ? (
                    data.recentAllocations.map((allocation) => (
                      <motion.div 
                        key={allocation._id} 
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm cursor-default transition-colors hover:bg-white/60 dark:hover:bg-gray-800/60 shadow-sm"
                      >
                        <div>
                          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                            {allocation.eventId?.name || 'Unknown Event'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Assigned: {allocation.resourceId?.name || 'Unknown Resource'}
                          </p>
                        </div>
                        <span className="text-xs px-3 py-1 font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 rounded-full shadow-inner">
                          {allocation.status || 'Confirmed'}
                        </span>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-gray-400">
                      <FiCheckCircle className="w-8 h-8 mb-2 opacity-20" />
                      <p className="text-sm">No recent allocations.</p>
                    </div>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

function StatCard({ title, value, icon, className = "" }) {
  return (
    <Card className={`glass-panel border-l-4 border-l-primary hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-out ${className}`}>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <motion.h3 
            className="text-3xl font-bold mt-2 text-gray-900 dark:text-white"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            {value}
          </motion.h3>
        </div>
        <div className="p-4 bg-primary/10 rounded-2xl text-primary text-2xl shadow-inner">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}