import { answerQuestion, updateAnswer, deleteAnswer, getAnswersByQuestionId } from "@/controllers/answerController";
import { verifyAuth } from "@/middleware/auth";
import { rateLimit } from "@/middleware/rateLimit";

export async function POST(req) {
    const limited = rateLimit(req, { action: 'answer' });
    if (limited) return limited.response;
    const user = await verifyAuth(req);
    if (!user) return new Response(JSON.stringify({ message: "User unauthorized" }), { status: 401 });
    try {
        const body = await req.json();
        const { questionslug, content } = body;
        if (!questionslug || !content) {
            return new Response(JSON.stringify({ message: "Missing required fields." }), { status: 400 });
        }
        const result = await answerQuestion({
            questionslug,
            content,
            authorId: user.userId
        });
        return new Response(JSON.stringify(result), { status: result.status });
    } catch (error) {
        console.error("Error creating answer:", error);
        return new Response(JSON.stringify({ message: "Server error." }), { status: 500 });
    }
}

export async function PUT(req) {
    const limited = rateLimit(req, { action: 'answer' });
    if (limited) return limited.response;
    const user = await verifyAuth(req);
    if (!user) return new Response(JSON.stringify({ message: "User unauthorized" }), { status: 401 });
    try {
        const body = await req.json();
        const { answerId, newContent } = body;
        if (!answerId || !newContent) {
            return new Response(JSON.stringify({ message: "Missing required fields." }), { status: 400 });
        }
        const result = await updateAnswer({
            answerId,
            authorId: user.userId,
            newContent
        });
        return new Response(JSON.stringify(result), { status: result.status });
    } catch (error) {
        console.error("Error updating answer:", error);
        return new Response(JSON.stringify({ message: "Server error." }), { status: 500 });
    }
}

export async function DELETE(req) {
    const limited = rateLimit(req, { action: 'answer' });
    if (limited) return limited.response;
    const user = await verifyAuth(req);
    if (!user) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    try {
        const { answerId } = await req.json();
        if (!answerId) {
            return new Response(JSON.stringify({ message: "Missing answerId." }), { status: 400 });
        }
        const result = await deleteAnswer({ answerId, authorId: user.userId });
        return new Response(JSON.stringify(result), { status: result.status });
    } catch (error) {
        console.error("Error deleting answer:", error);
        return new Response(JSON.stringify({ message: "Server error." }), { status: 500 });
    }
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const questionId = searchParams.get("questionId");
        if (!questionId) {
            return new Response(JSON.stringify({ message: "Missing questionId." }), { status: 400 });
        }
        const result = await getAnswersByQuestionId(questionId);
        return new Response(JSON.stringify(result), {
            status: result.status,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching answers:", error);
        return new Response(JSON.stringify({ message: "Server error." }), { status: 500 });
    }
}
