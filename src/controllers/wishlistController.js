import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function add_to_wishlist(req, res) {
    const { product_id } = req.body;

    try {
        const wishlistItem = await prisma.wishlist.create({
            data: {
                user_id: req.user.user_id,
                product_id: parseInt(product_id)
            }
        });

        return res.status(201).json({ message: "Added to wishlist", wishlistItem });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function get_user_wishlist(req, res) {
    try {
        const wishlist = await prisma.wishlist.findMany({
            where: { user_id: req.user.user_id },
            include: { product: true }
        });

        return res.json(wishlist);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function remove_from_wishlist(req, res) {
    const { id } = req.params;

    try {
        await prisma.wishlist.delete({ where: { wishlist_id: parseInt(id) } });
        return res.json({ message: "Removed from wishlist" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
