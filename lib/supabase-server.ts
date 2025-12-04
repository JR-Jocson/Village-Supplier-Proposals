/**
 * Server-side Supabase client for direct database queries
 * This bypasses Prisma connection issues
 * 
 * SECURITY NOTE: This uses the service role key which bypasses RLS.
 * The User table has RLS enabled to prevent client-side access,
 * but the service role key can still access it for authentication.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// IMPORTANT: Must use service role key for server-side auth operations
// This bypasses RLS which is enabled on the User table
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️ WARNING: SUPABASE_SERVICE_ROLE_KEY not set. Using ANON key as fallback. This may not work with RLS enabled on User table.');
  console.warn('Get your service role key from: Supabase Dashboard > Settings > API > service_role (secret)');
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
