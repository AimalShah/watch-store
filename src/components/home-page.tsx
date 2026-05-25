import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  categories: { name: string; slug: string } | null;
}

export function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const whyRef = useRef<HTMLDivElement>(null);
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const hero = heroRef.current;
    const heroContent = heroContentRef.current;
    const cards = cardsRef.current;
    const why = whyRef.current;

    if (heroContent) {
      gsap.fromTo(
        heroContent.children,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power2.out' }
      );
    }

    if (cards) {
      const cardEls = cards.querySelectorAll('.featured-card');
      ScrollTrigger.create({
        trigger: cards,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(cardEls, {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
          });
        },
        once: true,
      });
    }

    if (why) {
      const items = why.querySelectorAll('.why-item');
      ScrollTrigger.create({
        trigger: why,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(items, {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.15,
            ease: 'power2.out',
          });
        },
        once: true,
      });
    }

    fetch('/api/products?featured=true&limit=8')
      .then((r) => r.json())
      .then((json) => setFeatured(json.data || json))
      .catch(() => {});

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <main>
      <section className="home-hero" ref={heroRef}>
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content" ref={heroContentRef}>
          <h1 className="display-lg hero-title">Timeless Elegance</h1>
          <p className="body-lg hero-subtitle">
            Discover our curated collection of premium timepieces
          </p>
          <a href="/watches" className="hero-cta">Explore Collection</a>
        </div>
      </section>

      <section className="home-section">
        <div className="section-inner">
          <h2 className="headline-lg section-title">Featured Watches</h2>
          <div className="featured-grid" ref={cardsRef}>
            {featured.length === 0 && (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="featured-card" style={{ y: 40, opacity: 0 }}>
                    <div className="card-img placeholder" />
                    <div className="card-meta">
                      <span className="label-sm">Category</span>
                      <h3 className="headline-md">Watch Name</h3>
                      <span className="price-display">$0</span>
                    </div>
                  </div>
                ))}
              </>
            )}
            {featured.map((p) => (
              <a key={p.id} href={`/watch/${p.slug}`} className="featured-card" style={{ y: 40, opacity: 0 }}>
                <div className="card-img">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} loading="lazy" />
                  ) : (
                    <div className="card-img placeholder" />
                  )}
                </div>
                <div className="card-meta">
                  <span className="label-sm">{p.categories?.name ?? ''}</span>
                  <h3 className="headline-md">{p.name}</h3>
                  <span className="price-display">${Number(p.price).toLocaleString()}</span>
                </div>
              </a>
            ))}
          </div>
          <div className="view-all-wrap">
            <a href="/watches" className="view-all">View All Watches</a>
          </div>
        </div>
      </section>

      <section className="home-section why-section">
        <div className="section-inner" ref={whyRef}>
          <h2 className="headline-lg section-title">Why Shop With Us</h2>
          <div className="why-grid">
            <div className="why-item" style={{ y: 30, opacity: 0 }}>
              <div className="why-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="headline-md">Authentic Products</h3>
              <p className="body-md">Every watch is verified for authenticity and quality.</p>
            </div>
            <div className="why-item" style={{ y: 30, opacity: 0 }}>
              <div className="why-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              </div>
              <h3 className="headline-md">Best Prices</h3>
              <p className="body-md">Competitive pricing on all our premium timepieces.</p>
            </div>
            <div className="why-item" style={{ y: 30, opacity: 0 }}>
              <div className="why-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <h3 className="headline-md">Easy Ordering</h3>
              <p className="body-md">Browse, order, and pay through WhatsApp in minutes.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section social-section">
        <div className="section-inner">
          <p className="body-lg">Follow us on Instagram</p>
          <a href="#" className="social-link label-sm">@anfalwatches</a>
        </div>
      </section>
    </main>
  );
}
