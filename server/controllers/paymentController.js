import Product from "../models/Product.js";
import stripe from "../config/stripe.js";

/**
 * POST /api/payment/create-intent
 * Calculate server-side total amount and create Stripe PaymentIntent
 */
export const createPaymentIntent = async (req, res, next) => {
  try {
    const { items, shipping } = req.body;

    if (!items || items.length === 0) {
      res.status(400);
      throw new Error("No cart items provided");
    }

    let subtotal = 0;

    // Batch query products to prevent sequential database lookups in a loop
    const productIds = [...new Set(items.map((item) => item.product))];
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    // Recalculate server-side to prevent price tampering
    for (const item of items) {
      const product = productMap.get(item.product.toString());
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.product}`);
      }

      // Check size validity
      const sizeObj = product.sizes.find((s) => s.size === item.size);
      if (!sizeObj) {
        res.status(400);
        throw new Error(`Size ${item.size} is not available for ${product.name}`);
      }

      subtotal += product.price * item.quantity;
    }

    // Shipping rule matches client: Free over $150, else $15
    const shippingCost = subtotal > 150 ? 0 : 15;
    const totalAmount = subtotal + shippingCost;

    // Stripe expects amount in the smallest currency unit (cents for USD)
    const amountInCents = Math.round(totalAmount * 100);

    const paymentIntentParams = {
      amount: amountInCents,
      currency: "usd",
      metadata: {
        userId: req.user._id.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    };

    // If shipping is passed from the request, format it to match Stripe's expected API schema
    if (shipping) {
      paymentIntentParams.shipping = {
        name: shipping.name || `${shipping.firstName || ""} ${shipping.lastName || ""}`.trim() || "Customer",
        address: {
          line1: shipping.address?.line1 || shipping.address?.addressLine1 || shipping.address?.address || "",
          line2: shipping.address?.line2 || shipping.address?.addressLine2 || "",
          city: shipping.address?.city || "",
          state: shipping.address?.state || "",
          postal_code: shipping.address?.postal_code || shipping.address?.postalCode || shipping.address?.zipCode || "",
          country: shipping.address?.country || "US",
        },
      };
      if (shipping.phone) {
        paymentIntentParams.shipping.phone = shipping.phone;
      }
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      totalAmount,
    });
  } catch (error) {
    next(error);
  }
};
