'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import CloseoutContent from '@/app/startup/engagements/[id]/closeout/page';

export default function OperatorCloseoutPage() {
  return (
    <AuthProvider>
      <ProtectedLayout>
        {/* We can re-use the exact same content component since it handles both roles internally */}
        <CloseoutContent />
      </ProtectedLayout>
    </AuthProvider>
  );
}
