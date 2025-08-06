import { registerUser } from "@/controllers/authController";
import { validateUserData, checkRateLimit } from "@/utils/serverValidation";

export async function POST(req) {
    // Get client IP for rate limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(/, /)[0] : req.ip || 'unknown';
    
    // Rate limiting - 3 registration attempts per hour per IP
    if (!checkRateLimit(`register:${ip}`, 3, 3600000)) {
        return new Response(JSON.stringify({ message: "Too many registration attempts. Please try again later." }), { status: 429 });
    }
    
    try {
        const data = await req.json()
        
        // Validate and sanitize input data
        const validation = validateUserData(data);
        if (!validation.isValid) {
            return new Response(JSON.stringify({ message: validation.error }), { status: 400 });
        }
        
        const result = await registerUser(validation.data)
        return new Response(JSON.stringify({ message: result.message, token: result.token, user: result.user }), {
            status: result.status,
        });
    }
    catch (err) {
        console.error("Registration error:", err);
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
}