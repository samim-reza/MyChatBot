'use client';

import ChatBubble from '@/components/common/ChatBubble';
import { usePathname } from 'next/navigation';

export default function SiteChatBubble() {
  const pathname = usePathname();
  if (pathname === '/chat' || pathname === '/chat/') {
    return null;
  }
  return <ChatBubble />;
}
