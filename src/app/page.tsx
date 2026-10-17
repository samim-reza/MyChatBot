import About from '@/components/landing/About';
import CTA from '@/components/landing/CTA';
import Experience from '@/components/landing/Experience';
import Github from '@/components/landing/Github';
import Hero from '@/components/landing/Hero';
import Journey from '@/components/landing/Journey';
import Projects from '@/components/landing/Projects';
import Research from '@/components/landing/Research';
import React from 'react';

export default function page() {
  return (
    <main className="min-h-screen py-8 md:py-12">
      <Hero />
      <Experience />
      <Projects />
      <Research />
      <About />
      <Github />
      <CTA />
      <Journey />
    </main>
  );
}
