import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["tops", "bottoms", "outerwear", "accessories"],
        message: "{VALUE} is not a valid category",
      },
    },
    images: [{ type: String }], // Cloudinary URLs
    sizes: [
      {
        size: { type: String, required: true },
        stock: { type: Number, required: true, min: 0, default: 0 },
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for common queries
productSchema.index({ category: 1 });
productSchema.index({ featured: 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;

