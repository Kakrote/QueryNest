import { vote,getVoteCount} from "@/controllers/voteController";
import { verifyAuth } from "@/middleware/auth";

export async function POST(req) {
    const user = await verifyAuth(req);
    if (!user) return new Response(JSON.stringify({ message: "Unauthorized " }), { status: 400 });
    try {
        const body = await req.json();
        const { voteType, questionId, answerId } = body;

        const result = await vote({
            userId: user.userId,
            voteType,
            questionId,
            answerId,
        });
        return new Response(JSON.stringify(result), {
            status: result.status,
        });
    }
    catch (error) {
        console.error("Error in vote API:", error);
        return new Response(JSON.stringify({ message: "Something went wrong" }), { status: 500 });
    }
}



export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const questionId = searchParams.get("questionId");
  const answerId = searchParams.get("answerId");

  const result = await getVoteCount({ questionId, answerId });

  return new Response(JSON.stringify(result), {
    status: result.status,
  });
}
