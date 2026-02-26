'use client';

export function NetAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center animate-net-catch">
      <svg
        width="200"
        height="220"
        viewBox="0 0 200 220"
        fill="none"
        className="opacity-80"
      >
        {/* Net handle - coming from top right, angled */}
        <line
          x1="100"
          y1="10"
          x2="100"
          y2="100"
          stroke="#8B4513"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* Handle grip lines */}
        <line x1="94" y1="20" x2="106" y2="20" stroke="#6B3410" strokeWidth="2" />
        <line x1="94" y1="30" x2="106" y2="30" stroke="#6B3410" strokeWidth="2" />

        {/* Net rim */}
        <ellipse
          cx="100"
          cy="130"
          rx="75"
          ry="35"
          stroke="#8B4513"
          strokeWidth="4"
          fill="none"
        />
        {/* Rim to handle connector */}
        <line x1="100" y1="100" x2="100" y2="95" stroke="#8B4513" strokeWidth="5" strokeLinecap="round" />
        <line x1="100" y1="95" x2="25" y2="130" stroke="#8B4513" strokeWidth="3" />
        <line x1="100" y1="95" x2="175" y2="130" stroke="#8B4513" strokeWidth="3" />

        {/* Net mesh - vertical lines hanging down */}
        <path
          d="M25,130 Q40,175 60,200 Q80,215 100,220 Q120,215 140,200 Q160,175 175,130"
          stroke="#d4a373"
          strokeWidth="2"
          fill="none"
          strokeDasharray="8,4"
        />
        <path
          d="M40,130 Q52,168 70,190 Q85,205 100,210 Q115,205 130,190 Q148,168 160,130"
          stroke="#d4a373"
          strokeWidth="2"
          fill="none"
          strokeDasharray="8,4"
        />
        <path
          d="M60,130 Q70,160 85,180 Q92,190 100,195 Q108,190 115,180 Q130,160 140,130"
          stroke="#d4a373"
          strokeWidth="2"
          fill="none"
          strokeDasharray="8,4"
        />
        <path
          d="M80,130 Q88,155 95,170 Q98,178 100,180 Q102,178 105,170 Q112,155 120,130"
          stroke="#d4a373"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="6,3"
        />

        {/* Horizontal mesh lines */}
        <path
          d="M35,150 Q100,170 165,150"
          stroke="#d4a373"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="6,3"
        />
        <path
          d="M50,170 Q100,192 150,170"
          stroke="#d4a373"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="6,3"
        />
        <path
          d="M65,190 Q100,208 135,190"
          stroke="#d4a373"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="6,3"
        />
      </svg>
    </div>
  );
}
