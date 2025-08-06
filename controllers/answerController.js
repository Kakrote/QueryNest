import { prisma } from "@/lib/prisma";
import { sanitizeHtmlServer } from "@/utils/sanitizeHtml";

// write an answer 
export const answerQuestion=async({questionslug,content,authorId})=>{
    // Input validation
    if(!questionslug||!content) return {status:400,message:"Fields are required !"};
    if(!authorId) return {status:401,message:"Authentication required !"};
    
    // Content length validation
    if(content.trim().length < 10) return {status:400,message:"Answer must be at least 10 characters long !"};
    if(content.length > 10000) return {status:400,message:"Answer is too long (max 10,000 characters) !"};
    
    try{
        // Sanitize the content to prevent XSS attacks
        const sanitizedContent = sanitizeHtmlServer(content);
        
        // Check if sanitized content is too short after sanitization
        if(sanitizedContent.trim().length < 5) {
            return {status:400,message:"Answer content appears to be invalid or too short after processing !"};
        }
        
        const question=await prisma.question.findUnique({
            where:{slug:questionslug}
        })
        if(!question) return {status: 404, message: "Question not found!"}
        
        // Check if user already answered this question
        const existingAnswer = await prisma.answer.findFirst({
            where: {
                questionId: question.id,
                authorId: authorId
            }
        });
        
        // Allow multiple answers per user (common in Q&A platforms)
        // if(existingAnswer) return {status:400,message:"You have already answered this question !"};
        
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
    if(!answerId||!authorId||!newContent) return {status:400,message:"Fields are required !"};
    try{
        // Sanitize the content to prevent XSS attacks
        const sanitizedContent = sanitizeHtmlServer(newContent);
        
        const existing=await prisma.answer.findUnique({
            where:{id:answerId}
        })
        if(!existing||existing.authorId!==authorId) return {status:400,message:"unauthorized or answer not found !"};
        const update=await prisma.answer.update({
            where:{id:answerId},
            data:{content:sanitizedContent},
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
