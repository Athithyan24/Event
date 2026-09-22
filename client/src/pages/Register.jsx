import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FiLock, FiMail, FiUser } from 'react-icons/fi';
import api from '../lib/axios';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await api.post('/auth/register', formData);
      navigate('/login', { replace: true, state: { message: 'Account created. Please sign in.' } });
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-md"
      >
        <Card className="glass-panel border-0 shadow-2xl">
          <CardHeader className="space-y-1 text-center pt-8">
            <CardTitle className="text-3xl font-bold tracking-tight">Create account</CardTitle>
            <CardDescription className="text-gray-500">
              Register as a campus event coordinator
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="relative">
                <FiUser className="absolute left-3 top-3 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Full name"
                  className="pl-10 bg-white/50 dark:bg-black/20"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-gray-400" />
                <Input
                  type="email"
                  placeholder="name@college.edu"
                  className="pl-10 bg-white/50 dark:bg-black/20"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Create a password"
                  className="pl-10 bg-white/50 dark:bg-black/20"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  minLength={6}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" disabled={isSubmitting} className="w-full mt-6 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0">
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </Button>
              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
