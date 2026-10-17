import Waveform from '@/components/common/Waveform';
import { type Project } from '@/types/project';
import React from 'react';

// Drawn cover for projects without a real screenshot, so the grid never falls
// back to GitHub's generic repository card.
export function ProjectCover({ project }: { project: Project }) {
  const isVoice = project.category === 'Voice AI';

  return (
    <div className="border-border relative flex aspect-video w-full flex-col justify-between overflow-hidden rounded-xl border bg-[color-mix(in_srgb,var(--primary)_10%,var(--card))] p-4">
      {!isVoice && (
        <div
          aria-hidden="true"
          className="absolute inset-0 [background-image:radial-gradient(color-mix(in_srgb,var(--primary)_35%,transparent)_1px,transparent_1px)] [background-size:14px_14px]"
        />
      )}
      <span className="text-muted-foreground relative font-mono text-[10.5px] tracking-[0.08em] uppercase">
        {project.category}
      </span>
      {isVoice && (
        <Waveform bars={26} seed={project.title.length} className="h-8" />
      )}
      <strong className="relative text-2xl leading-none font-extrabold tracking-tight">
        {project.title}
      </strong>
    </div>
  );
}
