import { experiences } from '@/config/Experience';
import React from 'react';

import Container from '../common/Container';
import SectionHeading from '../common/SectionHeading';
import { ExperienceList } from '../experience/ExperienceList';

export default function Experience() {
  return (
    <Container className="mt-20">
      <SectionHeading
        subHeading="Work"
        heading="Experience"
        link={{ href: '/work-experience', text: 'All experience' }}
      />
      <div className="mt-2">
        <ExperienceList experiences={experiences.slice(0, 3)} />
      </div>
    </Container>
  );
}
