import { createQuestion,getAllQuestions } from "@/controllers/questionController";
import { verifyAuth } from "@/middleware/auth";


export async function POST(req) {
    const user = await verifyAuth(req);
    if (!user) return new Response(JSON.stringify({ message: "User unauthorized" }), { status: 400 });
    try {
        const body = await req.json()
        const { title, content, tags } = body;

        const result = await createQuestion({
            title,
            content,
            tags,
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

