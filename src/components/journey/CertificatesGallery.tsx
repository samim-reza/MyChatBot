'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { CertificateIcon } from '@phosphor-icons/react';
import Image from 'next/image';
import React, { useState } from 'react';

export interface Certificate {
  file?: string;
  title?: string;
  issuer?: string;
  date?: string;
}

interface CertificatesGalleryProps {
  certificates: Certificate[];
  className?: string;
}

const certificateKey = (cert: Certificate) =>
  cert.file ?? cert.title ?? 'certificate';

export default function CertificatesGallery({
  certificates,
  className,
}: CertificatesGalleryProps) {
  const [active, setActive] = useState<Certificate | null>(null);

  if (certificates.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
        <h2 className="text-2xl font-semibold">No certificates found</h2>
        <p className="text-muted-foreground">
          Check back later for certificates and achievements!
        </p>
      </div>
    );
  }

  // Configured dates are often just a year; only expand full ISO dates.
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    if (/^\d{4}$/.test(dateString)) return dateString;
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <div
        className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`}
      >
        {certificates.map((cert) => (
          <Card
            key={certificateKey(cert)}
            className={`group h-full w-full gap-4 overflow-hidden p-3 shadow-none transition-colors ${
              cert.file ? 'hover:border-primary/50 cursor-pointer' : ''
            }`}
            onClick={() => cert.file && setActive(cert)}
          >
            <CardHeader className="p-0">
              {cert.file ? (
                <div className="bg-muted relative aspect-video overflow-hidden rounded-xl">
                  <Image
                    src={cert.file}
                    alt={cert.title || 'certificate'}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="border-border flex aspect-video flex-col justify-between rounded-xl border bg-[color-mix(in_srgb,var(--primary)_10%,var(--card))] p-4">
                  <CertificateIcon className="text-primary size-7" />
                  <span className="text-muted-foreground font-mono text-[10.5px] tracking-[0.08em] uppercase">
                    {cert.issuer}
                  </span>
                </div>
              )}
            </CardHeader>

            <CardContent className="px-1">
              <div className="space-y-1">
                <h3 className="text-lg leading-tight font-bold">
                  {cert.title || 'Certificate'}
                </h3>
                {cert.issuer && cert.file && (
                  <p className="text-muted-foreground text-sm">{cert.issuer}</p>
                )}
              </div>
            </CardContent>

            {cert.date && (
              <CardFooter className="px-1 pb-1">
                <time
                  className="text-muted-foreground font-mono text-xs"
                  dateTime={cert.date}
                >
                  {formatDate(cert.date)}
                </time>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      {/* Fullscreen viewer */}
      <Dialog
        open={!!active}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
      >
        <DialogContent className="bg-background/95 max-h-[90vh] w-full max-w-[90vw] border-0 p-0 backdrop-blur-sm">
          {active?.file && (
            <>
              <DialogTitle className="sr-only">
                {active.title || 'Certificate'}
              </DialogTitle>
              <div className="flex h-60 items-center justify-center p-4 md:h-92">
                <div className="relative h-full w-full rounded-lg">
                  <Image
                    src={active.file}
                    alt={active.title || 'certificate'}
                    fill
                    className="rounded-lg object-contain"
                  />
                </div>
              </div>
              <div className="border-t px-6 pt-2 pb-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">
                    {active.title || 'Certificate'}
                  </h3>
                  {active.issuer && (
                    <p className="text-muted-foreground text-sm">
                      {active.issuer}
                    </p>
                  )}
                  {active.date && (
                    <time
                      className="text-muted-foreground text-sm"
                      dateTime={active.date}
                    >
                      {formatDate(active.date)}
                    </time>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
