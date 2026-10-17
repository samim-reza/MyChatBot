import { footerConfig } from '@/config/Footer';
import React from 'react';

import Container from './Container';

export default function Footer() {
  return (
    <Container className="pb-16">
      <div className="border-border text-muted-foreground flex flex-col items-center justify-between gap-2 border-t pt-6 font-mono text-xs sm:flex-row">
        <p>
          &copy; {new Date().getFullYear()} Samim Reza. {footerConfig.copyright}
        </p>
        <p>Dhaka · New York</p>
      </div>
    </Container>
  );
}
