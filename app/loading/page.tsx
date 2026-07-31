'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProgressTimeline } from '@/components/loading/ProgressTimeline';
import { Loader2 } from 'lucide-react';

function LoadingContent() {
  const searchParams = useSearchParams();
  const target = searchParams.get('target') || 'https://www.springhilllandscaping.com';
  const type = searchParams.get('type') || 'url';

  return (
    <div className="pt-8">
      <ProgressTimeline targetName={target} type={type} />
    </div>
  );
}

export default function LoadingPage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        }
      >
        <LoadingContent />
      </Suspense>
    </DashboardLayout>
  );
}
