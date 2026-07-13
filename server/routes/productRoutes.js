import { Router } from "express";
import { getProducts, getProductById, createProductReview } from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/:id/reviews", protect, createProductReview);

export default router;

