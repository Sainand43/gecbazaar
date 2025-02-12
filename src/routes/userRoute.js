import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { get_user_profile, update_user_profile } from "../controllers/userController.js";

const router = Router();

router.get("/profile", authenticateToken, async (req, res) => {
    return res.json({ message: "User authenticated", user: req.user });
});
router.get("/profile", authenticateToken, get_user_profile);
router.put("/profile", authenticateToken, update_user_profile);

export default router;
