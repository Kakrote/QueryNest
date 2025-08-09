import { createQuestion, getAllQuestions, deleteQuestion } from "@/controllers/questionController";
import { verifyAuth } from "@/middleware/auth";
import { rateLimit } from "@/middleware/rateLimit";


export async function POST(req) {
        const limited = rateLimit(req, { action: 'question' });
        if (limited) return limited.response;
        const user = await verifyAuth(req);
    if (!user) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    try {
        const body = await req.json();
        const { title, content, tags } = body;
        const result = await createQuestion({ title, content, tags, authorId: user.userId });
        return new Response(JSON.stringify(result), { status: result.status });
    } catch (err) {
        console.error('Create question error', err);
        return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
    }
}


export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const sort = searchParams.get("sort") || "latest";

  const result = await getAllQuestions({ page, limit, sort });
  return new Response(JSON.stringify(result), {
    status: result.status,
  });
}

export async function DELETE(req) {
    const user = await verifyAuth(req);
    if (!user) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    
    try {
        const { questionId } = await req.json();
        if (!questionId) {
            return new Response(JSON.stringify({ message: "Question ID is required." }), { status: 400 });
        }
        
        const result = await deleteQuestion({ 
            questionId, 
            authorId: user.userId 
        });
        
        return new Response(JSON.stringify(result), { status: result.status });
    } catch (error) {
        console.error("Error deleting question:", error);
        return new Response(JSON.stringify({ message: "Server error." }), { status: 500 });
    }
}

