import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import GenClient from './GenClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'gen',
};

export default async function Gen() {
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect('/auth?callbackUrl=/gen');
  }

  return <GenClient />;
}
