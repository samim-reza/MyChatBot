import Github from '@/components/svgs/Github';
import Code from '@/components/svgs/Code';
import LinkedIn from '@/components/svgs/LinkedIn';
import Mail from '@/components/svgs/Mail';
import JavaScript from '@/components/technologies/JavaScript';
import NextJs from '@/components/technologies/NextJs';
import NodeJs from '@/components/technologies/NodeJs';
import PostgreSQL from '@/components/technologies/PostgreSQL';
import Python from '@/components/technologies/JavaScript';

const ConceptIcon = () => <Code className="size-4" />;

export const skillComponents = {
  NextJs: NextJs,
  PostgreSQL: PostgreSQL,
  NodeJs: NodeJs,
  JavaScript: JavaScript,
  Python: Python,
  ConceptIcon: ConceptIcon,
};

export const heroConfig = {
  name: 'Samim Reza',
  title: 'Senior AI Software Engineer · ML Engineer.',
  avatar: '/assets/samim-pixel-avatar.png',
  skills: [
    {
      name: 'Python',
      href: 'https://www.python.org/',
      component: 'Python',
    },
    {
      name: 'ML',
      href: 'https://en.wikipedia.org/wiki/Machine_learning',
      component: 'ConceptIcon',
    },
    {
      name: 'FastAPI',
      href: 'https://fastapi.tiangolo.com/',
      component: 'NextJs',
    },
    {
      name: 'PostgreSQL',
      href: 'https://www.postgresql.org/',
      component: 'PostgreSQL',
    },
    {
      name: 'RAG',
      href: 'https://en.wikipedia.org/wiki/Retrieval-augmented_generation',
      component: 'ConceptIcon',
    },
    {
      name: 'LLM Agents',
      href: 'https://en.wikipedia.org/wiki/Intelligent_agent',
      component: 'ConceptIcon',
    },
  ],
  description: {
    template:
      'I work as a <b>Senior AI Software Engineer</b> on a restaurant AI phone receptionist SaaS in New York and build ML pipelines, RAG systems, and full-stack products with {skills:0}, {skills:1}, {skills:2}, {skills:3}, and {skills:4}.',
  },
  buttons: [
    {
      variant: 'outline',
      text: 'Resume / CV',
      href: '/resume',
      icon: 'CV',
    },
    {
      variant: 'default',
      text: 'Get in touch',
      href: '/contact',
      icon: 'Chat',
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
