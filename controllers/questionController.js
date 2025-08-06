import { prisma } from "@/lib/prisma";
import { slugify } from "@/utils/slugify";
import { sanitizePlainText, sanitizeRichText } from "@/utils/sanitize";

export const createQuestion = async ({ title, content, tags, authorId })=>{
    if (!title || !content || !tags) return { status: 400, message: "fileds are required " };
    console.log("creating Question")
    
    // Sanitize inputs to prevent XSS
    const sanitizedTitle = sanitizePlainText(title);
    const sanitizedContent = sanitizeRichText(content);
    const sanitizedTags = Array.isArray(tags) 
        ? tags.map(tag => sanitizePlainText(tag))
        : [sanitizePlainText(tags)];
    
    try {
        const slug = slugify(sanitizedTitle);
        const tagRecords = await Promise.all(
            sanitizedTags.map(async (tagName) => {
                return prisma.tag.upsert({
                    where: { name: tagName },
                    update: {},
                    create: { name: tagName },
                });
            })
        );
        const question=await prisma.question.create({
            data:{
                title: sanitizedTitle,
                content: sanitizedContent,
                slug,
                authorId:authorId,
                tags:{
                    connect:tagRecords.map((tag)=>({id:tag.id})),
                },
            },
            include:{
                tags:true,
            }
        })
        return {status:200,message:"Your Question has been Posted",question}
    }
    catch(error){
        console.log(error)
        return {status:500,message:"Server Error !"}
    }
}

export const getAllQuestions = async ({ page = 1, limit = 10, sort = "latest" }) => {
  try {
    const skip = (page - 1) * limit;

    // 🔁 Dynamic sort logic
    let orderBy;
    if (sort === "liked") {
      orderBy = { vote: { _count: "desc" } };
    } else if (sort === "frequent") {
      orderBy = { answers: { _count: "desc" } };
    } else {
      orderBy = { createdAt: "desc" }; // default: latest
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        skip,
        take: limit,
        include: {
          author: { select: { id: true, name: true } },
          tags: true,
          // answers: true,
          _count: {
            select: {
              answers: true,
              comments: true,
              vote: true,
            },
          },
        },
        orderBy,
      }),
      prisma.question.count(),
    ]);

    return {
      status: 200,
      data: {
        questions,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching questions:", error);
    return { status: 500, message: "Internal Server Error" };
  }
};



export const getUserQuestions = async (userId) => {
  try {
    const questions = await prisma.question.findMany({
      where: {
        authorId: userId,
      },
      include: {
        author: { select: { id: true, name: true } },
        tags: true,
        _count: {
          select: {
            answers: true,
            comments: true,
            vote: true,
          },
        },
      },
    });

    return { status: 200, questions };
  } catch (error) {
    console.error("Error fetching user's questions:", error);
    return { status: 500, message: "Internal Server Error" };
  }
};


export const getQuestionBySlug = async (slug) => {
  try {
    const question = await prisma.question.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, name: true },
        },
        tags: true,
        answers: {
          include: {
            author: {
              select: { id: true, name: true },
            },
            comments: true,
            votes: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        comments: {
          include: {
            author: true,
          },
        },
        vote: true,
      },
    });

    if (!question) return { status: 404, message: "Question not found" };
    return { status: 200, question };
  } catch (error) {
    console.error("Error fetching question detail:", error);
    return { status: 500, message: "Internal Server Error" };
  }
};



export const getQuestionsByTag = async (tagName) => {
  if (!tagName) return { status: 400, message: "Tag is required." };

  try {
    const questions = await prisma.question.findMany({
      where: {
        tags: {
          some: {
            name: tagName,
          },
        },
      },
      include: {
        author: {
          select: { name: true, email: true },
        },
        tags: true,
        answers: true,
        vote: true,
      },
    });

    return { status: 200, data: questions };
  } catch (error) {
    console.log("Tag filter error:", error);
    return { status: 500, message: "Server error." };
  }
};



export const searchQuestions = async (query) => {
  if (!query) return { status: 400, message: "Query is required." };

  try {
    const questions = await prisma.question.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        author: {
          select: { name: true, email: true },
        },
        tags: true,
        answers: true,
        vote: true,
      },
    });

    return { status: 200, data: questions };
  } catch (error) {
    console.log("Search error:", error);
    return { status: 500, message: "Server error." };
  }
};

// Delete a question (only by the author)
export const deleteQuestion = async ({ questionId, authorId }) => {
  if (!questionId || !authorId) return { status: 400, message: "Question ID and Author ID are required." };

  try {
    // Find the question and verify ownership
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        answers: true,
        comments: true,
        vote: true,
      },
    });

    if (!question) return { status: 404, message: "Question not found." };
    if (question.authorId !== authorId) return { status: 403, message: "Unauthorized. You can only delete your own questions." };

    // Delete the question (this will cascade delete related answers, comments, votes due to Prisma schema)
    await prisma.question.delete({
      where: { id: questionId },
    });

    return { status: 200, message: "Question deleted successfully." };
  } catch (error) {
    console.error("Delete question error:", error);
    return { status: 500, message: "Server error." };
  }
};
