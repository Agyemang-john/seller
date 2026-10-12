// app/(dashboard)/billing/plans/page.jsx
// Plans live on /subscribe; keep this URL working for old links and emails.
import { redirect } from 'next/navigation';

export default function BillingPlansPage() {
  redirect('/subscribe');
}
