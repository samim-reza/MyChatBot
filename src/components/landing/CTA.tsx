'use client';

import { ctaConfig } from '@/config/CTA';
import { useHapticFeedback } from '@/hooks/use-haptic-feedback';
import { useUmami } from '@/hooks/use-umami';
import Image from 'next/image';

import Container from '../common/Container';
import { TrackedLink } from '../common/TrackedLink';

export default function CTA() {
  const { triggerHaptic, isMobile } = useHapticFeedback();
  const { trackEvent } = useUmami();

  const handleClick = () => {
    if (isMobile()) {
      triggerHaptic('medium');
    }
    trackEvent({
      name: 'button_click',
      data: {
        buttonId: 'email_cta',
        section: 'cta',
        action: ctaConfig.linkText,
      },
    });
  };

  return (
    <Container className="mt-20">
      <div className="bg-card border-border flex flex-col items-start gap-5 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
        <p className="text-lg font-bold md:text-xl">{ctaConfig.preText}</p>
        <div className="flex flex-wrap gap-3">
          <TrackedLink
            href={`mailto:${ctaConfig.email}`}
            onClick={handleClick}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors"
          >
            <Image
              alt={ctaConfig.profileAlt}
              width={20}
              height={20}
              className="size-5 rounded-full object-cover"
              src={ctaConfig.profileImage}
            />
            {ctaConfig.linkText}
          </TrackedLink>
          <TrackedLink
            href="/chat"
            className="bg-card hover:bg-accent border-border inline-flex h-9 items-center rounded-lg border px-4 text-sm font-semibold transition-colors"
            track={{
              name: 'button_click',
              data: { buttonId: 'chat_cta', section: 'cta' },
            }}
          >
            Talk to my AI
          </TrackedLink>
        </div>
      </div>
    </Container>
  );
}
