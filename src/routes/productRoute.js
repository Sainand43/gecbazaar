import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
    add_product,
    get_all_products,
    get_product_by_id,
    update_product,
    delete_product
} from "../controllers/productController.js";

const router = Router();

router.post("/add", authenticateToken, add_product);
router.get("/", get_all_products);
router.get("/:id", get_product_by_id);
router.put("/:id", authenticateToken, update_product);
router.delete("/:id", authenticateToken, delete_product);
router.get("/home", get_all_products);
// GET /home - Get all available products
export default router;
