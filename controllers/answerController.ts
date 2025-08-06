import { prisma } from "@/lib/prisma";
import { sanitizeRichText } from "@/utils/sanitize";

// write an answer 
export const answerQuestion=async({questionslug,content,authorId})=>{
    if(!questionslug||!content) return {status:400,message:"Filds are required !"};
    
    // Sanitize content to prevent XSS
    const sanitizedContent = sanitizeRichText(content);
    
    try{
        const question=await prisma.question.findUnique({
            where:{slug:questionslug}
        })
        if(!question) return {status: 404, message: "Question not found!"}
        const answer=await prisma.answer.create({
            data:{
                content: sanitizedContent,
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

// update an answer

export const updateAnswer=async({answerId,authorId,newContent})=>{
    if(!answerId||!authorId||!newContent) return {status:400,message:"Filds are required !"};
    
    // Sanitize content to prevent XSS
    const sanitizedContent = sanitizeRichText(newContent);
    
    try{
        const existing=await prisma.answer.findUnique({
            where:{id:answerId}
        })
        if(!existing||existing.authorId!==authorId) return {status:400,message:"unauthorized or answer not found !"};
        const update=await prisma.answer.update({
            where:{id:answerId},
            data:{content: sanitizedContent},
            include:{
                author:{
                    select:{
                        name:true,
                        email:true
                    }
                }
            }
        })

        return {status:200,message:"Answer is updated successfully",update};
    }
    catch(error){
        console.log(error);
        return {status:500,message:"Server error !"};
    }
}

// delete the answer

export const deleteAnswer=async({answerId,authorId})=>{
    console.log("answerId: ",answerId)
    // console.log("authorId: ",authorId)
    if(!answerId||!authorId) return {status:400,message:"Filds are required !"}
    try{
        const existing=await prisma.answer.findUnique({
            where:{id:answerId}
        })
        if(!existing||existing.authorId!==authorId) return{status:400,message:"unauthorized or answer not found !"};
        await prisma.answer.delete({
            where:{id:answerId}
        })
        return {status:200,message:'Answer deleted successfully !'};
    }
    catch(error){
        console.log(error);
        return {status:500,message:'server error'}
    }
}

// fething all the answers for an question

export const getAnswersByQuestionId = async (questionId) => {
  if (!questionId) return { status: 400, message: "Question ID is required" };

  try {
    const answers = await prisma.answer.findMany({
      where: { questionId },
      include: {
        question:{
            select:{
                title:true
            }
        },
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        comments: {
          select: {
            content: true,
            createdAt: true,
            author: {
              select: { name: true },
            },
          },
        },
        votes: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { status: 200, answers };
  } catch (error) {
    console.error(error);
    return { status: 500, message: "Server error!" };
  }
};

// get answers by user ID
export const getAnswersByUserId = async (userId) => {
  if (!userId) return { status: 400, message: "User ID is required" };

  try {
    const answers = await prisma.answer.findMany({
      where: { authorId: userId },
      include: {
        question: {
          select: {
            id: true,
            title: true,
            slug: true,
            tags: true,
          },
        },
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        comments: {
          select: {
            content: true,
            createdAt: true,
            author: {
              select: { name: true },
            },
          },
        },
        votes: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { status: 200, answers };
  } catch (error) {
    console.error(error);
    return { status: 500, message: "Server error!" };
  }
};
