"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { validateAndSanitizeForm, formSchemas } from "@/utils/validation";

// Helper to build a consistent response object
const respond = (status, data = null, message = null, error = null) => ({ status, ...(message && { message }), ...(error && { error }), ...(data && data) });

// Avoid leaking implementation details in logs
const logError = (scope, err) => {
    console.error(`[${scope}]`, err?.message || err);
};

//Register new User 

export const registerUser = async ({ name, email, password }) => {
    // Validate & sanitize
    const { isValid, sanitizedData, errors } = validateAndSanitizeForm({ name, email, password }, formSchemas.user);
    if (!isValid) return respond(400, null, null, errors);

    try {
        const existingUser = await prisma.user.findUnique({ where: { email: sanitizedData.email } });
        if (existingUser) return respond(409, null, "User already exists");

        const hashPassword = await bcrypt.hash(sanitizedData.password, 10);
        const newUser = await prisma.user.create({
            data: {
                name: sanitizedData.name,
                email: sanitizedData.email,
                password: hashPassword,
            },
            select: { id: true, name: true, email: true, createdAt: true },
        });
        return respond(201, { user: newUser }, "User registered successfully");
    } catch (error) {
        logError('registerUser', error);
        return respond(500, null, "Internal server error");
    }
};

// Login User

export const loginUser = async ({ email, password }) => {
    const { isValid, sanitizedData, errors } = validateAndSanitizeForm({ email, password }, formSchemas.login);
    if (!isValid) return respond(400, null, null, errors);
    try {
        const user = await prisma.user.findUnique({ where: { email: sanitizedData.email } });
        if (!user) return respond(404, null, "User not found");

        const isMatch = await bcrypt.compare(sanitizedData.password, user.password);
        if (!isMatch) return respond(401, null, "Invalid email or password");

        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) return respond(500, null, "Server misconfiguration");

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "2h" });

        // Limit exposed user fields
        const safeUser = { id: user.id, name: user.name, email: user.email };
        return respond(200, { token, user: safeUser }, "Login successful");
    } catch (error) {
        logError('loginUser', error);
        return respond(500, null, "Internal server error");
    }
};