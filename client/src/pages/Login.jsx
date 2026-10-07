import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import NightScene from '../components/NightScene';
import { useAuth } from '../store/auth';

export default function Login() {
  const { register, handleSubmit } = useForm({
    defaultValues: { email: 'admin@aura.edu', password: 'Aura@123' },
  });
  const login = useAuth((s) => s.login);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (values) => {
    setBusy(true);
    setError('');
    try {
      const user = await login(values.email, values.password);
      navigate(user.role === 'admin' ? '/app' : '/app');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not sign in');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f4ff]">
      <p className="pointer-events-none absolute left-10 top-8 hidden text-3xl font-light text-[#c4c0d4] md:block">
        Welcome to
        <br />
        <span className="font-semibold">Aura</span>
      </p>
      <p className="pointer-events-none absolute bottom-8 left-10 hidden text-sm text-[#b9b4c9] md:block">
        Don’t have an account? <span className="text-[#7b3fe4]">Sign up</span>
      </p>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-5 sm:py-7">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative grid w-full overflow-hidden rounded-[32px] bg-white shadow-[0_40px_80px_-40px_rgba(76,29,149,0.45)] md:grid-cols-[0.9fr_1.1fr]"
        >
          <div className="relative z-10 flex flex-col justify-center px-7 py-7 sm:px-12 sm:py-8">
            <span className="mb-3 inline-block h-3 w-3 rounded-full bg-[#f0b429]" />
            <h1 className="text-2xl font-semibold tracking-tight text-[#1a1340]">
              Welcome to
              <br />
              <span className="text-[30px] leading-none">Aura</span>
            </h1>
            <p className="serif mt-2 max-w-sm text-2xl font-medium leading-snug text-[#6f027e]">
              Smart Event Planning and Resource Allocation Management System
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 max-w-sm space-y-3">
              <label className="block">
                <span className="text-xs text-black/45">Email</span>
                <input
                  className="mt-1 w-full border-0 border-b border-black/15 bg-transparent py-1.5 text-sm outline-none focus:border-[#7b3fe4]"
                  {...register('email', { required: true })}
                />
              </label>
              <label className="block">
                <span className="text-xs text-black/45">Password</span>
                <input
                  type="password"
                  className="mt-1 w-full border-0 border-b border-black/15 bg-transparent py-1.5 text-sm tracking-[0.35em] outline-none focus:border-[#7b3fe4]"
                  {...register('password', { required: true })}
                />
              </label>
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <button
                disabled={busy}
                className="rounded-full bg-[#7b3fe4] px-10 py-2.5 text-sm font-medium text-white shadow-[0_10px_24px_-8px_rgba(123,63,228,0.8)] transition hover:bg-[#6d28d9] disabled:opacity-60"
              >
                {busy ? 'Please wait' : 'LOGIN'}
              </button>
            </form>
            <p className="mt-4 text-sm text-black/45">
              Don’t have an account?{' '}
              <Link to="/register" className="text-[#7b3fe4]">
                Sign up
              </Link>
            </p>
            <p className="mt-3 text-[10px] leading-relaxed text-black/35">
              Demo · Admin <b>admin@aura.edu</b> · Department <b>cse@aura.edu</b> · password <b>Aura@123</b>
            </p>
            <section
              aria-label="Student project details"
              className="mt-4 max-w-sm rounded-2xl border border-[#e9e3f4] bg-[#faf8ff] p-3 shadow-[0_12px_28px_-24px_rgba(76,29,149,0.6)]"
            >
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#7b3fe4]">
                Project presented by
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-[#1a1340]">
                Christina Baus S<span className="text-[#b4adc2]">·</span> 2025-2027
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#6f6981]">
                M.Sc. Computer Science <span className="text-[#b4adc2]">·</span> II<sup>nd</sup> Year
                <br />
                Department of Computer Science
              </p>
              <div className="mt-2 border-t border-[#e9e3f4] pt-2">
                <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-[#9991aa]">
                  Guided by
                </p>
                <p className="mt-1 text-sm font-medium text-[#342b50]">Athithyan A</p>
                <p className="mt-1 text-xs text-[#6f6981]">
                  Muslim Arts College, Thiruvidhangode
                </p>
              </div>
            </section>
          </div>

          <div className="relative hidden min-h-[560px] md:block">
            <div className="absolute inset-0">
              <NightScene />
            </div>
            <svg className="absolute inset-y-0 left-0 h-full w-40" viewBox="0 0 160 720" preserveAspectRatio="none">
              <path d="M160 0 C80 160 20 280 40 420 C60 560 120 640 160 720 L0 720 L0 0Z" fill="white" />
            </svg>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
