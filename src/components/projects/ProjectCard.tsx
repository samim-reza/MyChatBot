'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useUmami } from '@/hooks/use-umami';
import type { AnalyticsEventData } from '@/types/analytics';
import { type Project } from '@/types/project';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

import Tag from '../common/Tag';
import ArrowRight from '../svgs/ArrowRight';
import Github from '../svgs/Github';
import PlayCircle from '../svgs/PlayCircle';
import Website from '../svgs/Website';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { ProjectCover } from './ProjectCover';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const { trackEvent } = useUmami();

  // Stable, human-readable id derived from the project's details route, e.g.
  // '/projects/sleek-portfolio' -> 'sleek-portfolio'. Keeps every project
  // uniquely identifiable in the dashboard with no per-project config.
  const projectId =
    project.projectDetailsPageSlug.split('/').filter(Boolean).pop() ??
    project.title;
  const hasProjectLink = Boolean(project.link && project.link !== '#');
  const hasDetailsPage = project.details;

  const trackProject = (
    action: AnalyticsEventData['project_click']['action'],
  ) =>
    trackEvent({
      name: 'project_click',
      data: {
        projectId,
        projectTitle: project.title,
        action,
        location: 'project_card',
      },
    });

  return (
    <Card className="group hover:border-primary/50 h-full w-full gap-0 overflow-hidden rounded-2xl p-3 shadow-none transition-colors">
      <CardHeader className="p-0">
        <div className="group relative overflow-hidden rounded-xl">
          {project.image ? (
            <Image
              className="border-border aspect-video h-full w-full rounded-xl border object-cover object-top-left"
              src={project.image}
              alt={project.title}
              width={1920}
              height={1080}
            />
          ) : (
            <ProjectCover project={project} />
          )}
          {project.video && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:backdrop-blur-xs">
                  <button
                    className="flex size-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors duration-200 group-hover:cursor-pointer hover:bg-white/30"
                    onClick={() => trackProject('play_video')}
                  >
                    <PlayCircle />
                  </button>
                </div>
              </DialogTrigger>
              <DialogContent className="w-full max-w-4xl border-0 p-0">
                <div className="aspect-video w-full">
                  <video
                    className="h-full w-full rounded-lg object-cover"
                    src={project.video}
                    autoPlay
                    loop
                    controls
                  />
                </div>
                <DialogTitle className="sr-only">{project.title}</DialogTitle>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 px-2 pt-4 pb-2">
        {/* Title and links */}
        <div className="flex items-start justify-between gap-4">
          {hasDetailsPage ? (
            <Link
              href={project.projectDetailsPageSlug}
              onClick={() => trackProject('view_details')}
            >
              <h3 className="group-hover:text-primary text-lg leading-tight font-bold transition-colors">
                {project.title}
              </h3>
            </Link>
          ) : hasProjectLink ? (
            <Link
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackProject('visit_website')}
            >
              <h3 className="group-hover:text-primary text-lg leading-tight font-bold transition-colors">
                {project.title}
              </h3>
            </Link>
          ) : (
            <h3 className="text-lg leading-tight font-bold">{project.title}</h3>
          )}
          <div className="flex shrink-0 items-center gap-2">
            {hasProjectLink && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    className="text-muted-foreground hover:text-foreground flex size-5 items-center justify-center transition-colors"
                    href={project.link}
                    target="_blank"
                    aria-label={`Open ${project.title}`}
                    onClick={() => trackProject('visit_website')}
                  >
                    <Website />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View Website</p>
                </TooltipContent>
              </Tooltip>
            )}
            {project.github && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    className="text-muted-foreground hover:text-foreground flex size-5 items-center justify-center transition-colors"
                    href={project.github}
                    target="_blank"
                    aria-label={`${project.title} on GitHub`}
                    onClick={() => trackProject('visit_github')}
                  >
                    <Github />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View GitHub</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        <p className="text-muted-foreground line-clamp-3 text-sm">
          {project.description}
        </p>

        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {project.technologies.map((technology) => (
            <Tag key={technology}>{technology}</Tag>
          ))}
        </div>
      </CardContent>

      {project.details && (
        <CardFooter className="flex justify-end px-2 pt-2 pb-1">
          <Link
            href={project.projectDetailsPageSlug}
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm underline-offset-4 transition-colors hover:underline"
            onClick={() => trackProject('view_details')}
          >
            View Details <ArrowRight className="size-4" />
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
