import Github from '@/components/svgs/Github';
import LinkedIn from '@/components/svgs/LinkedIn';
import Mail from '@/components/svgs/Mail';

export const heroConfig = {
  name: 'Samim Reza',
  title: 'Senior AI Software Engineer',
  location: 'Dhaka, Bangladesh',
  avatar: '/assets/samim-avatar.jpg',
  role: 'Senior AI Software Engineer',
  company: 'SloanCode',
  companyCity: 'New York',
  founderOf: [
    { name: 'Callisa', href: 'https://www.banglabot.xyz' },
    { name: 'Wasilah', href: 'https://mywasilah.com' },
  ],
  summary: 'I build voice agents, RAG systems and ML pipelines.',
  // The live call path behind the SloanCode receptionist.
  callStack: ['Twilio', 'OpenAI Realtime', 'FastAPI'],
  now: [
    {
      name: 'SloanCode',
      detail: 'Senior AI Software Engineer',
      href: 'https://restaurant.sloancode.com/',
    },
    {
      name: 'Nuhu Labs',
      detail: 'Byakaron for Linux',
      href: 'https://nuhulabs.com',
    },
    { name: 'Callisa', detail: 'Founder', href: 'https://www.banglabot.xyz' },
    { name: 'Wasilah', detail: 'Founder', href: 'https://mywasilah.com' },
  ],
  buttons: [
    {
      variant: 'default',
      text: 'Talk to my AI',
      href: '/chat',
      icon: 'Chat',
    },
    {
      variant: 'outline',
      text: 'Resume',
      href: '/resume',
      icon: 'CV',
    },
  ],
};

export const socialLinks = [
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/samim-reza',
    icon: <LinkedIn />,
  },
  {
    name: 'Github',
    href: 'https://github.com/samim-reza',
    icon: <Github />,
  },
  {
    name: 'Email',
    href: 'mailto:samimreza2111@gmail.com',
    icon: <Mail />,
  },
];
