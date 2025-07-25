import { prisma } from "@/lib/prisma";
import { slugify } from "@/utils/slugify";

export const createQuestion = async ({ title, content, tags, authorId })=>{
    if (!title || !content || !tags) return { status: 400, message: "fileds are required " };
    console.log("creating Question")
    try {
        const slug = slugify(title);
        const tagRecords = await Promise.all(
            tags.map(async (tagName) => {
                return prisma.tag.upsert({
                    where: { name: tagName },
                    update: {},
                    create: { name: tagName },
                });
            })
        );
        const question=await prisma.question.create({
            data:{
                title,
                content,
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
