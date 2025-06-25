import { loginUser } from "@/controllers/authController";
export async function POST(req) {
    try {
        const data = await req.json()
        console.log("Login route hit")
        const result = await loginUser(data)
        console.log("login route response: ",result)
        return new Response(JSON.stringify({ message: result.message, token: result.token, user: result.user }), {
            status: result.status,
        });
    }
    catch (err) {
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
}