export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="flex flex-col gap-8 items-center max-w-4xl w-full">
        <h1 className="text-5xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Village Supplier Proposals
        </h1>
        
        <p className="text-xl text-center text-gray-600 dark:text-gray-300">
          A modern Next.js application with Tailwind CSS, Supabase, and Prisma
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-3">Next.js 15</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Built with the latest App Router and React Server Components
            </p>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-3">Tailwind CSS</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Beautiful, responsive design with utility-first CSS
            </p>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-3">Supabase + Prisma</h2>
            <p className="text-gray-600 dark:text-gray-400">
              PostgreSQL database with type-safe ORM
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <a
            href="/api/health"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Check API Health
          </a>
          <a
            href="https://github.com/JR-Jocson/Village-Supplier-Proposals"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </main>
    </div>
  );
}

