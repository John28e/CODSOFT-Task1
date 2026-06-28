import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import stripe from "../config/stripe.js";

/**
 * POST /api/orders
 * Create a new order after verifying payment intent status with Stripe
 */
export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, stripePaymentIntentId } = req.body;

    if (!items || items.length === 0) {
      res.status(400);
      throw new Error("No order items provided");
    }

    if (!stripePaymentIntentId) {
      res.status(400);
      throw new Error("Stripe Payment Intent ID is required");
    }

    // ── Verify PaymentIntent status with Stripe ──
    const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
    if (!paymentIntent || paymentIntent.status !== "succeeded") {
      res.status(400);
      throw new Error("Payment verification failed — payment is not completed");
    }

    let subtotal = 0;
    const finalItems = [];

    // Verify stock and fetch correct prices
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found with id: ${item.product}`);
      }

      // Find size stock
      const sizeObj = product.sizes.find((s) => s.size === item.size);
      if (!sizeObj) {
        res.status(400);
        throw new Error(`Size ${item.size} is not available for product ${product.name}`);
      }

      if (sizeObj.stock < item.quantity) {
        res.status(400);
        throw new Error(`Insufficient stock for product ${product.name} (Size ${item.size}). Requested: ${item.quantity}, Available: ${sizeObj.stock}`);
      }

      // Snapshot item info
      finalItems.push({
        product: product._id,
        name: product.name,
        size: item.size,
        quantity: item.quantity,
        price: product.price,
      });

      subtotal += product.price * item.quantity;

      // Decrement stock
      sizeObj.stock -= item.quantity;
      await product.save();
    }

    const shipping = subtotal > 150 ? 0 : 15;
    const totalAmount = subtotal + shipping;

    // Optional double-check of Stripe amount against calculated amount
    const stripeAmountCalculated = Math.round(totalAmount * 100);
    if (Math.abs(paymentIntent.amount - stripeAmountCalculated) > 1) {
      console.warn(`Stripe amount (${paymentIntent.amount} cents) doesn't exactly match server calculation (${stripeAmountCalculated} cents).`);
    }

    const order = await Order.create({
      user: req.user._id,
      items: finalItems,
      totalAmount,
      shippingAddress,
      paymentStatus: "paid",
      stripePaymentIntentId,
      orderStatus: "processing",
    });

    // Clear user cart on the server database
    const user = await User.findById(req.user._id);
    if (user) {
      user.cart = [];
      await user.save();
    }

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/my-orders
 * Get current user's order history
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};
