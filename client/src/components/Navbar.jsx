import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `text-xs uppercase tracking-[0.15em] transition-colors duration-150 ${
      isActive ? "text-accent" : "text-fg-secondary hover:text-fg"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-base border-b border-edge">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="font-heading text-lg text-fg uppercase tracking-wider"
        >
          STORR
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/products" className={linkClass}>
            Shop
          </NavLink>
          <NavLink to="/support" className={linkClass}>
            Support
          </NavLink>
          <NavLink to="/cart" className={linkClass}>
            <span className="relative">
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2.5 -right-5 bg-accent text-accent-contrast text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                  {cartCount}
                </span>
              )}
            </span>
          </NavLink>
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-xs uppercase tracking-[0.15em] text-fg-secondary border-r border-edge pr-4">
                Hi, {user?.name?.split(" ")[0]}
              </span>
              <button
                onClick={logout}
                className="text-xs uppercase tracking-[0.15em] text-fg-secondary hover:text-danger cursor-pointer transition-colors duration-150"
              >
                Logout
              </button>
            </div>
          ) : (
            <NavLink to="/login" className={linkClass}>
              Account
            </NavLink>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col justify-center gap-[5px] w-6 h-6 cursor-pointer"
          aria-label="Toggle menu"
        >
          <span
            className={`block h-[1.5px] w-full bg-fg transition-all duration-200 origin-center ${
              open ? "rotate-45 translate-y-[6.5px]" : ""
            }`}
          />
          <span
            className={`block h-[1.5px] w-full bg-fg transition-opacity duration-200 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-[1.5px] w-full bg-fg transition-all duration-200 origin-center ${
              open ? "-rotate-45 -translate-y-[6.5px]" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden border-t border-edge overflow-hidden transition-all duration-200 ${
          open ? "max-h-60" : "max-h-0"
        }`}
      >
        <div className="px-4 py-6 flex flex-col gap-4 bg-base">
          <NavLink
            to="/products"
            className={linkClass}
            onClick={() => setOpen(false)}
          >
            Shop
          </NavLink>
          <NavLink
            to="/support"
            className={linkClass}
            onClick={() => setOpen(false)}
          >
            Support
          </NavLink>
          <NavLink
            to="/cart"
            className={linkClass}
            onClick={() => setOpen(false)}
          >
            Cart {cartCount > 0 && `(${cartCount})`}
          </NavLink>
          {isAuthenticated ? (
            <div className="flex flex-col gap-4 border-t border-edge pt-4 mt-2">
              <span className="text-xs uppercase tracking-[0.15em] text-fg-secondary">
                Hi, {user?.name}
              </span>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="text-left text-xs uppercase tracking-[0.15em] text-danger cursor-pointer transition-colors duration-150"
              >
                Logout
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              Account
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
