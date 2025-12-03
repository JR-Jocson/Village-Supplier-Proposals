# Project Structure

## Overview

This document provides a detailed overview of the Village Supplier Proposals project structure and organization.

## Directory Structure

```
Village-Supplier-Proposals/
│
├── app/                          # Next.js App Router directory
│   ├── api/                      # API routes
│   │   └── health/              # Health check endpoint
│   │       └── route.ts         # GET /api/health
│   ├── globals.css              # Global styles with Tailwind directives
│   ├── layout.tsx               # Root layout component
│   └── page.tsx                 # Home page component
│
├── components/                   # React components
│   └── ui/                      # Reusable UI components
│       ├── Button.tsx           # Button component with variants
│       ├── Card.tsx             # Card components (Card, CardHeader, etc.)
│       └── index.ts             # UI components barrel export
│
├── lib/                         # Utility libraries and configurations
│   ├── prisma.ts                # Prisma client singleton
│   └── supabase.ts              # Supabase client configuration
│
├── prisma/                      # Prisma ORM files
│   └── schema.prisma            # Database schema definition
│
├── public/                      # Static assets (images, fonts, etc.)
│
├── node_modules/                # Dependencies (generated)
│
├── .eslintrc.json              # ESLint configuration
├── .gitignore                  # Git ignore rules
├── env-example.txt             # Environment variables template
├── next-env.d.ts               # Next.js TypeScript declarations (generated)
├── next.config.ts              # Next.js configuration
├── package.json                # Project dependencies and scripts
├── package-lock.json           # Dependency lock file
├── postcss.config.mjs          # PostCSS configuration
├── PROJECT_STRUCTURE.md        # This file
├── QUICKSTART.md               # Quick start guide
├── README.md                   # Main documentation
├── tailwind.config.ts          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

## Key Files Explained

### Configuration Files

#### `next.config.ts`
Next.js configuration file. Add custom webpack config, redirects, rewrites, etc.

#### `tailwind.config.ts`
Tailwind CSS configuration. Customize theme, colors, breakpoints, and plugins.

#### `tsconfig.json`
TypeScript compiler configuration. Defines paths, strict mode, and compiler options.

#### `prisma/schema.prisma`
Database schema definition using Prisma ORM. Defines models, relations, and database connection.

#### `.eslintrc.json`
ESLint configuration for code quality and consistency.

### Application Files

#### `app/layout.tsx`
Root layout component that wraps all pages. Contains:
- HTML structure
- Global metadata
- Common UI elements (headers, footers)

#### `app/page.tsx`
Home page component. This is the entry point of your application at `/`.

#### `app/globals.css`
Global CSS file with Tailwind directives:
- `@tailwind base` - Tailwind's base styles
- `@tailwind components` - Tailwind's component classes
- `@tailwind utilities` - Tailwind's utility classes
- Custom CSS variables and global styles

### Library Files

#### `lib/prisma.ts`
Prisma Client singleton pattern to prevent multiple instances in development.

#### `lib/supabase.ts`
Supabase client configuration for database and auth operations.

### Component Files

#### `components/ui/Button.tsx`
Reusable button component with:
- Multiple variants (primary, secondary, outline)
- Size options (sm, md, lg)
- Full TypeScript support

#### `components/ui/Card.tsx`
Card component system with:
- `Card` - Main container
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardContent` - Content section

## Database Schema

### Current Models

```prisma
User
  - id: String (UUID)
  - email: String (unique)
  - name: String (optional)
  - createdAt: DateTime
  - updatedAt: DateTime
  - proposals: Proposal[]

Proposal
  - id: String (UUID)
  - title: String
  - description: String (optional)
  - status: String (default: "draft")
  - userId: String (foreign key)
  - user: User (relation)
  - createdAt: DateTime
  - updatedAt: DateTime
```

## Environment Variables

Required environment variables (see `env-example.txt`):

```env
NEXT_PUBLIC_SUPABASE_URL         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY    # Supabase anonymous key
DATABASE_URL                      # PostgreSQL connection string
```

## API Routes

### `/api/health`
- **Method**: GET
- **Purpose**: Health check endpoint
- **Response**: Server and database status
- **Usage**: Monitoring and debugging

## Development Workflow

### 1. Making Schema Changes

```bash
# Edit prisma/schema.prisma
# Then push changes:
npx prisma db push

# Or create a migration:
npx prisma migrate dev --name your_migration_name
```

### 2. Creating New Pages

Create a new folder in `app/` with a `page.tsx` file:

```
app/
  └── proposals/
      └── page.tsx      # Accessible at /proposals
```

### 3. Creating New API Routes

Create a `route.ts` file in `app/api/`:

```
app/
  └── api/
      └── proposals/
          └── route.ts   # Accessible at /api/proposals
```

### 4. Adding Components

Create components in `components/` directory:

```
components/
  └── ProposalCard.tsx
```

Import and use:

```typescript
import ProposalCard from '@/components/ProposalCard';
```

## Best Practices

### 1. File Organization
- Keep related files together
- Use barrel exports (`index.ts`) for cleaner imports
- Separate concerns (components, lib, app)

### 2. TypeScript
- Always type your props and functions
- Use interfaces for complex types
- Leverage TypeScript's inference when possible

### 3. Styling
- Prefer Tailwind utility classes
- Use consistent spacing and color schemes
- Create reusable component styles

### 4. Database
- Always use Prisma Client for type safety
- Create migrations for production changes
- Use `db push` only for development

### 5. API Routes
- Handle errors gracefully
- Return appropriate HTTP status codes
- Validate input data

## Extending the Project

### Adding Authentication

1. Use Supabase Auth:
```typescript
// lib/auth.ts
import { supabase } from './supabase';

export async function signUp(email: string, password: string) {
  return await supabase.auth.signUp({ email, password });
}
```

### Adding Real-time Features

1. Use Supabase Realtime:
```typescript
const channel = supabase
  .channel('proposals')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'Proposal' },
    (payload) => console.log(payload)
  )
  .subscribe();
```

### Adding File Storage

1. Use Supabase Storage:
```typescript
const { data, error } = await supabase
  .storage
  .from('bucket-name')
  .upload('file-path', file);
```

## Troubleshooting

### Common Issues

1. **Prisma Client not found**
   - Run `npx prisma generate`

2. **Database connection fails**
   - Check `DATABASE_URL` in `.env`
   - Ensure Supabase project is active

3. **Build errors**
   - Clear `.next` folder
   - Run `npm run build`

4. **TypeScript errors**
   - Check `tsconfig.json`
   - Ensure types are installed

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

