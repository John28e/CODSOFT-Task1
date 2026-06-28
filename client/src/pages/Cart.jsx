import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Button from "../components/Button";

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const shipping = subtotal > 150 ? 0 : subtotal > 0 ? 15 : 0;
  const total = subtotal + shipping;

  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-heading text-2xl md:text-3xl uppercase tracking-tight text-fg mb-10">
        YOUR CART
      </h1>

      {cartItems.length === 0 ? (
        /* ── Empty state ── */
        <div className="text-center py-24 border border-edge rounded-sm">
          <p className="font-heading text-xl uppercase text-fg mb-2">
            EMPTY.
          </p>
          <p className="text-fg-muted text-sm mb-8">
            Your cart&rsquo;s collecting dust. Go fix that.
          </p>
          <Link to="/products">
            <Button variant="secondary">BROWSE PRODUCTS</Button>
          </Link>
        </div>
      ) : (
        /* ── Cart items + summary ── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, idx) => {
              const product = item.product;
              if (!product) return null;
              
              const imgUrl = product.images?.[0] || "";
              const price = product.price || 0;
              const name = product.name || "Product";
              
              return (
                <div
                  key={`${product._id}-${item.size}-${idx}`}
                  className="flex gap-4 border border-edge rounded-sm p-4 bg-surface/50"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-24 bg-surface shrink-0 border border-edge rounded-sm overflow-hidden">
                    {imgUrl && (
                      <img
                        src={imgUrl}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          to={`/products/${product._id}`}
                          className="font-heading text-sm uppercase tracking-tight text-fg hover:text-accent transition-colors truncate max-w-[200px]"
                        >
                          {name}
                        </Link>
                        <span className="font-mono text-sm text-fg font-bold">
                          ${(price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-fg-secondary text-xs uppercase tracking-wider mt-1">
                        Size: {item.size}
                      </p>
                    </div>

                    {/* Quantity controls & Remove */}
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(product._id, item.size, item.quantity - 1)
                          }
                          className="w-6 h-6 border border-edge text-fg flex items-center justify-center hover:border-fg text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-mono text-xs">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            const sizeObj = product.sizes?.find((s) => s.size === item.size);
                            const maxStock = sizeObj ? sizeObj.stock : 99;
                            if (item.quantity < maxStock) {
                              updateQuantity(product._id, item.size, item.quantity + 1);
                            }
                          }}
                          className="w-6 h-6 border border-edge text-fg flex items-center justify-center hover:border-fg text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(product._id, item.size)}
                        className="text-xs uppercase tracking-wider text-fg-muted hover:text-danger cursor-pointer transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order summary */}
          <div className="border border-edge rounded-sm p-6 h-fit bg-surface/50">
            <h2 className="font-heading text-sm uppercase tracking-wider text-fg mb-6">
              ORDER SUMMARY
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-fg-secondary">
                <span>Subtotal</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-fg-secondary">
                <span>Shipping</span>
                <span className="font-mono">
                  {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-[10px] text-fg-muted">
                  Spend ${(150 - subtotal).toFixed(2)} more for free shipping.
                </p>
              )}
              <div className="border-t border-edge pt-3 flex justify-between text-fg font-bold">
                <span>Total</span>
                <span className="font-mono">${total.toFixed(2)}</span>
              </div>
            </div>
            <Link to="/checkout" className="block mt-6">
              <Button className="w-full cursor-pointer">CHECKOUT</Button>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
