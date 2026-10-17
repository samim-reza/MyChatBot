import { type Experience } from '@/config/Experience';
import React from 'react';

import { ExperienceCard } from './ExperienceCard';

interface ExperienceListProps {
  experiences: Experience[];
}

export function ExperienceList({ experiences }: ExperienceListProps) {
  if (experiences.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No work experiences found.</p>
      </div>
    );
  }

  return (
    <div className="divide-border flex flex-col divide-y">
      {experiences.map((experience: Experience) => (
        <ExperienceCard
          key={`${experience.company}-${experience.position}`}
          experience={experience}
        />
      ))}
    </div>
  );
}
