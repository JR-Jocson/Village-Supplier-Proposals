import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to Hebrew locale by default
  redirect('/he');
}

