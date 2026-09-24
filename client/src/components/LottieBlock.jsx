import Lottie from 'lottie-react';
import { Component, useEffect, useState } from 'react';

const FALLBACK = {
  login: 'https://assets2.lottiefiles.com/packages/lf20_jcikwtux.json',
  dashboard: 'https://assets9.lottiefiles.com/packages/lf20_w51pcehl.json',
  empty: 'https://assets9.lottiefiles.com/packages/lf20_qh5z2fdq.json',
  success: 'https://assets2.lottiefiles.com/packages/lf20_jbrw3hcz.json',
  error: 'https://assets9.lottiefiles.com/packages/lf20_twijbubv.json',
  workflow: 'https://assets5.lottiefiles.com/packages/lf20_tfb3bf1e.json',
};

class LottieErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

export default function LottieBlock({ kind = 'empty', className = 'h-40 w-40' }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let live = true;
    fetch(FALLBACK[kind] || FALLBACK.empty)
      .then((r) => {
        if (!r.ok) throw new Error(`Animation request failed: ${r.status}`);
        return r.json();
      })
      .then((j) => {
        if (!j || !Array.isArray(j.layers)) throw new Error('Invalid animation data');
        if (live) setData(j);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [kind]);
  const fallback = <div className={`${className} rounded-3xl bg-sand/60 dark:bg-white/5`} />;
  if (!data) return fallback;
  return (
    <LottieErrorBoundary fallback={fallback}>
      <Lottie animationData={data} loop className={className} />
    </LottieErrorBoundary>
  );
}
