import { type Experience } from '@/config/Experience';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

import Lamp from '../common/Lamp';
import Tag from '../common/Tag';
import Github from '../svgs/Github';
import LinkedIn from '../svgs/LinkedIn';
import Website from '../svgs/Website';
import X from '../svgs/X';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface ExperienceCardProps {
  experience: Experience;
}

const parseDescription = (text: string): string => {
  return text.replace(/\*(.*?)\*/g, '<b>$1</b>');
};

export function ExperienceCard({ experience }: ExperienceCardProps) {
  const hasWebsite = Boolean(experience.website && experience.website !== '#');
  const links = [
    hasWebsite && {
      href: experience.website,
      label: 'Visit Website',
      icon: <Website />,
    },
    experience.x && { href: experience.x, label: 'Follow on X', icon: <X /> },
    experience.linkedin && {
      href: experience.linkedin,
      label: 'Connect on LinkedIn',
      icon: <LinkedIn />,
    },
    experience.github && {
      href: experience.github,
      label: 'View GitHub',
      icon: <Github />,
    },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];

  return (
    <article className="grid gap-3 py-6 md:grid-cols-[180px_minmax(0,1fr)] md:gap-8">
      {/* Dates and place */}
      <div className="text-muted-foreground flex flex-col gap-1 font-mono text-xs">
        <p>
          {experience.startDate} –{' '}
          {experience.isCurrent ? 'Present' : experience.endDate}
        </p>
        <p className="font-sans text-[13px]">{experience.location}</p>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3
              className={cn(
                'text-lg font-bold',
                experience.isBlur ? 'blur-[5px]' : 'blur-none',
              )}
            >
              {experience.company}
            </h3>
            {links.map((link) => (
              <Tooltip key={link.label}>
                <TooltipTrigger asChild>
                  <Link
                    href={link.href}
                    target="_blank"
                    aria-label={link.label}
                    className="text-muted-foreground hover:text-foreground size-4 transition-colors"
                  >
                    {link.icon}
                  </Link>
                </TooltipTrigger>
                <TooltipContent>{link.label}</TooltipContent>
              </Tooltip>
            ))}
            {experience.isCurrent && (
              <span className="text-muted-foreground flex items-center gap-2 font-mono text-[10.5px] tracking-[0.08em] uppercase">
                <Lamp tone="live" />
                Current
              </span>
            )}
          </div>
          <p className="font-medium">{experience.position}</p>
        </div>

        <ul className="text-muted-foreground flex max-w-[70ch] flex-col gap-1.5 text-[15px]">
          {experience.description.map((description) => (
            <li
              key={description}
              className="before:bg-border relative pl-4 before:absolute before:top-[0.6em] before:left-0 before:size-1.5 before:rounded-full"
              dangerouslySetInnerHTML={{
                __html: parseDescription(description),
              }}
            />
          ))}
        </ul>

        <div className="flex flex-wrap gap-1.5">
          {experience.technologies.map((technology) => (
            <Tag key={technology}>{technology}</Tag>
          ))}
        </div>
      </div>
    </article>
  );
}
