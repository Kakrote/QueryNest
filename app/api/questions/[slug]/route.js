import { getQuestionBySlug } from "@/controllers/questionController";

export async function GET(_, { params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const result = await getQuestionBySlug(slug);
  return new Response(JSON.stringify(result), { status: result.status });
}
