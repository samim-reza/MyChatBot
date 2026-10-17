import { cn } from '@/lib/utils';
import React from 'react';

// Deterministic bar heights so server and client render the same markup.
const barHeight = (i: number, seed: number) =>
  Math.min(
    100,
    Math.round(
      18 + Math.abs(Math.sin(i * 0.9 + seed) * 62 + Math.sin(i * 2.3) * 20),
    ),
  );

export default function Waveform({
  bars = 32,
  seed = 0,
  className,
}: {
  bars?: number;
  seed?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn('flex h-14 items-center gap-[3px]', className)}
    >
      {Array.from({ length: bars }, (_, i) => (
        <i
          key={i}
          className="wave-bar bg-primary min-w-0.5 flex-1 rounded-[2px]"
          style={{
            height: `${barHeight(i, seed)}%`,
            animationDelay: `${(-(i % 7) * 0.18).toFixed(2)}s`,
          }}
        />
      ))}
    </div>
  );
}
