# Village Supplier Proposals - מערכת הצעות פרויקטים לכפרים

A modern bilingual (Hebrew/English) web application for managing village project proposals to local municipalities. Built with Next.js 15, Tailwind CSS, Supabase PostgreSQL, and Prisma ORM.

## 🌟 Key Highlights

- **🌐 Bilingual Support**: Hebrew (RTL) primary, English (LTR) secondary
- **🎨 Modern UI**: Beautiful, responsive design with dark mode
- **⚡ Performance**: Built with Next.js 15 and React Server Components
- **🔒 Type-Safe**: Full TypeScript with Prisma integration
- **📱 Mobile-First**: Fully responsive across all devices

## Tech Stack

- **Frontend Framework**: Next.js 15 (App Router)
- **Internationalization**: next-intl
- **Styling**: Tailwind CSS
- **Database**: Supabase PostgreSQL
- **ORM**: Prisma
- **Language**: TypeScript
- **Languages Supported**: Hebrew (עברית), English

## 📚 Documentation

Detailed documentation is available in the [`docs/`](./docs) folder:

- **[Quick Start Guide](./docs/QUICKSTART.md)** - Get started in 5 minutes
- **[Landing Page Guide](./docs/LANDING_PAGE.md)** - Landing page components and customization
- **[Project Structure](./docs/PROJECT_STRUCTURE.md)** - Understand the codebase
- **[Setup Status](./docs/SETUP_COMPLETE.md)** - What's already configured
- **[Security Advisories](./docs/SECURITY_ADVISORIES.md)** - Important security info

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JR-Jocson/Village-Supplier-Proposals.git
   cd Village-Supplier-Proposals
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory with the following variables:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

   # Database URL for Prisma (from Supabase)
   # Format: postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   DATABASE_URL=your-database-url
   ```

   **To get your Supabase credentials:**
   - Go to your [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Go to Settings → API
   - Copy the `URL` and `anon/public` key
   - Go to Settings → Database
   - Copy the connection string (make sure to replace `[YOUR-PASSWORD]` with your actual database password)

4. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

5. **Push the database schema to Supabase**
   ```bash
   npx prisma db push
   ```

   Or if you prefer using migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.
   - Hebrew (default): [http://localhost:3000/he](http://localhost:3000/he)
   - English: [http://localhost:3000/en](http://localhost:3000/en)

## Project Structure

```
Village-Supplier-Proposals/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── health/        # Health check endpoint
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/                   # Utility libraries
│   ├── prisma.ts          # Prisma client singleton
│   └── supabase.ts        # Supabase client
├── prisma/                # Prisma schema and migrations
│   └── schema.prisma      # Database schema
├── public/                # Static assets
├── .gitignore             # Git ignore rules
├── next.config.ts         # Next.js configuration
├── package.json           # Dependencies and scripts
├── postcss.config.mjs     # PostCSS configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## Database Schema

The initial schema includes two example models:

- **User**: Stores user information
- **Proposal**: Stores supplier proposals linked to users

You can modify the schema in `prisma/schema.prisma` to fit your needs.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production application
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code linting
- `npx prisma studio` - Open Prisma Studio to view/edit your database
- `npx prisma migrate dev` - Create and apply migrations
- `npx prisma db push` - Push schema changes to the database (for prototyping)
- `npx prisma generate` - Generate Prisma Client

## Key Features

### Prisma Integration
- Type-safe database queries
- Automatic migrations
- Built-in connection pooling
- Schema management

### Supabase Integration
- PostgreSQL database
- Real-time capabilities (optional)
- Authentication ready (optional)
- File storage (optional)

### Tailwind CSS
- Utility-first CSS framework
- Dark mode support
- Responsive design
- Custom configuration

## API Routes

### Health Check
- **Endpoint**: `/api/health`
- **Method**: GET
- **Description**: Checks the health of the application and database connection

## Customization

### Updating the Database Schema

1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push` (for development) or `npx prisma migrate dev --name your_migration_name` (for production)
3. The Prisma Client will be automatically regenerated

### Adding New Pages

Create new files in the `app` directory following the [Next.js App Router conventions](https://nextjs.org/docs/app).

### Styling

Global styles are in `app/globals.css`. Tailwind configuration is in `tailwind.config.ts`.

## Deployment

### Vercel (Recommended for Next.js)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add your environment variables in the Vercel dashboard
4. Deploy!

### Other Platforms

This application can be deployed to any platform that supports Node.js:
- Netlify
- AWS Amplify
- Railway
- Render
- etc.

Make sure to set the environment variables and run the build command: `npm run build`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)

