import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import api from "../services/api";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.get("/products?featured=true");
        setFeaturedProducts(response.data.products?.slice(0, 4) || []);
      } catch (err) {
        console.error("Error fetching featured products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex flex-col justify-end px-4 pb-16 md:pb-24 overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="/videos/hero-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60 z-10" />

        <div className="max-w-7xl mx-auto w-full z-20 relative">
          <span className="inline-block bg-accent text-accent-contrast text-xs font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-sm mb-6">
            Season 01
          </span>
          <h1 className="font-heading text-[clamp(2.5rem,10vw,7rem)] uppercase leading-[0.9] tracking-tighter text-fg">
            DON&rsquo;T
            <br />
            BLEND IN.
          </h1>
          <p className="text-fg-secondary text-base md:text-lg max-w-md mt-6">
            Curated drops. Limited runs. Pieces that hit different.
          </p>
          <div className="mt-8">
            <Link to="/products">
              <Button size="lg">SHOP THE DROP</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Marquee ticker ── */}
      <div className="border-y border-edge py-3 overflow-hidden">
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="text-fg-muted text-xs uppercase tracking-[0.3em] shrink-0"
            >
              FREE SHIPPING OVER $150 &nbsp;★&nbsp; NEW DROPS EVERY FRIDAY
              &nbsp;★&nbsp; LIMITED STOCK &nbsp;★
            </span>
          ))}
        </div>
      </div>

      {/* ── Latest drops (real products synced from backend) ── */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading text-xl uppercase tracking-tight text-fg">
            LATEST DROPS
          </h2>
          <Link
            to="/products"
            className="text-xs uppercase tracking-[0.15em] text-fg-secondary hover:text-accent transition-colors duration-150"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="group border border-edge rounded-sm overflow-hidden animate-pulse"
              >
                <div className="aspect-[3/4] bg-surface" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-3/4 bg-elevated rounded-sm" />
                  <div className="h-3 w-1/3 bg-elevated rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {featuredProducts.map((product) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="group border border-edge rounded-sm overflow-hidden hover:border-edge-strong transition-colors duration-150 block"
              >
                <div className="aspect-[3/4] bg-surface overflow-hidden relative">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-heading text-xs uppercase tracking-tight text-fg truncate">
                    {product.name}
                  </h3>
                  <p className="text-fg-secondary text-xs mt-1 font-mono">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Brand statement ── */}
      <section className="relative border-t border-edge overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/videos/3.mp4" type="video/mp4" />
        </video>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60 z-10" />

        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32 text-center z-20">
          <p className="font-heading text-2xl md:text-3xl uppercase tracking-tight text-fg leading-tight max-w-3xl mx-auto">
            WEAR WHAT THEY
            <br />
            CAN&rsquo;T IGNORE.
          </p>
        </div>
      </section>
    </>
  );
}
