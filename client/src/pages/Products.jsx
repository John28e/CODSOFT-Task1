import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (category !== "all") {
          queryParams.append("category", category);
        }
        if (search.trim()) {
          queryParams.append("search", search.trim());
        }
        const response = await api.get(`/products?${queryParams.toString()}`);
        setProducts(response.data.products || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [category, search]);

  const categories = [
    { label: "All", value: "all" },
    { label: "Tops", value: "tops" },
    { label: "Bottoms", value: "bottoms" },
    { label: "Outerwear", value: "outerwear" },
    { label: "Accessories", value: "accessories" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-fg-muted text-xs uppercase tracking-[0.2em] mb-2">
            Catalog
          </p>
          <h1 className="font-heading text-2xl md:text-3xl uppercase tracking-tight text-fg">
            ALL PRODUCTS
          </h1>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <input
            type="text"
            placeholder="SEARCH CATALOG..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-b border-edge py-1.5 text-xs text-fg uppercase tracking-[0.15em] focus:border-accent focus:outline-none transition-colors w-full sm:w-48"
          />

          <div className="flex gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`text-xs uppercase tracking-[0.15em] pb-1 cursor-pointer transition-colors ${
                  category === cat.value
                    ? "text-accent border-b border-accent"
                    : "text-fg-muted hover:text-fg"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product grid or empty state */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
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
      ) : products.length === 0 ? (
        <div className="border border-edge rounded-sm py-24 text-center">
          <p className="font-heading text-xl uppercase text-fg mb-2">
            COMING SOON.
          </p>
          <p className="text-fg-muted text-sm max-w-sm mx-auto">
            The catalog&rsquo;s loading up. Check back when the drop hits.
          </p>
          <button
            onClick={() => {
              setCategory("all");
              setSearch("");
            }}
            className="inline-block text-xs uppercase tracking-[0.15em] text-accent hover:underline mt-6 cursor-pointer"
          >
            ← Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
          {products.map((product) => (
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
  );
}
