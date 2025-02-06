import { PrismaClient } from "@prisma/client";
import bcrypt, { compare } from "bcrypt";
import validator from "validator";

const prisma = new PrismaClient();

export async function create_user(req, res) {
    const {email, phone, name, password} = req.body;
    if(!email || !phone || !name || !password){
        return res.status(400).json({error: "All fields are required"});
    }

    if(!validator.isEmail(email)){
        return res.status(400).json({error: "Invalid Email"});
    }

    if(!validator.isMobilePhone(phone)){
        return res.status(400).json({error: "Invalid Phone Number"});
    }

    if(password.length < 6){
        return res.status(400).json({error: "Password must be atleast 6 characters"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try{
        const user = await prisma.user.create({
            data: {
                email, 
                phone,
                name,
                password: hashedPassword
            }
        })

        console.log(user);

        return res.status(201).json({
            message: "User created successfully",
            user: user,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({error: "Internal server error"});
    }
}
