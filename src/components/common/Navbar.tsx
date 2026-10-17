import { navbarConfig } from '@/config/Navbar';
import Image from 'next/image';
import React from 'react';

import Container from './Container';
import { ThemeToggleButton } from './ThemeSwitch';
import { TrackedLink } from './TrackedLink';

export default function Navbar() {
  return (
    <header className="bg-background/80 border-border/60 sticky top-0 z-20 border-b backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <TrackedLink
          href="/"
          className="flex items-center gap-3 font-bold"
          track={{
            name: 'button_click',
            data: { buttonId: 'logo', section: 'navbar' },
          }}
        >
          <Image
            className="border-border size-8 rounded-lg border object-cover"
            src={navbarConfig.logo.src}
            alt={navbarConfig.logo.alt}
            width={navbarConfig.logo.width}
            height={navbarConfig.logo.height}
          />
          <span className="hidden sm:inline">Samim Reza</span>
        </TrackedLink>
        <nav className="flex items-center gap-4 sm:gap-6">
          {navbarConfig.navItems.map((item) => (
            <TrackedLink
              className={`text-muted-foreground hover:text-foreground text-sm font-medium transition-colors ${
                item.hideOnMobile ? 'hidden sm:inline' : ''
              }`}
              key={item.label}
              href={item.href}
              track={{
                name: 'button_click',
                data: { buttonId: item.label, section: 'navbar' },
              }}
            >
              {item.label}
            </TrackedLink>
          ))}
          <ThemeToggleButton variant="circle" start="top-right" blur />
        </nav>
      </Container>
    </header>
  );
}
