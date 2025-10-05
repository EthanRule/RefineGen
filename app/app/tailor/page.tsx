import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { redirect } from 'next/navigation';
// @ts-expect-error: TailorClient module might not have type declarations
import TailorClient from './TailorClient';

export default async function Tailor() {
  // Server-side authentication check
  const session = await getServerSession(authConfig);

  if (!session) {
    redirect('/auth?callbackUrl=/tailor');
  }

  return <TailorClient />;
}
