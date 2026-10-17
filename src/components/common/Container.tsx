import { cn } from '@/lib/utils';
import React from 'react';

export default function Container({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'animate-fade-in-blur container mx-auto max-w-5xl px-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
