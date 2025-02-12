import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import validator from "validator";
import nodemailer from "nodemailer";
import crypto from "crypto";
import prisma from "../prismaClient.js"; // Ensure this is properly configured

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;

// Store refresh tokens (Ideally use Redis or database)
const refreshTokens = new Set();
// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL, // Your email address
        pass: process.env.EMAIL_PASSWORD, // Your email password or app password
    },
});

// Store OTPs in memory (or use a database)
const otpStore = new Map();

// Generate and send OTP
export const sendOTP = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    // Send OTP via email
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error sending OTP", error });
    }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const storedOTP = otpStore.get(email);
    if (!storedOTP) return res.status(400).json({ message: "OTP not found or expired" });

    if (storedOTP.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    otpStore.delete(email); // Remove OTP after successful verification
    res.status(200).json({ message: "OTP verified successfully" });
};


/*export const sendOTP = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ error: "Phone number is required" });
        }

        // Simulate sending OTP (Replace this with actual OTP logic)
        console.log(`Sending OTP to ${phone}`);

        res.status(200).json({ message: "OTP sent successfully", phone });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};*/


// Generate a new JWT token
export async function login_user(req, res) {
    const { email, password } = req.body;

    // Check if all fields are provided
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Invalid Email" });
    }

    try {
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { user_id: user.user_id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


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

/*

export async function login_user(req, res) {
    const { email, password } = req.body;

    // Check if all fields are provided
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Invalid Email" });
    }

    try {
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { user_id: user.user_id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


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
}*/
