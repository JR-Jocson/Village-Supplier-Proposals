/**
 * Quick script to create an admin user via Supabase
 * This bypasses Prisma connection issues
 */

import bcrypt from 'bcryptjs';

async function main() {
  const email = process.argv[2] || 'admin@example.com';
  const name = process.argv[3] || 'Admin User';
  const password = process.argv[4] || 'admin123';

  const hashedPassword = await bcrypt.hash(password, 10);

  console.log('\n=== Admin User SQL Insert ===\n');
  console.log('Copy and paste this SQL into your database:\n');
  console.log(`INSERT INTO "User" (email, password, name, role)`);
  console.log(`VALUES ('${email}', '${hashedPassword}', '${name}', 'admin');`);
  console.log('\n');
  console.log('Login credentials:');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log('\n');
}

main();

