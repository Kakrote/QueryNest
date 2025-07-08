import { answerQuestion ,updateAnswer,deleteAnswer,getAnswersByQuestionId } from "@/controllers/answerController";
import { verifyAuth } from "@/middleware/auth";
import { use } from "react";

export async function POST(req) {
    const user = await verifyAuth(req)
    if (!user) return new Response(JSON.stringify({ message: "User unauthorized" }), { status: 400 });
    try {
        const body = await req.json();
        const { questionslug, content } = body;
        const result = await answerQuestion({
            questionslug,
            content,
            authorId: user.userId
        })
        return new Response(JSON.stringify(result), {
            status: result.status
        })
    }
    catch (error) {
        console.error("Error creating answer:", error);
        return new Response(JSON.stringify({ message: "Something went wrong." }), { status: 500 });
    }
}

export async function PUT(req) {
    const user=await verifyAuth(req);
    if(!user) return new Response(JSON.stringify({message:"User unauthorized"}), {status:400});
    try{
        const body=await req.json();
        const {answerId,newContent}=body;
        const result=await updateAnswer({
            answerId,
            authorId:user.userId,
            newContent:newContent
        });
        return new Response(JSON.stringify({result}))
    }
    catch(error){
        console.log(error)
        return new Response(JSON.stringify({message:"Something went wrong"}),{status:500})
    }
}

export async function DELETE(req) {
    const user = await verifyAuth(req);
    if (!user) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

    const { answerId} = await req.json();
    console.log("answerId: ",answerId)
    console.log("authorId:",user.userId)
    const result = await deleteAnswer({ answerId, authorId:user.userId });

    return new Response(JSON.stringify(result), { status: result.status });
}



export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const questionId = searchParams.get("questionId");// its id for feture checks

  const result = await getAnswersByQuestionId(questionId);

  return new Response(JSON.stringify(result), {
    status: result.status,
    headers: { "Content-Type": "application/json" },
  });
}
