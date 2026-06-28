import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import api from "../services/api";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedMessage, setAddedMessage] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
        // Pre-select first size that has stock
        const availableSize = response.data.product.sizes.find((s) => s.stock > 0);
        if (availableSize) {
          setSelectedSize(availableSize.size);
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    addToCart(product, selectedSize, quantity);
    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    addToCart(product, selectedSize, quantity);
    navigate("/cart");
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
        <div className="text-xs uppercase tracking-[0.15em] text-fg-muted animate-pulse">
          Loading drop details...
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="font-heading text-xl uppercase text-fg mb-4">
          DROP NOT FOUND.
        </p>
        <p className="text-fg-muted text-sm mb-6">
          {error || "We couldn't find the product you're looking for."}
        </p>
        <Link
          to="/products"
          className="inline-block text-xs uppercase tracking-[0.15em] text-accent hover:underline"
        >
          ← Back to Catalog
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-xs uppercase tracking-[0.15em]">
        <Link
          to="/products"
          className="text-fg-muted hover:text-fg transition-colors"
        >
          Shop
        </Link>
        <span className="text-fg-muted">/</span>
        <span className="text-fg-secondary">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Product Image */}
        <div className="aspect-[3/4] bg-surface border border-edge rounded-sm overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center">
          <span className="text-accent text-xs font-bold uppercase tracking-[0.2em] mb-3">
            {product.category}
          </span>
          <h1 className="font-heading text-2xl md:text-3xl uppercase tracking-tight text-fg mb-4">
            {product.name}
          </h1>
          <p className="text-fg-secondary text-sm leading-relaxed mb-6 max-w-md">
            {product.description}
          </p>

          {/* Price */}
          <p className="text-fg text-2xl font-bold font-mono mb-8">
            ${product.price.toFixed(2)}
          </p>

          {/* Size selector */}
          <div className="mb-6">
            <div className="flex justify-between items-center max-w-xs mb-3">
              <span className="text-xs uppercase tracking-[0.15em] text-fg-secondary">
                Size
              </span>
              {selectedSize && (
                <span className="text-xs text-fg-muted font-mono">
                  Stock: {product.sizes.find((s) => s.size === selectedSize)?.stock || 0} left
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {product.sizes.map((s) => {
                const isOutOfStock = s.stock <= 0;
                return (
                  <button
                    key={s.size}
                    disabled={isOutOfStock}
                    onClick={() => setSelectedSize(s.size)}
                    className={`w-10 h-10 border text-xs uppercase transition-colors duration-150 rounded-sm cursor-pointer ${
                      isOutOfStock
                        ? "border-edge text-fg-muted bg-base line-through opacity-50 cursor-not-allowed"
                        : selectedSize === s.size
                        ? "border-accent text-accent bg-accent/10"
                        : "border-edge text-fg-secondary hover:border-fg hover:text-fg"
                    }`}
                  >
                    {s.size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity selector */}
          <div className="mb-8">
            <span className="text-xs uppercase tracking-[0.15em] text-fg-secondary block mb-3">
              Quantity
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 border border-edge text-fg flex items-center justify-center hover:border-fg cursor-pointer"
              >
                -
              </button>
              <span className="w-8 text-center font-mono text-sm">{quantity}</span>
              <button
                onClick={() => {
                  const maxStock = product.sizes.find((s) => s.size === selectedSize)?.stock || 1;
                  setQuantity((q) => Math.min(maxStock, q + 1));
                }}
                className="w-8 h-8 border border-edge text-fg flex items-center justify-center hover:border-fg cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1 cursor-pointer"
              onClick={handleAddToCart}
              disabled={product.sizes.reduce((acc, s) => acc + s.stock, 0) === 0}
            >
              {product.sizes.reduce((acc, s) => acc + s.stock, 0) === 0
                ? "OUT OF STOCK"
                : "ADD TO CART"}
            </Button>
            <Button
              variant="secondary"
              className="flex-1 cursor-pointer"
              onClick={handleBuyNow}
              disabled={product.sizes.reduce((acc, s) => acc + s.stock, 0) === 0}
            >
              BUY NOW
            </Button>
          </div>

          {addedMessage && (
            <p className="text-success text-xs uppercase tracking-[0.15em] mt-4 animate-fade-in">
              ★ Item added to cart successfully.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
