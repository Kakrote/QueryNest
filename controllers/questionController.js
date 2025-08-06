import { prisma } from "@/lib/prisma";
import { slugify } from "@/utils/slugify";
import { sanitizeHtmlServer } from "@/utils/sanitizeHtml";

export const createQuestion = async ({ title, content, tags, authorId })=>{
    // Input validation
    if (!title || !content || !tags) return { status: 400, message: "fields are required " };
    if (!authorId) return { status: 401, message: "Authentication required" };
    
    // Validate title
    if (title.trim().length < 5) return { status: 400, message: "Title must be at least 5 characters long" };
    if (title.length > 200) return { status: 400, message: "Title is too long (max 200 characters)" };
    
    // Validate content
    if (content.trim().length < 10) return { status: 400, message: "Question content must be at least 10 characters long" };
    if (content.length > 5000) return { status: 400, message: "Question content is too long (max 5,000 characters)" };
    
    // Validate tags
    if (!Array.isArray(tags) || tags.length === 0) return { status: 400, message: "At least one tag is required" };
    if (tags.length > 10) return { status: 400, message: "Maximum 10 tags allowed" };
    
    // Validate individual tags
    for (const tag of tags) {
        if (typeof tag !== 'string' || tag.trim().length < 2) {
            return { status: 400, message: "Each tag must be at least 2 characters long" };
        }
        if (tag.length > 30) {
            return { status: 400, message: "Each tag must be maximum 30 characters long" };
        }
    }
    
    console.log("creating Question")
    try {
        // Sanitize the content to prevent XSS attacks
        const sanitizedContent = sanitizeHtmlServer(content);
        const sanitizedTitle = title.trim();
        
        // Check if sanitized content is valid
        if(sanitizedContent.trim().length < 5) {
            return {status:400,message:"Question content appears to be invalid or too short after processing"};
        }
        
        let slug = slugify(sanitizedTitle);
        
        // Check if slug already exists and make it unique
        let existingQuestion = await prisma.question.findUnique({
            where: { slug }
        });
        
        let counter = 1;
        let originalSlug = slug;
        
        // If slug exists, append a number to make it unique
        while (existingQuestion) {
            slug = `${originalSlug}-${counter}`;
            existingQuestion = await prisma.question.findUnique({
                where: { slug }
            });
            counter++;
            
            // Prevent infinite loop
            if (counter > 1000) {
                return { status: 500, message: "Unable to generate unique question URL" };
            }
        }
        
        const tagRecords = await Promise.all(
            tags.map(async (tagName) => {
                const cleanTag = tagName.trim().toLowerCase();
                return prisma.tag.upsert({
                    where: { name: cleanTag },
                    update: {},
                    create: { name: cleanTag },
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
        // Handle specific Prisma errors
        if (error.code === 'P2002') {
            return { status: 400, message: "A question with this title already exists" };
        }
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

export const getQuestionById = async (id) => {
  try {
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true },
        },
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

    if (!question) return { status: 404, message: "Question not found" };
    return { status: 200, question };
  } catch (error) {
    console.error("Error fetching question by ID:", error);
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
