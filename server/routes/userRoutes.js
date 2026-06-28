import { Router } from "express";
import { getCart, syncCart } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.get("/cart", getCart);
router.put("/cart", syncCart);

export default router;
