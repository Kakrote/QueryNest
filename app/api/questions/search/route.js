import { searchQuestions } from "@/controllers/questionController";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  const result = await searchQuestions(query);
  return new Response(JSON.stringify(result), { status: result.status });
}
