import { about } from './About';
import { heroConfig } from './Hero';

export interface PageMeta {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
}

export const siteConfig = {
  name: heroConfig.name,
  title: 'Samim Reza — Portfolio',
  description:
    'Senior AI Software Engineer building AI voice agents, RAG systems, ML pipelines, and full-stack apps. Founder of Callisa and Wasilah.',
  url: process.env.NEXT_PUBLIC_URL || 'https://samimreza.me',
  ogImage: '/meta/opengraph-image-v3.png',
  author: {
    name: about.name,
    twitter: '@samimreza',
    github: 'samim-reza',
    linkedin: 'samim-reza',
    email: 'samimreza2111@gmail.com',
  },
  keywords: [
    'portfolio',
    'machine learning',
    'AI',
    'voice AI',
    'RAG',
    'full-stack',
    'python',
    'fastapi',
    'samim reza',
    'bangladesh',
  ],
};

export const pageMetadata: Record<string, PageMeta> = {
  '/': {
    title: `${about.name} - ${heroConfig.title}`,
    description: `${about.description} Explore my projects, experience, and technical expertise.`,
    keywords: [
      'portfolio',
      'machine learning',
      'AI',
      'voice AI',
      'projects',
      'developer',
    ],
    ogImage: '/meta/hero-v3.png',
    twitterCard: 'summary_large_image',
  },
  '/chat': {
    title: 'Chat - Ask Samim',
    description:
      "Chat with Samim Reza's portfolio assistant about work, projects, education, and how to get in touch.",
    keywords: ['chat', 'ai assistant', 'portfolio', 'samim reza'],
    ogImage: '/assets/samim-avatar.jpg',
    twitterCard: 'summary',
  },
  '/contact': {
    title: 'Contact - Get in Touch',
    description:
      'Get in touch with Samim for collaborations, projects, or opportunities.',
    keywords: ['contact', 'hire', 'collaboration', 'ml engineer'],
    ogImage: '/assets/samim-avatar.jpg',
    twitterCard: 'summary',
  },
  '/work-experience': {
    title: 'Work Experience - Professional Journey',
    description:
      'Professional work experience across SloanCode, Nuhu Labs, Brandifies, robotics, and teaching.',
    keywords: [
      'work experience',
      'senior ai software engineer',
      'sloancode',
      'nuhu labs',
      'brandifies',
      'ml engineer',
      'robotics',
    ],
    ogImage: '/meta/work-v3.png',
    twitterCard: 'summary_large_image',
  },
  '/projects': {
    title: 'Projects - Portfolio',
    description:
      'Voice AI products, SaaS platforms, ML research, and full-stack applications, including Callisa, Wasilah, KobitaLM, and IRIS.',
    keywords: ['projects', 'AI', 'voice AI', 'RAG', 'fastapi', 'callisa'],
    ogImage: '/meta/projects-v3.png',
    twitterCard: 'summary_large_image',
  },
  '/resume': {
    title: 'Resume - Samim Reza',
    description: `View and download ${about.name}'s professional resume and CV.`,
    keywords: ['resume', 'cv', 'ml engineer', 'samim reza'],
    ogImage: '/meta/resume-v3.png',
    twitterCard: 'summary',
  },
};

export function getPageMetadata(pathname: string): PageMeta {
  return pageMetadata[pathname] || pageMetadata['/'];
}

export function generateMetadata(pathname: string) {
  const pageMeta = getPageMetadata(pathname);

  return {
    metadataBase: new URL(siteConfig.url),
    title: pageMeta.title,
    description: pageMeta.description,
    keywords: pageMeta.keywords?.join(', '),
    authors: [{ name: siteConfig.author.name }],
    creator: siteConfig.author.name,
    openGraph: {
      type: 'website',
      url: `${siteConfig.url}${pathname}`,
      title: pageMeta.title,
      description: pageMeta.description,
      siteName: siteConfig.title,
      images: [
        {
          url: pageMeta.ogImage || siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: pageMeta.title,
        },
      ],
    },
    twitter: {
      card: pageMeta.twitterCard || 'summary_large_image',
      title: pageMeta.title,
      description: pageMeta.description,
      images: [pageMeta.ogImage || siteConfig.ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `${siteConfig.url}${pathname}`,
    },
  };
}
