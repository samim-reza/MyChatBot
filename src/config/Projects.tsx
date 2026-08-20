import ExpressJs from '@/components/technologies/ExpressJs';
import Github from '@/components/technologies/Github';
import MongoDB from '@/components/technologies/MongoDB';
import NextJs from '@/components/technologies/NextJs';
import NodeJs from '@/components/technologies/NodeJs';
import PostgreSQL from '@/components/technologies/PostgreSQL';
import ReactIcon from '@/components/technologies/ReactIcon';
import TypeScript from '@/components/technologies/TypeScript';
import Vercel from '@/components/technologies/Vercel';
import { Project } from '@/types/project';

export const projects: Project[] = [
  {
    title: 'SloanCode AI Receptionist',
    description:
      'Live restaurant AI phone receptionist SaaS with AI voice workflows, CRM, menu, kitchen flow, reporting, Twilio, RAG, and OpenAI Realtime.',
    image: '/assets/samim-pixel-avatar.png',
    link: 'https://remitjob.com/',
    technologies: [
      { name: 'FastAPI', icon: <NextJs key="fastapi" /> },
      { name: 'PostgreSQL', icon: <PostgreSQL key="postgres" /> },
      { name: 'React', icon: <ReactIcon key="react" /> },
      { name: 'Redis', icon: <MongoDB key="redis" /> },
      { name: 'TypeScript', icon: <TypeScript key="ts" /> },
    ],
    github: 'https://github.com/samim-reza/AutoKitchen',
    live: 'https://remitjob.com/',
    details: false,
    projectDetailsPageSlug: '/projects/autokitchen',
    isWorking: true,
  },
  {
    title: 'TrueDoc',
    description:
      'SaaS for digital document attestation in Bangladesh with QR verification, JWT auth, and BDT payments.',
    image: '/assets/samim-pixel-avatar.png',
    link: 'https://github.com/samim-reza/TrueDoc',
    technologies: [
      { name: 'Django', icon: <ExpressJs key="django" /> },
      { name: 'React', icon: <ReactIcon key="react" /> },
      { name: 'PostgreSQL', icon: <PostgreSQL key="postgres" /> },
    ],
    github: 'https://github.com/samim-reza/TrueDoc',
    live: 'https://github.com/samim-reza/TrueDoc',
    details: false,
    projectDetailsPageSlug: '/projects/truedoc',
    isWorking: true,
  },
  {
    title: 'GoUp',
    description:
      'Lead Ads automation platform that syncs pages and forms through Meta API webhooks, then triggers SMS follow-ups with Celery and Redis.',
    image: '/assets/samim-pixel-avatar.png',
    link: 'https://github.com/samim-reza/GoUp',
    technologies: [
      { name: 'Django', icon: <ExpressJs key="django" /> },
      { name: 'Celery', icon: <NodeJs key="celery" /> },
      { name: 'Redis', icon: <MongoDB key="redis" /> },
      { name: 'Twilio', icon: <TypeScript key="twilio" /> },
    ],
    github: 'https://github.com/samim-reza/GoUp',
    live: 'https://github.com/samim-reza/GoUp',
    details: false,
    projectDetailsPageSlug: '/projects/goup',
    isWorking: true,
  },
  {
    title: 'Personal AI Assistant',
    description:
      'LLM-powered portfolio chatbot with RAG, Groq, and ChromaDB — the assistant on this site.',
    image: '/assets/samim-pixel-avatar.png',
    link: 'https://samimreza.me/chat',
    technologies: [
      { name: 'FastAPI', icon: <NextJs key="fastapi" /> },
      { name: 'ChromaDB', icon: <MongoDB key="chroma" /> },
      { name: 'Groq', icon: <TypeScript key="groq" /> },
    ],
    github: 'https://github.com/samim-reza/MyChatBot',
    live: 'https://samimreza.me/chat',
    details: false,
    projectDetailsPageSlug: '/projects/mychatbot',
    isWorking: true,
  },
  {
    title: 'KobitaLM',
    description:
      'Fine-tuned Gemma 2 9B with LoRA and RAG for Bengali poetry generation.',
    image: '/assets/samim-pixel-avatar.png',
    link: 'https://huggingface.co/samim-reza/KobitaLM',
    technologies: [
      { name: 'PyTorch', icon: <TypeScript key="pytorch" /> },
      { name: 'LoRA', icon: <NextJs key="lora" /> },
      { name: 'HuggingFace', icon: <Github key="hf" /> },
    ],
    github: 'https://github.com/samim-reza/KobitaLM',
    live: 'https://huggingface.co/samim-reza/KobitaLM',
    details: false,
    projectDetailsPageSlug: '/projects/kobitalm',
    isWorking: true,
  },
  {
    title: 'WeCare Medical App',
    description:
      'Offline-first PWA for rural healthcare with AI-assisted triage using FastAPI and Qwen3-VL.',
    image: '/assets/samim-pixel-avatar.png',
    link: 'https://github.com/samim-reza/FutureBuilders2025_GreenU_Tensors',
    technologies: [
      { name: 'FastAPI', icon: <NextJs key="fastapi" /> },
      { name: 'PWA', icon: <ReactIcon key="pwa" /> },
      { name: 'AI Triage', icon: <TypeScript key="ai" /> },
    ],
    github: 'https://github.com/samim-reza/FutureBuilders2025_GreenU_Tensors',
    live: 'https://github.com/samim-reza/FutureBuilders2025_GreenU_Tensors',
    details: false,
    projectDetailsPageSlug: '/projects/wecare',
    isWorking: true,
  },
  {
    title: 'Cirrhosis Outcome Prediction',
    description:
      'Ensemble ML classifier using XGBoost, LightGBM, and CatBoost with 55 engineered features and a 14.5% accuracy gain.',
    image: '/assets/samim-pixel-avatar.png',
    link: '#',
    technologies: [
      { name: 'XGBoost', icon: <TypeScript key="xgboost" /> },
      { name: 'LightGBM', icon: <NextJs key="lightgbm" /> },
      { name: 'CatBoost', icon: <NodeJs key="catboost" /> },
    ],
    live: '#',
    details: false,
    projectDetailsPageSlug: '/projects/cirrhosis-outcome-prediction',
    isWorking: true,
  },
  {
    title: 'Hasib Academic System',
    description:
      'Production Django app for school admissions, attendance, notices, finance, and PDF export for Bangla users.',
    image: '/assets/samim-pixel-avatar.png',
    link: 'https://hasibislamicacademy.github.io/',
    technologies: [
      { name: 'Django', icon: <ExpressJs key="django" /> },
      { name: 'PostgreSQL', icon: <PostgreSQL key="postgres" /> },
      { name: 'Render', icon: <Vercel key="render" /> },
    ],
    github: 'https://github.com/samim-reza/Hasib_School',
    live: 'https://hasibislamicacademy.github.io/',
    details: false,
    projectDetailsPageSlug: '/projects/hasib',
    isWorking: true,
  },
  {
    title: 'Union Ledger',
    description:
      'Collaborative financial tracking with consensus-based voting for deposits, loans, and investments.',
    image: '/assets/samim-pixel-avatar.png',
    link: 'https://samim-reza.github.io/union',
    technologies: [
      { name: 'Django', icon: <ExpressJs key="django" /> },
      { name: 'PostgreSQL', icon: <PostgreSQL key="postgres" /> },
    ],
    github: 'https://github.com/samim-reza/union',
    live: 'https://samim-reza.github.io/union',
    details: false,
    projectDetailsPageSlug: '/projects/union',
    isWorking: true,
  },
  {
    title: 'Mars Rover',
    description:
      'ROS-based autonomous navigation system for Mars rover simulation with embedded systems.',
    image: '/assets/samim-pixel-avatar.png',
    link: 'https://github.com/samim-reza/Rover-robot',
    technologies: [
      { name: 'ROS', icon: <NextJs key="ros" /> },
      { name: 'C++', icon: <TypeScript key="cpp" /> },
      { name: 'Embedded', icon: <NodeJs key="embedded" /> },
    ],
    github: 'https://github.com/samim-reza/Rover-robot',
    live: 'https://github.com/samim-reza/Rover-robot',
    details: false,
    projectDetailsPageSlug: '/projects/mars-rover',
    isWorking: true,
  },
];
