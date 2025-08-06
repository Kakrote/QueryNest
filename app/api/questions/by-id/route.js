import { getQuestionById } from "@/controllers/questionController";

export async function GET(req, { params }) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  
  if (!id) {
    return new Response(JSON.stringify({ message: "Question ID is required" }), { status: 400 });
  }
  
  const result = await getQuestionById(id);
  return new Response(JSON.stringify(result), { status: result.status });
}