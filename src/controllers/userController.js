import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function get_user_profile(req, res) {
    try {
        const user = await prisma.user.findUnique({
            where: { user_id: req.user.user_id },
            select: { name: true, email: true, phone: true, created_at: true }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function update_user_profile(req, res) {
    const { name, phone } = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: { user_id: req.user.user_id },
            data: { name, phone }
        });

        return res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
