import { prisma } from "@/lib/prisma";

export const answerQuestion=async({questionslug,content,authorId})=>{
    if(!questionslug||!content) return {status:400,message:"Filds are required !"};
    try{
        const question=await prisma.question.findUnique({
            where:{slug:questionslug}
        })
        if(!question) return {status: 404, message: "Question not found!"}
        const answer=await prisma.answer.create({
            data:{
                content,
                questionId:question.id,
                authorId:authorId
            },
            include:{
                question:true,
                author:true
            }
        });
        return {status:200,message:"Answer created successfully !",answer}
    }
    catch(err){
        console.log(err)
        return {status:500,message:"Server error !"}
    }
}