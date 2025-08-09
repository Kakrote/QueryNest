import { loginUser } from "@/controllers/authController";
import { rateLimit } from "@/middleware/rateLimit";
export async function POST(req) {
        try {
            const limited = rateLimit(req, { action: 'login' });
            if (limited) return limited.response;
        const data = await req.json();
        const result = await loginUser(data);
        return new Response(JSON.stringify(result), { status: result.status });
    } catch (err) {
        console.error('Login route error', err);
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
}