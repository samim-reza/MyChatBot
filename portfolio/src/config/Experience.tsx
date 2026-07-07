import NextJs from '@/components/technologies/NextJs';
import PostgreSQL from '@/components/technologies/PostgreSQL';
import ReactIcon from '@/components/technologies/ReactIcon';
import TailwindCss from '@/components/technologies/TailwindCss';
import TypeScript from '@/components/technologies/TypeScript';
import Vercel from '@/components/technologies/Vercel';

export interface Technology {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export interface Experience {
  company: string;
  position: string;
  location: string;
  image: string;
  description: string[];
  startDate: string;
  endDate: string;
  website: string;
  x?: string;
  linkedin?: string;
  github?: string;
  technologies: Technology[];
  isCurrent: boolean;
  isBlur?: boolean;
}

export const experiences: Experience[] = [
  {
    isCurrent: true,
    company: 'SloanCode',
    position: 'Senior AI Software Engineer',
    location: 'New York, NY, United States',
    image: '/assets/samim-pixel-avatar.png',
    description: [
      'Lead engineering for a live restaurant AI phone receptionist SaaS sold in New York.',
      'Built and own the AI voice workflow, frontend, backend, QA, CRM, menu, kitchen flow, and reporting systems.',
      'Work across OpenAI Realtime, Twilio Media Streams, RAG, restaurant operations, and production reporting workflows.',
    ],
    startDate: 'May 2026',
    endDate: 'Present',
    technologies: [
      { name: 'FastAPI', href: 'https://fastapi.tiangolo.com/', icon: <NextJs /> },
      { name: 'PostgreSQL', href: 'https://www.postgresql.org/', icon: <PostgreSQL /> },
      { name: 'React', href: 'https://react.dev/', icon: <ReactIcon /> },
      { name: 'TypeScript', href: 'https://www.typescriptlang.org/', icon: <TypeScript /> },
    ],
    website: 'https://remitjob.com/',
  },
  {
    isCurrent: true,
    company: 'Brandifies',
    position: 'Machine Learning Engineer',
    location: 'Dhaka, Bangladesh',
    image: '/assets/samim-pixel-avatar.png',
    description: [
      'Built end-to-end ML pipelines: preprocessing, feature engineering, training, and evaluation.',
      'Fine-tuned LLMs and implemented RAG-based chatbot systems with vector databases.',
      'Developed predictive models using XGBoost and similar boosting algorithms.',
    ],
    startDate: 'Dec 2025',
    endDate: 'Present',
    technologies: [
      { name: 'Python', href: 'https://www.python.org/', icon: <TypeScript /> },
      { name: 'PostgreSQL', href: 'https://www.postgresql.org/', icon: <PostgreSQL /> },
      { name: 'React', href: 'https://react.dev/', icon: <ReactIcon /> },
    ],
    website: '#',
  },
  {
    isCurrent: false,
    company: 'RoboTech Valley',
    position: 'Robotics Engineer Intern',
    location: 'Dhaka, Bangladesh (On-Site)',
    image: '/assets/samim-pixel-avatar.png',
    description: [
      'Designed robotics modules using embedded systems and ROS for autonomous navigation.',
    ],
    startDate: 'Jul 2025',
    endDate: 'Sept 2025',
    technologies: [
      { name: 'ROS', href: 'https://www.ros.org/', icon: <NextJs /> },
      { name: 'Python', href: 'https://www.python.org/', icon: <TypeScript /> },
    ],
    website: '#',
  },
  {
    isCurrent: false,
    company: 'Green University of Bangladesh',
    position: 'Teaching Assistant',
    location: 'Dhaka, Bangladesh',
    image: '/assets/samim-pixel-avatar.png',
    description: [
      'Conducted demo classes on C Programming and Data Structures.',
      'Evaluated exam scripts and prepared grade sheets.',
    ],
    startDate: 'May 2025',
    endDate: 'Aug 2025',
    technologies: [
      { name: 'C', href: 'https://en.wikipedia.org/wiki/C_(programming_language)', icon: <TypeScript /> },
    ],
    website: 'https://green.edu.bd',
  },
  {
    isCurrent: false,
    company: 'Green University of Bangladesh',
    position: 'Programming Trainer',
    location: 'Dhaka, Bangladesh',
    image: '/assets/samim-pixel-avatar.png',
    description: [
      'Trained students for competitive programming through weekly problem-solving sessions.',
    ],
    startDate: 'Jan 2025',
    endDate: 'Dec 2025',
    technologies: [
      { name: 'C++', href: 'https://isocpp.org/', icon: <TypeScript /> },
      { name: 'Algorithms', href: 'https://cp-algorithms.com/', icon: <NextJs /> },
    ],
    website: 'https://green.edu.bd',
  },
  {
    isCurrent: false,
    company: 'University Mentorship Program',
    position: 'Mentor',
    location: 'Dhaka, Bangladesh',
    image: '/assets/samim-pixel-avatar.png',
    description: [
      'Mentored first-year students in programming fundamentals and professional tools.',
    ],
    startDate: 'Jun 2023',
    endDate: 'Aug 2025',
    technologies: [
      { name: 'Git', href: 'https://git-scm.com/', icon: <Vercel /> },
      { name: 'Linux', href: 'https://www.linux.org/', icon: <TailwindCss /> },
    ],
    website: '#',
  },
];
