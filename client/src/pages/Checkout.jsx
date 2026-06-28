import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Initialize Stripe Promise outside component rendering
console.log("Stripe key check:", import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.slice(0, 12));
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

function CheckoutForm({ clientSecret, orderSuccess, setOrderSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const { cartItems, clearCart } = useCart();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const shipping = subtotal > 150 ? 0 : subtotal > 0 ? 15 : 0;
  const total = subtotal + shipping;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = "First name is required.";
    if (!form.lastName.trim()) next.lastName = "Last name is required.";
    if (!form.address.trim()) next.address = "Address is required.";
    if (!form.city.trim()) next.city = "City is required.";
    if (!form.state.trim()) next.state = "State is required.";
    if (!form.zipCode.trim()) next.zipCode = "Zip code is required.";
    if (!form.phone.trim()) next.phone = "Phone number is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!stripe || !elements) {
      setPaymentError("Payment service is loading. Please try again.");
      return;
    }

    setLoading(true);
    setPaymentError("");

    try {
      // 1. Submit elements form details to Stripe
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setPaymentError(submitError.message);
        setLoading(false);
        return;
      }

      // Persist shipping address in localStorage for redirect recovery
      const shippingAddress = {
        fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
        addressLine1: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        postalCode: form.zipCode.trim(),
        country: form.country,
        phone: form.phone.trim(),
      };
      localStorage.setItem("pending_shipping_address", JSON.stringify(shippingAddress));

      // 2. Confirm payment intent with Stripe Elements
      console.log("Calling stripe.confirmPayment with parameters and shipping details...");
      const confirmResult = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout`,
          shipping: {
            name: shippingAddress.fullName,
            address: {
              line1: shippingAddress.addressLine1,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postal_code: shippingAddress.postalCode,
              country: "US", // Default to US country code for Stripe APIs
            },
            phone: shippingAddress.phone,
          },
        },
        redirect: "if_required",
      });

      console.log("Stripe confirmPayment returned:", confirmResult);
      const { error: confirmError, paymentIntent } = confirmResult;

      if (confirmError) {
        setPaymentError(confirmError.message);
        setLoading(false);
        return;
      }

      // 3. Complete order saving in backend after successful verification
      if (paymentIntent && paymentIntent.status === "succeeded") {
        const orderPayload = {
          items: cartItems.map((item) => ({
            product: item.product._id,
            size: item.size,
            quantity: item.quantity,
          })),
          shippingAddress,
          stripePaymentIntentId: paymentIntent.id,
        };

        console.log("Sending POST /api/orders request payload:", orderPayload);
        const response = await api.post("/orders", orderPayload);
        console.log("POST /api/orders response status/data:", response.status, response.data);

        if (response.data.success) {
          setOrderSuccess(response.data.order);
          clearCart();
          localStorage.removeItem("pending_shipping_address");
        }
      } else {
        setPaymentError("Payment verification could not be completed.");
      }
    } catch (err) {
      console.error("Order submission failed:", err);
      setPaymentError(
        err?.response?.data?.message || "Order placement failed. Check stock or details."
      );
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <section className="max-w-md mx-auto px-4 py-24 text-center border border-edge rounded-sm my-8 bg-surface/30">
        <span className="text-4xl">★</span>
        <h1 className="font-heading text-2xl uppercase tracking-tight text-fg mt-4 mb-2">
          ORDER CONFIRMED.
        </h1>
        <p className="text-success text-sm font-semibold uppercase tracking-wider mb-6">
          Thank you for your purchase.
        </p>
        <div className="text-left text-sm space-y-2 border-y border-edge py-4 my-6 font-mono text-fg-secondary">
          <p>Order ID: {orderSuccess._id}</p>
          <p>Total Charged: ${orderSuccess.totalAmount.toFixed(2)}</p>
          <p>Status: {orderSuccess.paymentStatus.toUpperCase()}</p>
        </div>
        <p className="text-fg-muted text-sm mb-8">
          We have received your drops order and are processing it.
        </p>
        <Link to="/products">
          <Button variant="secondary" className="w-full">
            CONTINUE SHOPPING
          </Button>
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-heading text-2xl md:text-3xl uppercase tracking-tight text-fg mb-10">
        CHECKOUT
      </h1>

      <form onSubmit={handlePlaceOrder} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="border border-edge rounded-sm p-6 bg-surface/30">
              <h2 className="font-heading text-sm uppercase tracking-wider text-fg mb-6">
                SHIPPING DETAILS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-fg-secondary block mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full border-b border-edge py-3 text-fg text-sm focus:border-accent focus:outline-none transition-colors"
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-danger text-xs mt-2">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-fg-secondary block mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full border-b border-edge py-3 text-fg text-sm focus:border-accent focus:outline-none transition-colors"
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-danger text-xs mt-2">{errors.lastName}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs uppercase tracking-[0.15em] text-fg-secondary block mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full border-b border-edge py-3 text-fg text-sm focus:border-accent focus:outline-none transition-colors"
                    placeholder="123 Streetwear Ave"
                  />
                  {errors.address && (
                    <p className="text-danger text-xs mt-2">{errors.address}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-fg-secondary block mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full border-b border-edge py-3 text-fg text-sm focus:border-accent focus:outline-none transition-colors"
                    placeholder="New York"
                  />
                  {errors.city && (
                    <p className="text-danger text-xs mt-2">{errors.city}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-fg-secondary block mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className="w-full border-b border-edge py-3 text-fg text-sm focus:border-accent focus:outline-none transition-colors"
                    placeholder="NY"
                  />
                  {errors.state && (
                    <p className="text-danger text-xs mt-2">{errors.state}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-fg-secondary block mb-2">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={form.zipCode}
                    onChange={handleChange}
                    className="w-full border-b border-edge py-3 text-fg text-sm focus:border-accent focus:outline-none transition-colors"
                    placeholder="10001"
                  />
                  {errors.zipCode && (
                    <p className="text-danger text-xs mt-2">{errors.zipCode}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-fg-secondary block mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full border-b border-edge py-3 text-fg text-sm focus:border-accent focus:outline-none transition-colors"
                    placeholder="+1 (555) 019-2834"
                  />
                  {errors.phone && (
                    <p className="text-danger text-xs mt-2">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Real Stripe Elements Form */}
            <div className="border border-edge rounded-sm p-6 bg-surface/30">
              <h2 className="font-heading text-sm uppercase tracking-wider text-fg mb-6">
                PAYMENT METHOD
              </h2>

              {paymentError && (
                <div className="mb-4 border border-danger/40 bg-danger/10 text-danger text-xs px-4 py-3 font-mono">
                  {paymentError}
                </div>
              )}

              <PaymentElement />
            </div>
          </div>

          {/* Order Summary & Final Actions */}
          <div className="border border-edge rounded-sm p-6 h-fit bg-surface/30 space-y-6">
            <h2 className="font-heading text-sm uppercase tracking-wider text-fg">
              BAG DETAILS
            </h2>
            <div className="divide-y divide-edge max-h-48 overflow-y-auto pr-2">
              {cartItems.map((item, index) => (
                <div key={index} className="py-3 flex justify-between text-xs">
                  <div>
                    <p className="font-bold text-fg uppercase truncate max-w-[150px]">
                      {item.product?.name}
                    </p>
                    <p className="text-fg-muted">
                      SIZE: {item.size} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-mono text-fg-secondary">
                    ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-edge pt-4 space-y-3 text-sm">
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
              <div className="border-t border-edge pt-3 flex justify-between text-fg font-bold">
                <span>Total</span>
                <span className="font-mono">${total.toFixed(2)}</span>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full cursor-pointer" disabled={loading}>
              {loading ? "PROCESSING ORDER..." : "PLACE ORDER"}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}

export default function Checkout() {
  const { cartItems, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [clientSecret, setClientSecret] = useState("");
  const [loadingSecret, setLoadingSecret] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [redirectError, setRedirectError] = useState("");
  const [processingRedirect, setProcessingRedirect] = useState(false);

  useEffect(() => {
    // 1. Check if we returned from a Stripe redirect
    const params = new URLSearchParams(window.location.search);
    const paymentIntentId = params.get("payment_intent");
    const clientSecretParam = params.get("payment_intent_client_secret");
    const redirectStatus = params.get("redirect_status");

    if (paymentIntentId && clientSecretParam && redirectStatus === "succeeded") {
      const completeRedirectOrder = async () => {
        try {
          setProcessingRedirect(true);
          console.log("Detected Stripe redirect success with payment_intent:", paymentIntentId);
          
          const pendingShipping = localStorage.getItem("pending_shipping_address");
          if (!pendingShipping) {
            throw new Error("Shipping address details not found in local storage.");
          }
          const shippingAddress = JSON.parse(pendingShipping);

          const orderPayload = {
            items: cartItems.map((item) => ({
              product: item.product._id,
              size: item.size,
              quantity: item.quantity,
            })),
            shippingAddress,
            stripePaymentIntentId: paymentIntentId,
          };

          console.log("Redirect order creation POST /api/orders request payload:", orderPayload);
          const response = await api.post("/orders", orderPayload);
          console.log("Redirect order creation POST /api/orders response data:", response.data);

          if (response.data.success) {
            setOrderSuccess(response.data.order);
            clearCart();
            localStorage.removeItem("pending_shipping_address");
            // Clean up query parameters in URL without page reload
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            throw new Error("Order creation failed on the backend.");
          }
        } catch (err) {
          console.error("Order recovery failed after redirect:", err);
          setRedirectError(
            err?.response?.data?.message || err.message || "Failed to finalize your order. Please check your bank or contact support."
          );
        } finally {
          setProcessingRedirect(false);
          setLoadingSecret(false);
        }
      };

      if (isAuthenticated && cartItems.length > 0) {
        completeRedirectOrder();
      } else if (isAuthenticated && cartItems.length === 0) {
        // If cart is already empty, the order may have already been finalized. Clear query params.
        window.history.replaceState({}, document.title, window.location.pathname);
        setLoadingSecret(false);
      }
      return;
    }

    if (paymentIntentId && redirectStatus && redirectStatus !== "succeeded") {
      setRedirectError("Stripe payment authorization failed or was canceled.");
      window.history.replaceState({}, document.title, window.location.pathname);
      setLoadingSecret(false);
      return;
    }

    if (!isAuthenticated || cartItems.length === 0) {
      setLoadingSecret(false);
      return;
    }

    const fetchIntent = async () => {
      try {
        setLoadingSecret(true);
        const response = await api.post("/payment/create-intent", {
          items: cartItems.map((item) => ({
            product: item.product._id,
            size: item.size,
            quantity: item.quantity,
          })),
        });
        setClientSecret(response.data.clientSecret);
      } catch (err) {
        console.error("Failed to create Stripe PaymentIntent:", err);
      } finally {
        setLoadingSecret(false);
      }
    };

    fetchIntent();
  }, [cartItems, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <section className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="font-heading text-xl uppercase text-fg mb-4">
          SIGN IN REQUIRED.
        </p>
        <p className="text-fg-muted text-sm mb-6">
          You need to be signed in to complete your checkout.
        </p>
        <Link to="/login">
          <Button className="w-full">SIGN IN</Button>
        </Link>
      </section>
    );
  }

  if (orderSuccess) {
    return (
      <section className="max-w-md mx-auto px-4 py-24 text-center border border-edge rounded-sm my-8 bg-surface/30">
        <span className="text-4xl">★</span>
        <h1 className="font-heading text-2xl uppercase tracking-tight text-fg mt-4 mb-2">
          ORDER CONFIRMED.
        </h1>
        <p className="text-success text-sm font-semibold uppercase tracking-wider mb-6">
          Thank you for your purchase.
        </p>
        <div className="text-left text-sm space-y-2 border-y border-edge py-4 my-6 font-mono text-fg-secondary">
          <p>Order ID: {orderSuccess._id}</p>
          <p>Total Charged: ${orderSuccess.totalAmount.toFixed(2)}</p>
          <p>Status: {orderSuccess.paymentStatus.toUpperCase()}</p>
        </div>
        <p className="text-fg-muted text-sm mb-8">
          We have received your drops order and are processing it.
        </p>
        <Link to="/products">
          <Button variant="secondary" className="w-full">
            CONTINUE SHOPPING
          </Button>
        </Link>
      </section>
    );
  }

  if (processingRedirect) {
    return (
      <section className="max-w-5xl mx-auto px-4 py-24 text-center">
        <p className="text-xs uppercase tracking-[0.15em] text-fg-muted animate-pulse">
          FINALIZING YOUR ORDER AND CONFIRMING PAYMENT...
        </p>
      </section>
    );
  }

  if (redirectError) {
    return (
      <section className="max-w-md mx-auto px-4 py-24 text-center border border-danger/40 rounded-sm my-8 bg-danger/5">
        <p className="font-heading text-xl uppercase text-danger mb-4">
          ORDER ERROR.
        </p>
        <p className="text-danger text-sm mb-8 font-mono">
          {redirectError}
        </p>
        <Link to="/cart">
          <Button className="w-full">RETURN TO BAG</Button>
        </Link>
      </section>
    );
  }

  if (cartItems.length === 0) {
    return (
      <section className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="font-heading text-xl uppercase text-fg mb-2">
          NO ITEMS.
        </p>
        <p className="text-fg-muted text-sm mb-8">
          You don't have any products in your cart.
        </p>
        <Link to="/products">
          <Button className="w-full">BROWSE DROPS</Button>
        </Link>
      </section>
    );
  }

  if (loadingSecret || !clientSecret) {
    return (
      <section className="max-w-5xl mx-auto px-4 py-24 text-center">
        <p className="text-xs uppercase tracking-[0.15em] text-fg-muted animate-pulse">
          INITIALIZING SECURE CHECKOUT...
        </p>
      </section>
    );
  }

  // Customize payment styling to match dark/lime streetwear brand aesthetic
  const appearance = {
    theme: "night",
    variables: {
      colorPrimary: "#d4ff3f",
      colorBackground: "#141414",
      colorText: "#f5f5f0",
      colorDanger: "#ff4d4d",
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      borderRadius: "2px",
    },
  };

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <CheckoutForm clientSecret={clientSecret} orderSuccess={orderSuccess} setOrderSuccess={setOrderSuccess} />
    </Elements>
  );
}
