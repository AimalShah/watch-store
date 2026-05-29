import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, Truck, MessageCircle, Camera, ArrowRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  categories: { name: string; slug: string } | null;
}

interface CollectionItem {
  name: string;
  slug: string;
  image: string;
}

const whyItems = [
  {
    icon: ShieldCheck,
    title: 'Authenticity Guaranteed',
    description: 'Every watch is 100% authentic, sourced directly from authorized distributors.',
  },
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Complimentary shipping across Pakistan with insured packaging.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Support',
    description: 'Chat directly with us for personalized assistance and order updates.',
  },
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
  const featuredRef = useRef<HTMLDivElement>(null);
  const whyRef = useRef<HTMLDivElement>(null);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);

  useEffect(() => {
    let lenis: InstanceType<typeof import('lenis').default> | null = null;
    let ctx: import('gsap').gsap | null = null;

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

      const featuredEl = featuredRef.current;
      if (featuredEl) {
        gsap.fromTo(
          featuredEl.querySelectorAll('.featured-card'),
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: featuredEl, start: 'top 80%' } }
        );
      }

      const whyEl = whyRef.current;
      if (whyEl) {
        gsap.fromTo(
          whyEl.querySelectorAll('.why-card'),
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power2.out', scrollTrigger: { trigger: whyEl, start: 'top 80%' } }
        );
      }
    }

    init();

    fetch('/api/products?featured=true&limit=8')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      })
      .then((json) => {
        const data = json.data || json;
        setFeatured(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setFeatured([]);
        setLoading(false);
      });

    fetch('/api/categories')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      })
      .then(async (json) => {
        const categories = Array.isArray(json) ? json : json.data || [];
        const results: CollectionItem[] = [];

        for (const cat of categories) {
          try {
            const res = await fetch(`/api/products?category=${cat.slug}&limit=1`);
            if (res.ok) {
              const productJson = await res.json();
              const products = Array.isArray(productJson) ? productJson : productJson.data || [];
              const firstProduct = products[0];
              results.push({
                name: cat.name,
                slug: cat.slug,
                image: firstProduct?.images?.[0] || '',
              });
            } else {
              results.push({ name: cat.name, slug: cat.slug, image: '' });
            }
          } catch {
            results.push({ name: cat.name, slug: cat.slug, image: '' });
          }
        }

        setCollections(results);
        setCollectionsLoading(false);
      })
      .catch(() => {
        setCollections([]);
        setCollectionsLoading(false);
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
      {/* Hero */}
      <section ref={heroRef} className="relative flex min-h-[90vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=1600&q=80"
            alt="Luxury watch on wrist"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>
        <div className="relative z-10 flex w-full max-w-7xl px-4" ref={heroContentRef}>
          <div className="flex-1 space-y-4">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-secondary">
              AZ WATCH HUB
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
        </div>
      </section>

      {/* Featured Watches */}
      <section ref={featuredRef} className="py-24">
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
          ) : featured.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No featured products available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {featured.map((p) => (
                <a key={p.id} href={`/watch/${p.slug}`} className="group featured-card">
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
                        Rs{Number(p.price).toLocaleString()}
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

      {/* Our Collections */}
      {collections.length > 0 || collectionsLoading ? (
      <section className="border-t py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-secondary">
              Brands
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Our Collections
            </h2>
          </div>

          {collectionsLoading ? (
            <div className="grid gap-8 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-xl border bg-card">
                  <div className="aspect-[4/3] animate-pulse bg-muted" />
                  <div className="space-y-2 p-5">
                    <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-40 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {collections.map((brand) => (
              <a
                key={brand.slug}
                href={`/watches?category=${brand.slug}`}
                className="group block overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  {brand.image ? (
                    <img
                      src={brand.image}
                      alt={brand.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted" />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-heading text-xl font-semibold">{brand.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Browse our {brand.name} collection</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-secondary transition-colors group-hover:underline">
                    Browse {brand.name} <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </a>
            ))}
          </div>
          )}
        </div>
      </section>
      ) : null}

      {/* Why Shop With Us */}
      <section ref={whyRef} className="border-t bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-secondary">
              Why Choose Us
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Why Shop With Us
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {whyItems.map((item) => (
              <div key={item.title} className="why-card text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10">
                  <item.icon className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Bar */}
      <section className="border-t py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-md">
            <Camera className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
            <h2 className="font-heading text-2xl font-bold tracking-tight">Follow Us on Facebook</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Stay updated with our latest arrivals and exclusive offers
            </p>
            <Button asChild variant="outline" className="mt-6 rounded-none px-8">
              <a href="https://www.facebook.com/share/1H3rLMsHrZ/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
                <Camera className="mr-2 h-4 w-4" /> Follow @25store
              </a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
