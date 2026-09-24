import { Link } from 'react-router-dom';
import LottieBlock from '../components/LottieBlock';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f6f1ea] px-6 text-center">
      <div>
        <LottieBlock kind="error" className="mx-auto h-48 w-48" />
        <h1 className="serif mt-4 text-5xl">Misplaced the hall pass</h1>
        <p className="mt-2 text-sm text-black/50">This corridor does not exist on the campus map.</p>
        <Link to="/" className="mt-6 inline-block rounded-full bg-black px-5 py-2 text-sm text-white">
          Back to Aura
        </Link>
      </div>
    </div>
  );
}
