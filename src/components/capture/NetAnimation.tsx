'use client';

export function NetAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '600px' }}>
      <div className="animate-net-catch" style={{ transformOrigin: 'center top' }}>
      <svg
        width="220"
        height="280"
        viewBox="0 0 220 280"
        fill="none"
        className="opacity-80"
      >
        {/* Net mesh bag - billowing upward from rim */}
        <path
          d="M25,120 Q35,70 60,40 Q80,20 110,15 Q140,20 160,40 Q185,70 195,120"
          stroke="#d4a373"
          strokeWidth="2"
          fill="none"
          strokeDasharray="8,4"
        />
        <path
          d="M42,120 Q50,78 72,52 Q88,35 110,30 Q132,35 148,52 Q170,78 178,120"
          stroke="#d4a373"
          strokeWidth="2"
          fill="none"
          strokeDasharray="8,4"
        />
        <path
          d="M62,120 Q70,88 86,68 Q96,55 110,50 Q124,55 134,68 Q150,88 158,120"
          stroke="#d4a373"
          strokeWidth="2"
          fill="none"
          strokeDasharray="8,4"
        />
        <path
          d="M85,120 Q90,95 100,80 Q105,72 110,68 Q115,72 120,80 Q130,95 135,120"
          stroke="#d4a373"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="6,3"
        />

        {/* Horizontal mesh lines */}
        <path
          d="M35,90 Q110,65 185,90"
          stroke="#d4a373"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="6,3"
        />
        <path
          d="M48,65 Q110,40 172,65"
          stroke="#d4a373"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="6,3"
        />
        <path
          d="M68,42 Q110,22 152,42"
          stroke="#d4a373"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="6,3"
        />

        {/* Net rim - the opening */}
        <ellipse
          cx="110"
          cy="120"
          rx="85"
          ry="32"
          stroke="#8B4513"
          strokeWidth="4.5"
          fill="none"
        />

        {/* Rim to handle connectors */}
        <line x1="110" y1="152" x2="110" y2="165" stroke="#8B4513" strokeWidth="4" />
        <line x1="25" y1="120" x2="100" y2="160" stroke="#8B4513" strokeWidth="2.5" opacity="0.5" />
        <line x1="195" y1="120" x2="120" y2="160" stroke="#8B4513" strokeWidth="2.5" opacity="0.5" />

        {/* Net handle - extending down toward user */}
        <line
          x1="110"
          y1="165"
          x2="110"
          y2="275"
          stroke="#8B4513"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* Handle grip */}
        <line x1="103" y1="250" x2="117" y2="250" stroke="#6B3410" strokeWidth="2.5" />
        <line x1="103" y1="260" x2="117" y2="260" stroke="#6B3410" strokeWidth="2.5" />
        <rect x="100" y="245" width="20" height="25" rx="3" fill="none" stroke="#6B3410" strokeWidth="1.5" />
      </svg>
      </div>
    </div>
  );
}
