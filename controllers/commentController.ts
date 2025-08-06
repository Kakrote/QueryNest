import { prisma } from "@/lib/prisma";

export const makeComment = async ({ content, authorId, questionId = null, answerId = null }) => {
    console.log("content:",content)
    console.log("authorId:",authorId)
    if (!content || !authorId || (!questionId && !answerId)) {
        
        return { status: 400, message: "Missing required fields." };
    }
    try{
        const comment=await prisma.comment.create({
            data:{
                content,
                authorId,
                questionId,
                answerId
            },
            select:{
                id:true,
                content:true,
                createdAt:true,
                author:{
                   select:{
                    name:true,
                    email:true
                   }
                }
            }
        })
        return {status:200,message:"comment add !",comment}
    }
    catch (error){
        console.log(error);
        return {status:500,message:"Server error !"}
    }

}