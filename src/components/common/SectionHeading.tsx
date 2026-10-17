import Link from 'next/link';
import React from 'react';

interface SectionHeadingProps {
  subHeading: string;
  heading: string;
  link?: { href: string; text: string };
}

export default function SectionHeading({
  subHeading,
  heading,
  link,
}: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] uppercase">
          <span className="bg-primary size-1.5 rounded-full" />
          {subHeading}
        </p>
        <h2 className="text-2xl font-bold tracking-tight">{heading}</h2>
      </div>
      {link && (
        <Link
          href={link.href}
          className="text-muted-foreground hover:text-foreground shrink-0 text-sm font-medium transition-colors"
        >
          {link.text} →
        </Link>
      )}
    </div>
  );
}
