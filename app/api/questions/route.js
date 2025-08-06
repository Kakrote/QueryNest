import { createQuestion, getAllQuestions, deleteQuestion } from "@/controllers/questionController";
import { verifyAuth } from "@/middleware/auth";
import { validateQuestionData, checkRateLimit } from "@/utils/serverValidation";


export async function POST(req) {
    console.log("going for verification")
    const user = await verifyAuth(req);
    console.log("verification done user: ",user)
    if (!user) return new Response(JSON.stringify({ message: "User unauthorized" }), { status: 400 });
    
    // Rate limiting - 5 questions per minute per user
    if (!checkRateLimit(`question:${user.userId}`, 5, 60000)) {
        return new Response(JSON.stringify({ message: "Rate limit exceeded. Please wait before posting another question." }), { status: 429 });
    }
    
    try {
        const body = await req.json()
        const { title, content, tags } = body;

        // Validate and sanitize input data
        const validation = validateQuestionData({ title, content, tags });
        if (!validation.isValid) {
            return new Response(JSON.stringify({ message: validation.error }), { status: 400 });
        }

        const result = await createQuestion({
            ...validation.data,
            authorId: user.userId,
        })
        return new Response(JSON.stringify(result), {
            status: result.status,
        });
    }
    catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ message: 'Server error' }), {
            status: 500,
        });
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

