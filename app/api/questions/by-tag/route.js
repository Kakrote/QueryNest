import { getQuestionsByTag } from "@/controllers/questionController";

export async function GET(req) {
  const { searchParams } = new URL(req.url); // parameter se lega
  const tag = searchParams.get("tag");

  const result = await getQuestionsByTag(tag);
  return new Response(JSON.stringify(result), { status: result.status });
}
