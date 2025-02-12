import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function add_product(req, res) {
    const { seller_id, title, description, price, category, status, image_url } = req.body;

    // Validate input
    if (!seller_id || !title || !price || !category) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if category is valid
    const validCategories = ["Electronic", "Books", "EngineeringGraphics", "Boiler", "Other"];
    if (!validCategories.includes(category)) {
        return res.status(400).json({ error: "Invalid category" });
    }

    try {
        const product = await prisma.product.create({
            data: {
                seller_id,
                title,
                description,
                price,
                category,
                status: status || "Available", // Default status
                image_url: image_url || "default_product.png",
            },
        });

        return res.status(201).json({ message: "Product added successfully", product });
    } catch (error) {
        console.error("Error adding product:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}/*
export const get_all_products = async (req, res) => {
    try {
        // 🏷️ Pagination (Default: Page 1, Limit 10)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // 📊 Sorting (Default: Sort by Date Created, Descending Order)
        const sortBy = req.query.sortBy || "created_at";  // Sort options: price, created_at, title
        const sortOrder = req.query.order === "asc" ? "asc" : "desc";  // Order: asc or desc

        // 🔍 Category Filtering
        const category = req.query.category;

        // 🔎 Search by Title
        const search = req.query.search;

        // 🛒 Fetch Products with Filters
        const products = await prisma.product.findMany({
            where: {
                status: "Available",
                ...(category ? { category: { category_name: category } } : {}),  // Filter by Category
                ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),  // Search by Title
            },
            orderBy: { [sortBy]: sortOrder },  // Apply Sorting
            skip,  // Apply Pagination
            take: limit,
            include: {
                seller: { select: { name: true } },  // Include Seller Details
                category: { select: { category_name: true } },  // Include Category Details
            }
        });

        // 📊 Get Total Product Count for Pagination
        const totalProducts = await prisma.product.count({
            where: {
                status: "Available",
                ...(category ? { category: { category_name: category } } : {}),
                ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
            }
        });

        // 📦 Send Response
        res.status(200).json({
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page,
            products,
        });

    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


export async function get_product_by_id(req, res) {
    const { id } = req.params;

    try {
        const product = await prisma.product.findUnique({
            where: { product_id: parseInt(id) },
            include: { seller: { select: { name: true, email: true } } }
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        return res.json(product);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
*/

// Get all products with pagination, sorting, category filtering, and search
export async function get_all_products(req, res) {
    try {
        // 🏷️ Pagination (Default: Page 1, Limit 10)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // 📊 Sorting (Default: Sort by Date Created, Descending Order)
        const sortBy = ["price", "created_at", "title"].includes(req.query.sortBy)
            ? req.query.sortBy
            : "created_at";  // Restrict sorting fields
        const sortOrder = req.query.order === "asc" ? "asc" : "desc";

        // 🔍 Category Filtering (Fixed for ENUM type)
        const category = req.query.category;
        const categoryFilter = category ? { category: category } : {};  // Enum-based filter

        // 🔎 Search by Title (Case-insensitive)
        const search = req.query.search;
        const searchFilter = search ? { title: { contains: search, mode: "insensitive" } } : {};

        // 🛒 Fetch Products with Filters
        const products = await prisma.product.findMany({
            where: {
                status: "Available",
                ...categoryFilter,
                ...searchFilter
            },
            orderBy: { [sortBy]: sortOrder },
            skip,
            take: limit,
            include: {
                seller: { select: { name: true } }
            }
        });

        // 📊 Get Total Product Count for Pagination
        const totalProducts = await prisma.product.count({
            where: {
                status: "Available",
                ...categoryFilter,
                ...searchFilter
            }
        });

        // 📦 Send Response
        return res.status(200).json({
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page,
            products,
        });

    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

// Get product by ID (Includes seller details)
export async function get_product_by_id(req, res) {
    const { id } = req.params;

    try {
        const product = await prisma.product.findUnique({
            where: { product_id: parseInt(id) },
            include: { seller: { select: { name: true, email: true } } }
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        return res.status(200).json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export async function update_product(req, res) {
    const { id } = req.params;
    const { title, description, price, condition } = req.body;

    try {
        const updatedProduct = await prisma.product.update({
            where: { product_id: parseInt(id) },
            data: { title, description, price, condition }
        });

        return res.json({ message: "Product updated successfully", updatedProduct });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function delete_product(req, res) {
    const { id } = req.params;

    try {
        await prisma.product.delete({ where: { product_id: parseInt(id) } });
        return res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
