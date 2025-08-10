import { getAnswersByUserId } from "@/controllers/answerController";

export async function GET(_, { params }) {
  const resolvedParams = await params;
  const { userId } = resolvedParams;
  const result = await getAnswersByUserId(userId);
  return new Response(JSON.stringify(result), { status: result.status });
}
