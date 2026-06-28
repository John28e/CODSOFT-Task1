import Product from "../models/Product.js";

/**
 * GET /api/products
 * Get all products with filters (category, search, featured)
 */
export const getProducts = async (req, res, next) => {
  try {
    const { category, search, featured } = req.query;
    const filter = {};

    if (category && category !== "all") {
      filter.category = category.toLowerCase();
    }

    if (featured === "true") {
      filter.featured = true;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/:id
 * Get details of a single product
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};
