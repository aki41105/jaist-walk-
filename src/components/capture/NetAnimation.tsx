'use client';

export function NetAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center animate-net-swing">
      <svg
        width="180"
        height="200"
        viewBox="0 0 180 200"
        fill="none"
        className="opacity-70"
      >
        {/* Net handle */}
        <line
          x1="90"
          y1="200"
          x2="90"
          y2="100"
          stroke="#8B4513"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Net rim */}
        <ellipse
          cx="90"
          cy="60"
          rx="70"
          ry="40"
          stroke="#8B4513"
          strokeWidth="4"
          fill="none"
        />
        {/* Net mesh */}
        <path
          d="M20,60 Q30,100 50,120 Q70,135 90,140 Q110,135 130,120 Q150,100 160,60"
          stroke="#d4a373"
          strokeWidth="2"
          fill="none"
          strokeDasharray="8,4"
        />
        <path
          d="M35,60 Q45,90 65,110 Q80,120 90,125 Q100,120 115,110 Q135,90 145,60"
          stroke="#d4a373"
          strokeWidth="2"
          fill="none"
          strokeDasharray="8,4"
        />
        <path
          d="M55,60 Q65,80 80,95 Q85,100 90,105 Q95,100 100,95 Q115,80 125,60"
          stroke="#d4a373"
          strokeWidth="2"
          fill="none"
          strokeDasharray="8,4"
        />
        {/* Horizontal mesh lines */}
        <path
          d="M30,75 Q90,95 150,75"
          stroke="#d4a373"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="6,3"
        />
        <path
          d="M45,95 Q90,115 135,95"
          stroke="#d4a373"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="6,3"
        />
      </svg>
    </div>
  );
}
