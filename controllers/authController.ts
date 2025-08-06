"use server"
import { prisma } from "@/lib/prisma";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import { sanitizePlainText } from "@/utils/sanitize";

// Types
interface RegisterParams {
    name: string;
    email: string;
    password: string;
}

interface LoginParams {
    email: string;
    password: string;
}

interface ApiResponse {
    status: number;
    message: string;
    user?: any;
    token?: string;
}

//Register new User 
export const registerUser = async ({ name, email, password }: RegisterParams): Promise<ApiResponse> => {
    if(!name||!email||!password) return {status:400,message:"All the fileds are required"}
    
    // Sanitize user inputs to prevent XSS
    const sanitizedName = sanitizePlainText(name);
    const sanitizedEmail = sanitizePlainText(email);
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
        return {status:400,message:"Invalid email format"}
    }
    
    try{
        const existingUser=await prisma.user.findUnique({where:{email: sanitizedEmail}})
        if(existingUser) return {status:401,message:"User already exist"}
        const hashPassword=await bcrypt.hash(password,10)
        const newUser=await prisma.user.create({
            data:{
                name: sanitizedName,
                email: sanitizedEmail,
                password:hashPassword
            }
        })
        return {status:200,message:"User Register Succesfully",user:newUser}
    }
    catch(error){
        console.log(error)
        return {status:500,message:"Server Error !"}
    }
}

// Login User
export const loginUser = async ({ email, password }: LoginParams): Promise<ApiResponse> => {
    if(!email||!password) return {status:401,message:"these filed cant be empty"}
    
    // Sanitize email input
    const sanitizedEmail = sanitizePlainText(email);
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
        return {status:400,message:"Invalid email format"}
    }
    
    console.log("login conroller active ")
    console.log("email:",sanitizedEmail)
    try{
        const user=await prisma.user.findUnique({where:{email: sanitizedEmail}});
        if(!user) return {
            status:402,
            message:"User not Found "
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch) return{
            status:402,
            message:"Wrong email or Password"
        }
        const JWT_SECRET = process.env.JWT_SECRET as string;
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "10d" });
        console.log("my token: ", token)
        return { status: 201, message: 'User logged in', token, user };

    }
    catch(error){
        console.log(error)
        return {status:500,message:"server Error !"}
    }

}