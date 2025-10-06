import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TailorClient from './TailorClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'gen',
};

export default async function Tailor() {
  // Server-side authentication check
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect('/auth?callbackUrl=/tailor');
  }

  return <TailorClient />;
}
