import { motion } from 'framer-motion';
import { Children } from 'react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const StaggerContainer = ({ children }) => (
  <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4">
    {Children.toArray(children).map((child, index) => (
      <motion.div key={index} variants={item}>
        {child}
      </motion.div>
    ))}
  </motion.div>
);