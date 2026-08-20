'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  englishGreeting,
  markNamedGreetingShown,
  readKnownVisitorName,
  shouldShowNamedGreeting,
} from '@/lib/visitor-greeting';
import { useEffect, useState } from 'react';

export default function WelcomeGreeting() {
  const [open, setOpen] = useState(false);
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (!shouldShowNamedGreeting()) return;
    const name = readKnownVisitorName();
    if (!name) return;
    markNamedGreetingShown();
    const copy = englishGreeting(name);
    setHeadline(copy.headline);
    setBody(copy.body);
    setOpen(true);
  }, []);

  if (!headline) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setOpen(false);
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{headline}</DialogTitle>
          <DialogDescription>{body}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} className="w-full sm:w-auto">
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
