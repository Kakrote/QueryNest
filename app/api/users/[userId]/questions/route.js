import { getUserQuestions } from "@/controllers/questionController";

export async function GET(_, { params }) {
  const resolvedParams = await params;
  const { userId } = resolvedParams;
  const result = await getUserQuestions(userId);
  return new Response(JSON.stringify(result), { status: result.status });
}
