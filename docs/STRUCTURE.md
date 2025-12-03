# 📁 Project Structure

```
Village-Supplier-Proposals/
├── 📂 app/                      # Next.js App Router
│   ├── api/                     # API routes
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
│
├── 📂 components/               # React components
│   └── ui/                      # Reusable UI components
│
├── 📂 docs/                     # 📚 Documentation (all guides here!)
│   ├── README.md                # Documentation index
│   ├── QUICKSTART.md            # Quick start guide
│   ├── SETUP_COMPLETE.md        # Setup overview
│   ├── PROJECT_STRUCTURE.md     # Detailed structure
│   ├── CONNECTION_TEST_RESULTS.md
│   ├── ENV_SETUP_STATUS.md
│   ├── GET_DATABASE_PASSWORD.md
│   ├── SECURITY_ADVISORIES.md
│   └── env-example.txt          # Environment template
│
├── 📂 lib/                      # Utility libraries
│   ├── prisma.ts                # Prisma client
│   └── supabase.ts              # Supabase client
│
├── 📂 prisma/                   # Database schema
│   └── schema.prisma            # Prisma schema
│
├── 📂 types/                    # TypeScript types
│   └── supabase.ts              # Supabase types
│
├── 📂 public/                   # Static assets
│
├── 📄 README.md                 # Main project README
├── 📄 package.json              # Dependencies
├── 📄 tsconfig.json             # TypeScript config
├── 📄 next.config.ts            # Next.js config
├── 📄 tailwind.config.ts        # Tailwind config
├── 📄 .env                      # Environment variables (not in git)
└── 📄 env-example.txt           # Environment template
```

## Clean Root Directory ✨

The root directory now only contains essential configuration files and the main README.

All documentation has been moved to the `docs/` folder for better organization!
