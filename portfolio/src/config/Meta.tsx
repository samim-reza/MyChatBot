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
  description: 'Senior AI Software Engineer and Machine Learning Engineer building AI voice products, RAG systems, and full-stack apps.',
  url: process.env.NEXT_PUBLIC_URL || 'https://samimreza.me',
  ogImage: '/meta/opengraph-image.png',
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
    keywords: ['portfolio', 'machine learning', 'AI', 'voice AI', 'projects', 'developer'],
    ogImage: '/meta/hero.png',
    twitterCard: 'summary_large_image',
  },
  '/contact': {
    title: 'Contact - Get in Touch',
    description: "Get in touch with Samim for collaborations, projects, or opportunities.",
    keywords: ['contact', 'hire', 'collaboration', 'ml engineer'],
    ogImage: '/assets/samim-pixel-avatar.png',
    twitterCard: 'summary',
  },
  '/work-experience': {
    title: 'Work Experience - Professional Journey',
    description: 'Professional work experience across SloanCode, Brandifies, robotics, and teaching.',
    keywords: ['work experience', 'senior ai software engineer', 'sloancode', 'brandifies', 'ml engineer', 'robotics'],
    ogImage: '/meta/work.png',
    twitterCard: 'summary_large_image',
  },
  '/projects': {
    title: 'Projects - Portfolio',
    description: 'AI products, SaaS platforms, ML research projects, and full-stack applications.',
    keywords: ['projects', 'AI', 'RAG', 'django', 'fastapi'],
    ogImage: '/meta/projects.png',
    twitterCard: 'summary_large_image',
  },
  '/resume': {
    title: 'Resume - Samim Reza',
    description: `View and download ${about.name}'s professional resume and CV.`,
    keywords: ['resume', 'cv', 'ml engineer', 'samim reza'],
    ogImage: '/meta/resume.png',
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
