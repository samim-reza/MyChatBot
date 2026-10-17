import { about, skillGroups } from '@/config/About';
import Image from 'next/image';
import React from 'react';

import Container from '../common/Container';
import SectionHeading from '../common/SectionHeading';
import Tag from '../common/Tag';

export default function About() {
  return (
    <Container className="mt-20">
      <SectionHeading subHeading="About" heading="Me" />
      <div className="mt-6 grid gap-6 md:grid-cols-[240px_minmax(0,1fr)] md:gap-10">
        <Image
          src={about.image}
          alt={about.name}
          width={480}
          height={600}
          className="border-border aspect-[4/5] w-full max-w-60 rounded-2xl border object-cover object-top"
        />
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h3 className="text-2xl font-bold">{about.name}</h3>
            <p className="text-muted-foreground max-w-[65ch]">
              {about.description}
            </p>
          </div>
          <dl className="grid gap-3">
            {skillGroups.map((group) => (
              <div
                key={group.label}
                className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-baseline"
              >
                <dt className="text-muted-foreground font-mono text-[10.5px] tracking-[0.08em] uppercase">
                  {group.label}
                </dt>
                <dd className="flex flex-wrap gap-1.5">
                  {group.skills.map((skill) => (
                    <Tag key={skill}>{skill}</Tag>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Container>
  );
}
