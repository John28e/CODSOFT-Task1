import Product from "../models/Product.js";

/**
 * GET /api/products
 * Get all products with filters (category, search, featured, sort)
 */
export const getProducts = async (req, res, next) => {
  try {
    const { category, search, featured, sort } = req.query;
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

    // Handle sorting
    let sortQuery = { createdAt: -1 };
    if (sort === "price-asc") {
      sortQuery = { price: 1 };
    } else if (sort === "price-desc") {
      sortQuery = { price: -1 };
    } else if (sort === "rating-desc") {
      sortQuery = { rating: -1 };
    } else if (sort === "newest") {
      sortQuery = { createdAt: -1 };
    }

    const products = await Product.find(filter).sort(sortQuery);

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

/**
 * POST /api/products/:id/reviews
 * Create a new review for a product
 */
export const createProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("You have already reviewed this product");
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({
      success: true,
      message: "Review added successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};
