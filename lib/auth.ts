import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase-server';
import bcrypt from 'bcryptjs';

export interface AdminSession {
  userId: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Get the current admin session from cookies
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  
  if (!sessionCookie) {
    return null;
  }

  try {
    const session = JSON.parse(sessionCookie.value) as AdminSession;
    
    // Verify the user still exists and is an admin
    const { data: user, error } = await supabaseServer
      .from('User')
      .select('id, email, name, role')
      .eq('id', session.userId)
      .single();

    if (error || !user || user.role !== 'admin') {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Check if current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getAdminSession();
  return session !== null && session.role === 'admin';
}

/**
 * Verify admin credentials
 */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<AdminSession | null> {
  try {
    const { data: user, error } = await supabaseServer
      .from('User')
      .select('id, email, name, role, password')
      .eq('email', email)
      .single();

    if (error || !user || user.role !== 'admin') {
      console.error('User not found or not admin:', error);
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.error('Invalid password');
      return null;
    }

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  } catch (error) {
    console.error('Error verifying credentials:', error);
    return null;
  }
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verify admin session from request
 */
export async function verifyAdminSession(request: Request): Promise<AdminSession | null> {
  // For Next.js API routes, we need to extract cookies differently
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return null;
  }

  // Parse cookies manually
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const sessionCookie = cookies['admin_session'];
  if (!sessionCookie) {
    return null;
  }

  try {
    const session = JSON.parse(decodeURIComponent(sessionCookie)) as AdminSession;
    
    // Verify the user still exists and is an admin
    const { data: user, error } = await supabaseServer
      .from('User')
      .select('id, email, name, role')
      .eq('id', session.userId)
      .single();

    if (error || !user || user.role !== 'admin') {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

