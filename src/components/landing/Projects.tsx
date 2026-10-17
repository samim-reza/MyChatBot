import { projects } from '@/config/Projects';
import React from 'react';

import Container from '../common/Container';
import SectionHeading from '../common/SectionHeading';
import { ProjectList } from '../projects/ProjectList';

// The hero already features the first two projects, so this picks up after them.
export default function Projects() {
  return (
    <Container className="mt-20">
      <SectionHeading
        subHeading="More work"
        heading="Projects"
        link={{ href: '/projects', text: 'All projects' }}
      />
      <ProjectList className="mt-6" projects={projects.slice(2, 8)} />
    </Container>
  );
}
