import { cn } from '@/lib/utils';
import React from 'react';

// Small status light: amber for "on air" signal, green for live/current.
export default function Lamp({
  tone = 'signal',
  className,
}: {
  tone?: 'signal' | 'live';
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block size-2 shrink-0 rounded-full',
        tone === 'live'
          ? 'bg-live shadow-[0_0_0_3px_color-mix(in_srgb,var(--live)_22%,transparent)]'
          : 'bg-primary shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_25%,transparent)]',
        className,
      )}
    />
  );
}
