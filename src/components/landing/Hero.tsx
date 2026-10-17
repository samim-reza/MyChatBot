import { heroConfig, socialLinks } from '@/config/Hero';
import { projects } from '@/config/Projects';
import { type Project } from '@/types/project';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import Container from '../common/Container';
import Lamp from '../common/Lamp';
import { TrackedLink } from '../common/TrackedLink';
import Waveform from '../common/Waveform';
import { ProjectCover } from '../projects/ProjectCover';
import CV from '../svgs/CV';
import Chat from '../svgs/Chat';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

const buttonIcons = {
  CV: CV,
  Chat: Chat,
};

const tile = 'bg-card border-border min-w-0 rounded-2xl border p-5';
const label =
  'text-muted-foreground flex items-center gap-2 font-mono text-[10.5px] tracking-[0.08em] uppercase';

function FeaturedProject({ project }: { project: Project }) {
  return (
    <TrackedLink
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`${tile} group hover:border-primary/50 flex flex-col gap-3 p-3 transition-colors md:col-span-2`}
      track={{
        name: 'external_link_click',
        data: { url: project.link, text: project.title, location: 'hero_tile' },
      }}
    >
      {project.image ? (
        <Image
          src={project.image}
          alt={project.title}
          width={1200}
          height={600}
          priority
          className="border-border aspect-video w-full rounded-xl border object-cover object-top-left"
        />
      ) : (
        <ProjectCover project={project} />
      )}
      <div className="flex flex-col gap-1 px-2 pb-2">
        <h3 className="flex items-center justify-between gap-2 font-bold">
          {project.title}
          <span className="text-muted-foreground group-hover:text-primary transition-colors">
            ↗
          </span>
        </h3>
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {project.description}
        </p>
      </div>
    </TrackedLink>
  );
}

export default function Hero() {
  const {
    name,
    location,
    avatar,
    role,
    company,
    companyCity,
    founderOf,
    summary,
    callStack,
    now,
    buttons,
  } = heroConfig;

  return (
    <Container>
      <section className="grid grid-cols-1 gap-3 md:grid-cols-6">
        {/* Intro */}
        <div className={`${tile} flex flex-col gap-5 md:col-span-4 md:p-7`}>
          <div className="flex items-center gap-4">
            <Image
              src={avatar}
              alt={name}
              width={128}
              height={128}
              priority
              className="border-border size-16 rounded-2xl border object-cover"
            />
            <span className={label}>
              <Lamp tone="live" />
              {location}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              {name}
            </h1>
            <p className="text-muted-foreground max-w-[60ch] text-base md:text-lg">
              <b className="text-foreground font-bold">{role}</b> at {company},{' '}
              {companyCity}. Founder of{' '}
              {founderOf.map((f, i) => (
                <React.Fragment key={f.name}>
                  {i > 0 && ' and '}
                  <TrackedLink
                    href={f.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground decoration-primary underline decoration-2 underline-offset-4"
                    track={{
                      name: 'external_link_click',
                      data: {
                        url: f.href,
                        text: f.name,
                        location: 'hero_title',
                      },
                    }}
                  >
                    {f.name}
                  </TrackedLink>
                </React.Fragment>
              ))}
              . {summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {buttons.map((button) => {
              const IconComponent =
                buttonIcons[button.icon as keyof typeof buttonIcons];
              return (
                <Button
                  key={button.text}
                  asChild
                  variant={button.variant as 'outline' | 'default'}
                  track={{
                    name: 'button_click',
                    data: { buttonId: button.text, section: 'hero' },
                  }}
                >
                  <Link href={button.href}>
                    {IconComponent && <IconComponent />}
                    {button.text}
                  </Link>
                </Button>
              );
            })}
            <div className="ml-1 flex gap-3">
              {socialLinks.map((link) => (
                <Tooltip key={link.name} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <TrackedLink
                      href={link.href}
                      aria-label={link.name}
                      className="text-muted-foreground hover:text-foreground flex items-center transition-colors"
                      track={{
                        name: 'external_link_click',
                        data: {
                          url: link.href,
                          text: link.name,
                          location: 'hero_social',
                        },
                      }}
                    >
                      <span className="size-5">{link.icon}</span>
                    </TrackedLink>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{link.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>

        {/* Live call */}
        <div className={`${tile} flex flex-col gap-4 md:col-span-2`}>
          <span className={label}>
            <Lamp />
            On the line
          </span>
          <Waveform bars={34} className="my-auto h-24" />
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[11.5px]">{callStack.join(' → ')}</p>
            <p className="text-muted-foreground text-xs">
              The call path behind SloanCode&apos;s AI receptionist.
            </p>
          </div>
        </div>

        {/* Now */}
        <div className={`${tile} flex flex-col gap-3 md:col-span-2`}>
          <span className={label}>Now</span>
          <ul className="flex flex-col gap-3">
            {now.map((item) => (
              <li key={item.name}>
                <TrackedLink
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid grid-cols-[auto_1fr] items-center gap-x-3"
                  track={{
                    name: 'external_link_click',
                    data: {
                      url: item.href,
                      text: item.name,
                      location: 'hero_now',
                    },
                  }}
                >
                  <Lamp tone="live" />
                  <b className="group-hover:text-primary font-bold transition-colors">
                    {item.name}
                  </b>
                  <span className="text-muted-foreground col-start-2 text-[13px]">
                    {item.detail}
                  </span>
                </TrackedLink>
              </li>
            ))}
          </ul>
        </div>

        {projects.slice(0, 2).map((project) => (
          <FeaturedProject key={project.title} project={project} />
        ))}
      </section>
    </Container>
  );
}
