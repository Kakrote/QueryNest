import { registerUser } from "@/controllers/authController";
export async function POST(req) {
    try {
        const data = await req.json()
        const result = await registerUser(data)
        return new Response(JSON.stringify({ message: result.message, token: result.token, user: result.user }), {
            status: result.status,
        });
    }
    catch (err) {
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
}