'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { SubscriptionPlansManager } from '@/components/admin/SubscriptionPlansManager';
import { PageHeader } from '@/components/admin/PageHeader';

export default function SubscriptionPlansPage() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <>
      <PageHeader
        icon="solar:card-bold-duotone"
        title="Tarif rejalarini boshqarish"
        subtitle="Obuna tarif rejalarini sozlash va boshqarish"
        backHref="/admin"
      />

      <SubscriptionPlansManager />
    </>
  );
}
