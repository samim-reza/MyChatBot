import Calender from '@/components/svgs/Calender';
import { CertificateIcon } from '@phosphor-icons/react/dist/ssr';
import React from 'react';

export type JourneyItem = {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
};

export const journeyItems: JourneyItem[] = [
  {
    name: 'My Journey',
    description: 'Education, research, competitive programming, and milestones.',
    icon: Calender,
    href: '/journey',
  },
  {
    name: 'Achievements & Awards',
    description: 'Academic awards, ICPC, and competition highlights.',
    icon: CertificateIcon,
    href: '/journey/certificates',
  },
];

const journeyConfig = {
  journeyItems,
};

export default journeyConfig;
