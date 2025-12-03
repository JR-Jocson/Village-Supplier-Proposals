import { Header, Hero, Features, HowItWorks, Stats, CTA, Footer } from '@/components/landing';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <Stats />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

