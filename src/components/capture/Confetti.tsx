'use client';

export function Confetti() {
  const colors = ['#16a34a', '#eab308', '#ef4444', '#3b82f6', '#a855f7', '#f97316'];
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.5}s`,
    duration: `${1.5 + Math.random() * 1.5}s`,
    color: colors[i % colors.length],
    size: 6 + Math.random() * 6,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0"
          style={{
            left: piece.left,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confetti-fall ${piece.duration} ${piece.delay} ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}
