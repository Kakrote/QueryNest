import { getQuestionsByTag } from "@/controllers/questionController";
import { rateLimit } from "@/middleware/rateLimit";

export async function GET(req) {
  const limited = rateLimit(req, { action: 'search' });
  if (limited) return limited.response;
  const { searchParams } = new URL(req.url); // parameter se lega
  const tag = searchParams.get("tag");

  const result = await getQuestionsByTag(tag);
  return new Response(JSON.stringify(result), { status: result.status });
}
