import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-slate-950 text-white">
      {/* Animated Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/30 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-600/30 blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 text-center max-w-3xl px-6"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500">Campus Events</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed">
          The ultimate resource allocation and event planning system. Prevent double bookings, manage inventory, and execute flawless events.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link to="/login">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-200 rounded-full px-8 text-lg">
              Get Started
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="rounded-full px-8 text-lg border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
            Learn More
          </Button>
        </div>
      </motion.div>
    </div>
  );
}