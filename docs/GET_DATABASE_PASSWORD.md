# How to Get Your Database Password

Your `.env` file has been set up with your Supabase credentials, but you need to add your database password to complete the setup.

## Steps to Get Your Database Password

### Option 1: From Supabase Dashboard

1. Go to [https://app.supabase.com/project/qtjnbtvtuivzikeiufua](https://app.supabase.com/project/qtjnbtvtuivzikeiufua)
2. Click on **Settings** (gear icon in the left sidebar)
3. Click on **Database**
4. Scroll down to **Connection string**
5. Click **URI** tab
6. Look for the password in the connection string (it will be after `postgres:` and before `@`)
7. Or reset it using the **Reset Database Password** button

### Option 2: Reset Database Password

If you don't remember your password:

1. Go to [https://app.supabase.com/project/qtjnbtvtuivzikeiufua/settings/database](https://app.supabase.com/project/qtjnbtvtuivzikeiufua/settings/database)
2. Scroll to **Database Password**
3. Click **Reset Database Password**
4. Copy the new password (you won't be able to see it again!)

## Update Your .env File

Once you have your password, edit the `.env` file and replace `[YOUR-PASSWORD]`:

```env
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.qtjnbtvtuivzikeiufua.supabase.co:5432/postgres
```

**Example:**
If your password is `mysecretpass123`, it should look like:
```env
DATABASE_URL=postgresql://postgres:mysecretpass123@db.qtjnbtvtuivzikeiufua.supabase.co:5432/postgres
```

## Next Step: Push Database Schema

After updating the DATABASE_URL with your password, run:

```bash
npx prisma db push
```

This will create the `User` and `Proposal` tables in your Supabase database.

## Verify Setup

Check if everything works:

```bash
# Start the dev server
npm run dev

# Visit http://localhost:3000/api/health
# You should see: {"status":"healthy","database":"connected"}
```

## Current Environment Variables

✅ **NEXT_PUBLIC_SUPABASE_URL**: `https://qtjnbtvtuivzikeiufua.supabase.co`  
✅ **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Set  
⚠️ **DATABASE_URL**: Needs password  

**Project:** Village Supplier Proposals  
**Region:** EU Central (Frankfurt)  
**Database:** PostgreSQL 17.6.1  
**Status:** Active & Healthy

