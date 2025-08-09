import { verifyAuth } from "@/middleware/auth";
import { makeComment } from "@/controllers/commentController";
import { rateLimit } from "@/middleware/rateLimit";

export async function POST(req) {
    const limited = rateLimit(req, { action: 'comment' });
    if (limited) return limited.response;
    const user =await  verifyAuth(req);
    
    if (!user) return new Response(JSON.stringify({ message: "Unauthorized" }, { status: 401 }));
    try {
        const body = await req.json();
        const { content, questionId, answerId } = body;
        const data = await makeComment({
            content,
            authorId: user.userId,
            questionId,
            answerId
        })
        return new Response(JSON.stringify(data), { status: data.status });
    }
    catch (err) {
        console.error("Comment API Error:", err);
        return new Response(JSON.stringify({ message: "Something went wrong." }), { status: 500 });
    }
}