'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { SubscriptionPlansManager } from '@/components/admin/SubscriptionPlansManager';

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-4 transition-colors group"
          >
            <Icon icon="solar:arrow-left-line-duotone" className="text-lg group-hover:hidden" />
            <Icon icon="solar:arrow-left-bold-duotone" className="text-lg hidden group-hover:block" />
            <span>Назад в админку</span>
          </button>
        </div>

        <SubscriptionPlansManager />
      </div>
    </div>
  );
}
