import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import AdminDashboardWrapper from '@/components/AdminDashboardWrapper';

export default async function AdminPage() {
  const session = await getAdminSession();

  // Redirect to login if not authenticated
  if (!session) {
    redirect('/admin/login');
  }

  return <AdminDashboardWrapper session={session} />;
}

