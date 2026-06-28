/**
 * Button — sharp corners, bold uppercase, three variants.
 *
 * primary  → accent bg, dark text (CTAs: Add to Cart, Checkout)
 * secondary → 1px border, transparent bg (Browse, Continue Shopping)
 * ghost    → no border, muted text (Cancel, Back)
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center font-heading uppercase tracking-wider font-bold transition-all duration-150 cursor-pointer rounded-sm select-none";

  const variants = {
    primary:
      "bg-accent text-accent-contrast hover:brightness-110 active:scale-[0.98]",
    secondary:
      "border border-edge text-fg hover:border-fg active:scale-[0.98]",
    ghost: "text-fg-secondary hover:text-fg",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
