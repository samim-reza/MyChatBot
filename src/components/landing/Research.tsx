import { papers } from '@/config/Research';
import React from 'react';

import Container from '../common/Container';
import Lamp from '../common/Lamp';
import SectionHeading from '../common/SectionHeading';
import { TrackedLink } from '../common/TrackedLink';

export default function Research() {
  return (
    <Container className="mt-20 scroll-mt-24" id="research">
      <SectionHeading subHeading="Papers" heading="Research" />
      <ul className="bg-card border-border divide-border mt-6 divide-y rounded-2xl border">
        {papers.map((paper) => (
          <li
            key={paper.name}
            className="grid gap-2 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:gap-8"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <h3 className="font-bold">
                {paper.link ? (
                  <TrackedLink
                    href={paper.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                    track={{
                      name: 'external_link_click',
                      data: {
                        url: paper.link,
                        text: paper.name,
                        location: 'research',
                      },
                    }}
                  >
                    {paper.name} ↗
                  </TrackedLink>
                ) : (
                  paper.name
                )}
              </h3>
              <p className="text-muted-foreground max-w-[70ch] text-sm">
                {paper.title}
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs md:flex-col md:items-end md:gap-1">
              <span className="flex items-center gap-2">
                <Lamp tone={paper.status === 'Published' ? 'live' : 'signal'} />
                {paper.status}
              </span>
              {paper.venue && (
                <span className="text-muted-foreground">{paper.venue}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Container>
  );
}
