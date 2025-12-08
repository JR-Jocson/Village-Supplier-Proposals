/**
 * Script to add the 'issues' column to ProjectAnalysis table
 * Run with: npx tsx scripts/add-issues-column.ts
 */

import { supabaseServer } from '../lib/supabase-server';

async function addIssuesColumn() {
  try {
    console.log('Adding "issues" column to ProjectAnalysis table...');

    // Check if column already exists
    const { data: existingColumn, error: checkError } = await supabaseServer.rpc('exec_sql', {
      query: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'ProjectAnalysis' 
        AND column_name = 'issues';
      `
    });

    // Use raw SQL query via Supabase
    const { error } = await supabaseServer.rpc('exec_sql', {
      query: `
        ALTER TABLE "ProjectAnalysis" 
        ADD COLUMN IF NOT EXISTS "issues" TEXT[] DEFAULT '{}';
      `
    });

    if (error) {
      // If RPC doesn't work, try direct query
      console.log('RPC method not available, trying alternative approach...');
      console.log('Please run this SQL manually in Supabase SQL Editor:');
      console.log(`
        ALTER TABLE "ProjectAnalysis" 
        ADD COLUMN IF NOT EXISTS "issues" TEXT[] DEFAULT '{}';
      `);
      return;
    }

    console.log('✅ Successfully added "issues" column to ProjectAnalysis table!');
  } catch (error) {
    console.error('Error adding column:', error);
    console.log('\n📝 Please run this SQL manually in Supabase SQL Editor:');
    console.log(`
      ALTER TABLE "ProjectAnalysis" 
      ADD COLUMN IF NOT EXISTS "issues" TEXT[] DEFAULT '{}';
    `);
  }
}

addIssuesColumn();


