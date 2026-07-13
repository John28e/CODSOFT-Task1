import { Router } from "express";
import { createSupportTicket } from "../controllers/supportController.js";
import { optionalProtect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", optionalProtect, createSupportTicket);

export default router;
