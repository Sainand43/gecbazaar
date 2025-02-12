import express from "express";
import authRouter from "./src/routes/authRoute.js";
import userRouter from "./src/routes/userRoute.js";
import cors from "cors";
import dotenv from "dotenv";
import wishlistRouter from "./src/routes/wishlistRoute.js";
import productRoutes from "./src/routes/productRoute.js";
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per window
    message: "Too many requests, please try again later",
});

dotenv.config();

const port = process.env.PORT || 8000;
const app = express();

app.use(express.json());
app.use(cors());

app.use("/limiter", limiter);
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRouter); // Registers the home page route

app.get("/", (req, res) => {
    res.send("Welcome to the API");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
