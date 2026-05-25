import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  categories: { name: string; slug: string } | null;
}

const DEMO_PRODUCTS: Product[] = [
  { id: '1', name: 'Rolex Submariner Date', slug: 'rolex-submariner-date', price: 10500, images: ['https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80'], categories: { name: 'Rolex', slug: 'rolex' } },
  { id: '2', name: 'Omega Speedmaster Moonwatch', slug: 'omega-speedmaster-moonwatch', price: 7200, images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80'], categories: { name: 'Omega', slug: 'omega' } },
  { id: '3', name: 'Tag Heuer Carrera', slug: 'tag-heuer-carrera', price: 5400, images: ['https://images.unsplash.com/photo-1614164185128-e4ec99c2c0e8?w=600&q=80'], categories: { name: 'Tag Heuer', slug: 'tag-heuer' } },
  { id: '4', name: 'Seiko Presage Cocktail Time', slug: 'seiko-presage-cocktail-time', price: 450, images: ['https://images.unsplash.com/photo-1589913278995-82c7ae8fa70f?w=600&q=80'], categories: { name: 'Seiko', slug: 'seiko' } },
  { id: '5', name: 'Rolex Daytona', slug: 'rolex-daytona', price: 28500, images: ['https://images.unsplash.com/photo-1587836374828-4dbafa94cfbe?w=600&q=80'], categories: { name: 'Rolex', slug: 'rolex' } },
  { id: '6', name: 'Omega Seamaster Diver', slug: 'omega-seamaster-diver-300m', price: 5800, images: ['https://images.unsplash.com/photo-1589137279397-1520e0e4e3d9?w=600&q=80'], categories: { name: 'Omega', slug: 'omega' } },
  { id: '7', name: 'Tag Heuer Monaco', slug: 'tag-heuer-monaco', price: 6750, images: ['https://images.unsplash.com/photo-1612036782180-6f08205f232b?w=600&q=80'], categories: { name: 'Tag Heuer', slug: 'tag-heuer' } },
  { id: '8', name: 'Citizen Promaster Diver', slug: 'citizen-promaster-diver', price: 375, images: ['https://images.unsplash.com/photo-1589913278995-82c7ae8fa70f?w=600&q=80'], categories: { name: 'Citizen', slug: 'citizen' } },
];

function SkeletonCard() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square animate-pulse bg-muted" />
      <CardContent className="space-y-2 p-4">
        <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

export function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let lenis: InstanceType<typeof import('lenis').default> | null = null;

    async function init() {
      const Lenis = (await import('lenis')).default;
      const gsap = (await import('gsap')).default;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis();
      function raf(time: number) {
        lenis!.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      const heroContent = heroContentRef.current;
      if (heroContent) {
        gsap.fromTo(
          heroContent.children,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power2.out' }
        );
      }
    }

    init();

    fetch('/api/products?limit=8')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      })
      .then((json) => {
        const data = json.data || json;
        setFeatured(Array.isArray(data) && data.length > 0 ? data : DEMO_PRODUCTS);
        setLoading(false);
      })
      .catch(() => {
        setFeatured(DEMO_PRODUCTS);
        setLoading(false);
      });

    return () => {
      if (lenis) lenis.destroy();
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      });
    };
  }, []);

  return (
    <main>
      <section ref={heroRef} className="relative flex min-h-[90vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1614164185128-e4ec99c2c0e8?w=1920&q=80"
            alt="Luxury watches"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center" ref={heroContentRef}>
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-secondary">
            Since 2024
          </p>
          <h1 className="mb-6 font-heading text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Timeless Elegance
          </h1>
          <p className="mb-8 text-lg text-white/80">
            Discover our curated collection of premium timepieces
          </p>
          <Button asChild size="lg" className="rounded-none border-white/20 bg-white/10 px-10 text-white backdrop-blur-sm hover:bg-white/20">
            <a href="/watches">Explore Collection</a>
          </Button>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-secondary">
              Collection
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Featured Watches
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {featured.map((p) => (
                <a key={p.id} href={`/watch/${p.slug}`} className="group">
                  <Card className="overflow-hidden transition-all duration-300 group-hover:shadow-lg">
                    <div className="aspect-square overflow-hidden bg-muted">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-muted" />
                      )}
                    </div>
                    <CardContent className="space-y-1 p-4">
                      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        {p.categories?.name ?? ''}
                      </p>
                      <h3 className="font-heading text-base font-semibold">{p.name}</h3>
                      <p className="font-heading text-lg font-bold text-secondary">
                        ${Number(p.price).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Button asChild variant="outline" size="lg" className="rounded-none px-10">
              <a href="/watches">View All Watches</a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
