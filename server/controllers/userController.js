import User from "../models/User.js";

/**
 * GET /api/users/cart
 * Get user's cart items from DB
 */
export const getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("cart.product");
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.json({
      success: true,
      cart: user.cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/cart
 * Synchronize user's cart in DB
 */
export const syncCart = async (req, res, next) => {
  try {
    const { cart } = req.body; // Array of { product: id, size: string, quantity: number }

    if (!Array.isArray(cart)) {
      res.status(400);
      throw new Error("Cart must be an array");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.cart = cart.map((item) => ({
      product: item.product,
      size: item.size,
      quantity: item.quantity,
    }));

    await user.save();
    
    const populatedUser = await User.findById(req.user._id).populate("cart.product");

    res.json({
      success: true,
      cart: populatedUser.cart,
    });
  } catch (error) {
    next(error);
  }
};
