# Quick Start Guide

This guide will get you up and running quickly with your Village Supplier Proposals application.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (create one at [supabase.com](https://supabase.com))

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [app.supabase.com](https://app.supabase.com)
2. Create a new project or select an existing one
3. Wait for the project to be fully initialized

### 3. Get Your Supabase Credentials

**API Credentials:**
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the **URL** (looks like: `https://xxxxx.supabase.co`)
3. Copy the **anon/public** key

**Database URL:**
1. In your Supabase dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection String**
3. Select **URI** mode
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your actual database password

### 4. Configure Environment Variables

Copy `env-example.txt` to `.env`:

```bash
cp env-example.txt .env
```

Edit `.env` and replace the placeholder values with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres
```

### 5. Initialize the Database

Push the Prisma schema to your Supabase database:

```bash
npx prisma db push
```

This will create the `User` and `Proposal` tables in your database.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Verify Everything Works

- Visit [http://localhost:3000/api/health](http://localhost:3000/api/health) to check the database connection
- You should see: `{"status":"healthy","timestamp":"...","database":"connected"}`

## Next Steps

### View Your Database

Open Prisma Studio to view and edit your database:

```bash
npx prisma studio
```

This will open a web interface at [http://localhost:5555](http://localhost:5555)

### Modify the Schema

1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push` to apply changes
3. Prisma Client will be automatically regenerated

### Create Your First API Route

Create a new file in `app/api/proposals/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const proposals = await prisma.proposal.findMany({
      include: {
        user: true,
      },
    });
    return NextResponse.json(proposals);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch proposals' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const proposal = await prisma.proposal.create({
      data: body,
    });
    return NextResponse.json(proposal);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create proposal' },
      { status: 500 }
    );
  }
}
```

## Troubleshooting

### Database Connection Fails

- Make sure your DATABASE_URL is correct
- Check that your database password is properly set
- Verify your Supabase project is active

### Prisma Generate Errors

Run:
```bash
npm run postinstall
```

### Build Errors

Clear Next.js cache:
```bash
rm -rf .next
npm run build
```

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npx prisma studio        # Open database GUI
npx prisma db push       # Push schema changes
npx prisma migrate dev   # Create migration
npx prisma generate      # Regenerate Prisma Client

# Code Quality
npm run lint             # Run ESLint
```

## Learn More

- [Full README](./README.md) - Detailed documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

