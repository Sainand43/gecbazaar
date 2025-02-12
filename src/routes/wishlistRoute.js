import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { add_to_wishlist, get_user_wishlist, remove_from_wishlist } from "../controllers/wishlistController.js";

const router = Router();

router.post("/", authenticateToken, add_to_wishlist);
router.get("/", authenticateToken, get_user_wishlist);
router.delete("/:id", authenticateToken, remove_from_wishlist);

export default router;
