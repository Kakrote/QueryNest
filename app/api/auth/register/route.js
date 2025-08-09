import { registerUser } from "@/controllers/authController";
import { rateLimit } from "@/middleware/rateLimit";
export async function POST(req) {
        try {
            const limited = rateLimit(req, { action: 'register' });
            if (limited) return limited.response;
        const data = await req.json();
        const result = await registerUser(data);
        return new Response(JSON.stringify(result), { status: result.status });
    } catch (err) {
        console.error('Register route error', err);
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
}