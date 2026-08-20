import ChatPageClient from '@/app/chat/ChatPageClient';
import { generateMetadata as getMetadata } from '@/config/Meta';
import { Metadata } from 'next';

export const metadata: Metadata = getMetadata('/chat');

export default function ChatPage() {
  return <ChatPageClient />;
}
