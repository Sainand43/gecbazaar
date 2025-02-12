import { Router } from "express";
//import { create_user, login_user } from "../controllers/auth.js";
//import { sendOTP, verifyOTP, refreshToken } from "../controllers/auth.js";
import { sendOTP, verifyOTP, create_user, login_user } from "../controllers/auth.js";

const router = Router();

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/register", create_user);
router.post("/login", login_user);


//changed from "/" to "/register"
//router.post("/register", create_user);
//router.post("/login", login_user);

export default router;
