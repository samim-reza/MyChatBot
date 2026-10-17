import { journeyItems } from '@/config/Journey';
import { ArrowRight } from 'lucide-react';
import React from 'react';

import Container from '../common/Container';
import SectionHeading from '../common/SectionHeading';
import { TrackedLink } from '../common/TrackedLink';
import { Card } from '../ui/card';

export default function Journey() {
  return (
    <Container className="mt-20">
      <SectionHeading subHeading="Milestones" heading="Journey" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {journeyItems.map((item) => (
          <TrackedLink
            className="group"
            href={item.href}
            key={item.name}
            track={{
              name: 'button_click',
              data: {
                buttonId: item.name,
                section: 'journey',
                action: item.href,
              },
            }}
          >
            <Card className="group-hover:border-primary/50 flex flex-row items-center justify-between gap-4 rounded-2xl px-4 py-3 shadow-none transition-colors">
              <div className="bg-muted text-primary flex items-center justify-center rounded-lg p-2">
                {(() => {
                  const Icon = item.icon as React.ComponentType<{
                    className?: string;
                  }>;
                  return <Icon className="size-4" />;
                })()}
              </div>
              <div className="flex w-full flex-col">
                <h3 className="text-base font-semibold">{item.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </div>
              <ArrowRight className="hidden size-4 transition-all duration-300 group-hover:block" />
            </Card>
          </TrackedLink>
        ))}
      </div>
    </Container>
  );
}
