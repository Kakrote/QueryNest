import { getQuestionBySlug } from "@/controllers/questionController";

export async function GET(_, { params }) {
  const { slug } = params;
  const result = await getQuestionBySlug(slug);
  return new Response(JSON.stringify(result), { status: result.status });
}
