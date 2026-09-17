import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FiCalendar, FiBox, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageTransition } from '../components/animations/PageTransition';
import { motion } from 'framer-motion';

const data = [
  { name: 'Jan', events: 4, resources: 10 },
  { name: 'Feb', events: 3, resources: 8 },
  { name: 'Mar', events: 7, resources: 15 },
  { name: 'Apr', events: 5, resources: 12 },
];

export default function Dashboard() {
  return (
    <PageTransition>
      <div className="p-8 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your events and resource allocations.</p>
        </div>

        {/* Animated Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Events" value="24" icon={<FiCalendar />} delay={0.1} />
          <StatCard title="Total Resources" value="142" icon={<FiBox />} delay={0.2} />
          <StatCard title="Allocated" value="89" icon={<FiCheckCircle />} delay={0.3} />
          <StatCard title="Alerts" value="3" icon={<FiAlertCircle />} delay={0.4} className="text-red-500" />
        </div>

        {/* Recharts Data Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <Card className="col-span-4 glass-panel">
            <CardHeader>
              <CardTitle>Event Overview</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888833" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="events" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resources" fill="#db2777" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-3 glass-panel">
            <CardHeader>
              <CardTitle>Recent Allocations</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mapping recent activities */}
              <div className="space-y-4">
                {[1,2,3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-gray-200 dark:border-gray-800">
                    <div>
                      <p className="font-medium text-sm">Tech Symposium 2026</p>
                      <p className="text-xs text-muted-foreground">Assigned: Main Auditorium</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">Confirmed</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}

function StatCard({ title, value, icon, delay, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className={`glass-panel border-l-4 border-l-primary hover:scale-[1.02] transition-transform duration-200 ${className}`}>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold mt-2">{value}</h3>
          </div>
          <div className="p-3 bg-primary/10 rounded-xl text-primary text-xl">
            {icon}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}