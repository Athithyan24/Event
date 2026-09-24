import { Link } from 'react-router-dom';
import NightScene from '../components/NightScene';

export default function Register() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f4ff]">
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10">
        <div className="relative grid w-full overflow-hidden rounded-[32px] bg-white shadow-[0_40px_80px_-40px_rgba(76,29,149,0.45)] md:grid-cols-[0.9fr_1.1fr]">
          <div className="relative z-10 flex flex-col justify-center px-8 py-14 sm:px-14">
            <span className="mb-8 inline-block h-4 w-4 rounded-full bg-[#f0b429]" />
            <h1 className="text-3xl font-semibold tracking-tight text-[#1a1340]">
              Join
              <br />
              <span className="text-[40px] leading-none">Aura</span>
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-black/55">
              Accounts are issued by campus administration. Ask your department coordinator, or sign in with a demo profile to explore the studio.
            </p>
            <Link
              to="/login"
              className="mt-10 inline-flex w-fit rounded-full bg-[#7b3fe4] px-10 py-2.5 text-sm font-medium text-white"
            >
              Back to LOGIN
            </Link>
          </div>
          <div className="relative hidden min-h-[520px] md:block">
            <NightScene />
            <svg className="absolute inset-y-0 left-0 h-full w-40" viewBox="0 0 160 720" preserveAspectRatio="none">
              <path d="M160 0 C80 160 20 280 40 420 C60 560 120 640 160 720 L0 720 L0 0Z" fill="white" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
