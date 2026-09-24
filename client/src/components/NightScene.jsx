export default function NightScene() {
  return (
    <svg viewBox="0 0 900 720" className="h-full w-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b1c8a" />
          <stop offset="55%" stopColor="#2a126e" />
          <stop offset="100%" stopColor="#1a0b4a" />
        </linearGradient>
        <linearGradient id="glow" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id="pool" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <rect width="900" height="720" fill="url(#sky)" />
      <circle cx="780" cy="92" r="42" fill="#f5f3ff" opacity="0.95" />
      <circle cx="780" cy="92" r="58" fill="#c4b5fd" opacity="0.18" />
      {Array.from({ length: 40 }).map((_, i) => (
        <circle
          key={i}
          cx={(i * 97) % 900}
          cy={(i * 53) % 260}
          r={i % 5 === 0 ? 1.8 : 1}
          fill="white"
          opacity={0.35 + (i % 4) * 0.15}
        />
      ))}
      <path d="M0 250 Q140 190 240 250 T460 230 T720 260 T900 220 V720 H0Z" fill="#2e1a72" />
      <path d="M40 300 L110 170 L180 300Z" fill="#24145e" />
      <path d="M160 310 L250 140 L330 310Z" fill="#1c1052" />
      <path d="M620 300 L700 160 L780 300Z" fill="#24145e" />
      <g fill="#1a0d45">
        {Array.from({ length: 18 }).map((_, i) => (
          <path key={i} d={`M${20 + i * 28} 390 l10 -70 l10 70Z`} />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <path key={`r${i}`} d={`M${560 + i * 32} 370 l12 -90 l12 90Z`} />
        ))}
      </g>
      <rect x="0" y="520" width="900" height="200" fill="#3b27a0" />
      <ellipse cx="430" cy="600" rx="280" ry="70" fill="url(#pool)" />
      <path d="M500 600 C560 560 620 540 700 560 L720 720 H0 V640 C80 600 180 620 260 600Z" fill="#31207a" opacity="0.55" />
      <g transform="translate(210,250)">
        <rect x="40" y="80" width="320" height="210" rx="8" fill="#4c1d95" />
        <rect x="40" y="80" width="320" height="18" fill="#6d28d9" />
        <rect x="70" y="120" width="70" height="150" fill="url(#glow)" />
        <rect x="160" y="130" width="55" height="90" fill="#f59e0b" />
        <rect x="230" y="125" width="90" height="70" fill="#7c3aed" stroke="#a78bfa" />
        <g fill="#1e1b4b">
          {Array.from({ length: 6 }).map((_, r) =>
            Array.from({ length: 8 }).map((__, c) => (
              <rect key={`${r}-${c}`} x={236 + c * 10} y={132 + r * 10} width="6" height="6" rx="0.5" />
            ))
          )}
        </g>
        <rect x="300" y="210" width="40" height="80" fill="#fbbf24" />
        <path d="M360 70 L480 40 L480 300 L360 300Z" fill="#6d28d9" />
        <path d="M470 55 L470 285" stroke="#ddd6fe" strokeWidth="6" opacity="0.4" />
        <rect x="380" y="90" width="70" height="200" rx="6" fill="#f59e0b" />
        <circle cx="430" cy="185" r="10" fill="#fde68a" />
        <rect x="0" y="200" width="90" height="90" rx="8" fill="#5b21b6" />
        <rect x="12" y="214" width="28" height="50" fill="#fbbf24" />
        <rect x="48" y="226" width="28" height="38" fill="#f59e0b" />
      </g>
      <g fill="#4c1d95">
        <ellipse cx="160" cy="500" rx="40" ry="18" />
        <circle cx="140" cy="470" r="22" />
        <circle cx="175" cy="460" r="28" />
        <circle cx="200" cy="485" r="18" />
      </g>
      <path d="M520 560 C540 540 580 530 640 548" stroke="#a5b4fc" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}
