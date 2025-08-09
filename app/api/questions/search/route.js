import { searchQuestions } from "@/controllers/questionController";
import { rateLimit } from "@/middleware/rateLimit";

export async function GET(req) {
  const limited = rateLimit(req, { action: 'search' });
  if (limited) return limited.response;
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  const result = await searchQuestions(query);
  return new Response(JSON.stringify(result), { status: result.status });
}
