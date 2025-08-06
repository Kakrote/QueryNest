import { getUserQuestions } from "@/controllers/questionController";

export async function GET(_, { params }) {
  const { userId } = params;
  const result = await getUserQuestions(userId);
  return new Response(JSON.stringify(result), { status: result.status });
}
