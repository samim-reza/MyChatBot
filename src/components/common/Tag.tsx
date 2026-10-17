import { cn } from '@/lib/utils';
import React from 'react';

export default function Tag({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'bg-muted text-muted-foreground inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[11.5px]',
        className,
      )}
    >
      {children}
    </span>
  );
}
