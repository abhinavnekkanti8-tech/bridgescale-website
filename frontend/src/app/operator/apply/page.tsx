import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function OperatorApplyRedirectPage() {
  redirect('/for-talent/apply');
}
