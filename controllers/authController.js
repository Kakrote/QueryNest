"use server"
import { prisma } from "@/lib/prisma";
import bcrypt, { hash } from 'bcrypt'
import jwt from "jsonwebtoken"

//Register new User 

export const registerUser=async({name,email,password})=>{
    if(!name||!email||!password) return {status:400,message:"All the fileds are required"}
    try{
        const existingUser=await prisma.user.findUnique({where:{email}})
        if(existingUser) return {status:401,message:"User already exist"}
        const hashPassword=await bcrypt.hash(password,10)
        const newUser=await prisma.user.create({
            data:{
                name,
                email,
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

export const loginUser=async({email,password})=>{
    if(!email||!password) return {status:401,message:"these filed cant be empty"}
    console.log("login conroller active ")
    console.log("email:",email)
    console.log("password: ",password)
    try{
        const user=await prisma.user.findUnique({where:{email}});
        if(!user) return {
            status:402,
            message:"User not Found "
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch) return{
            status:402,
            message:"Wrong email or Password"
        }
        const JWT_SECRET=process.env.JWT_SECRET
        const token=jwt.sign({userId:user.id,email:user.email},JWT_SECRET,{expiresIn:"10d"})
        console.log("my token: ",token)
        return { status: 201, message: 'User registered', token, user };

    }
    catch(error){
        console.log(error)
        return {status:500,message:"server Error !"}
    }

}