/**
 * Script to create an admin user in the database
 * 
 * Usage:
 * 1. Make sure your DATABASE_URL is set in .env
 * 2. Run: npx tsx scripts/create-admin.ts
 * 
 * You will be prompted to enter admin details.
 */

import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createAdmin() {
  try {
    console.log('\n=== Create Admin User ===\n');

    const email = await question('Enter admin email: ');
    const name = await question('Enter admin name: ');
    const password = await question('Enter admin password: ');

    if (!email || !name || !password) {
      console.error('Error: All fields are required');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error(`Error: User with email ${email} already exists`);
      process.exit(1);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'admin',
      },
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Name:', admin.name);
    console.log('Role:', admin.role);
    console.log('\nYou can now log in at /admin/login\n');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

createAdmin();

