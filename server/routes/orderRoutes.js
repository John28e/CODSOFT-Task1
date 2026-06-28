import { Router } from "express";
import { createOrder, getMyOrders } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.post("/", createOrder);
router.get("/my-orders", getMyOrders);

export default router;
