import { answerQuestion } from "@/controllers/answerController";
import { verifyAuth } from "@/middleware/auth";
import { use } from "react";

export async function POST(req) {
    const user = await verifyAuth(req)
    if (!user) return new Response(JSON.stringify({ message: "User unauthorized" }), { status: 400 });
    try {
        const body = await req.json();
        const { questionslug, content } = body;
        const result = await answerQuestion({
            questionslug,
            content,
            authorId: user.userId
        })
        return new Response(JSON.stringify(result), {
            status: result.status
        })
    }
    catch (error) {
        console.error("Error creating answer:", error);
        return new Response(JSON.stringify({ message: "Something went wrong." }), { status: 500 });
    }
}