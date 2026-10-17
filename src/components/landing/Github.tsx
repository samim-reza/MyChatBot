'use client';

import { githubConfig } from '@/config/Github';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import Container from '../common/Container';
import SectionHeading from '../common/SectionHeading';
import GithubIcon from '../svgs/Github';
import { Button } from '../ui/button';

const ActivityCalendar = dynamic(
  () => import('react-activity-calendar').then((mod) => mod.default),
  { ssr: false },
);

type ContributionItem = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

// The API already returns just the last year of contributions.
type GitHubContributionResponse = {
  total?: { lastYear?: number };
  contributions?: ContributionItem[];
};

export default function Github() {
  const [contributions, setContributions] = useState<ContributionItem[]>([]);
  const [totalContributions, setTotalContributions] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${githubConfig.apiUrl}/${githubConfig.username}?y=last`,
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: GitHubContributionResponse = await response.json();
        const valid = (data.contributions ?? []).filter(
          (item) =>
            typeof item?.date === 'string' &&
            typeof item?.count === 'number' &&
            item.level >= 0 &&
            item.level <= 4,
        );

        if (valid.length > 0) {
          setTotalContributions(
            data.total?.lastYear ??
              valid.reduce((sum, item) => sum + item.count, 0),
          );
          setContributions(valid);
        } else {
          setHasError(true);
        }
      } catch (err) {
        console.error('Failed to fetch GitHub contributions:', err);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <Container className="mt-20">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading subHeading="Code" heading={githubConfig.title} />
          {!isLoading && !hasError && totalContributions > 0 && (
            <p className="text-muted-foreground font-mono text-xs">
              <span className="text-foreground font-medium">
                {totalContributions.toLocaleString()}
              </span>{' '}
              contributions · {githubConfig.username}
            </p>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
              <p className="text-muted-foreground text-sm">
                {githubConfig.loadingState.description}
              </p>
            </div>
          </div>
        ) : hasError || contributions.length === 0 ? (
          <div className="text-muted-foreground bg-card border-border rounded-2xl border p-8 text-center">
            <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <GithubIcon className="h-8 w-8" />
            </div>
            <p className="mb-2 font-medium">{githubConfig.errorState.title}</p>
            <p className="mb-4 text-sm">
              {githubConfig.errorState.description}
            </p>
            <Button
              variant="outline"
              asChild
              track={{
                name: 'external_link_click',
                data: {
                  url: `https://github.com/${githubConfig.username}`,
                  text: githubConfig.errorState.buttonText,
                  location: 'github_section',
                },
              }}
            >
              <Link
                href={`https://github.com/${githubConfig.username}`}
                className="inline-flex items-center gap-2"
              >
                <GithubIcon className="h-4 w-4" />
                {githubConfig.errorState.buttonText}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="relative overflow-hidden">
            <div className="bg-card border-border relative rounded-2xl border p-6">
              <div className="w-full overflow-x-auto">
                <ActivityCalendar
                  data={contributions}
                  blockSize={12}
                  blockMargin={4}
                  fontSize={githubConfig.fontSize}
                  colorScheme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                  maxLevel={githubConfig.maxLevel}
                  hideTotalCount={true}
                  hideColorLegend={false}
                  hideMonthLabels={false}
                  theme={githubConfig.theme}
                  labels={{
                    months: githubConfig.months,
                    weekdays: githubConfig.weekdays,
                    totalCount: githubConfig.totalCountLabel,
                  }}
                  style={{
                    color: 'var(--muted-foreground)',
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
