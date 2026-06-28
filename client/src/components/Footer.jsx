import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-edge bg-base">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="font-heading text-lg text-fg uppercase tracking-wider"
            >
              STORR
            </Link>
            <p className="text-fg-muted text-sm mt-3 max-w-xs">
              Curated drops. Limited runs. Pieces that hit different.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.15em] text-fg-secondary mb-4">
              Shop
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products"
                  className="text-sm text-fg-muted hover:text-fg transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-sm text-fg-muted hover:text-fg transition-colors"
                >
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.15em] text-fg-secondary mb-4">
              Account
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/login"
                  className="text-sm text-fg-muted hover:text-fg transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-sm text-fg-muted hover:text-fg transition-colors"
                >
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-edge mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-fg-muted text-xs uppercase tracking-wider">
            &copy; {new Date().getFullYear()} Storr. All rights reserved.
          </p>
          <p className="text-fg-muted text-xs">
            Built with intent.
          </p>
        </div>
      </div>
    </footer>
  );
}
