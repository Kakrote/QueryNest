import { prisma } from "@/lib/prisma";
import { slugify } from "@/utils/slugify";
import { validateAndSanitizeForm, formSchemas } from "@/utils/validation";
import { sanitizeHtml } from "@/utils/sanitize";

const respond = (status, data = null, message = null, error = null) => ({ status, ...(message && { message }), ...(error && { error }), ...(data && data) });
const logError = (scope, err) => console.error(`[${scope}]`, err?.message || err);

export const createQuestion = async ({ title, content, tags, authorId }) => {
  if (!authorId) return respond(401, null, "Authentication required");
  const { isValid, sanitizedData, errors } = validateAndSanitizeForm({ title, content, tags: Array.isArray(tags) ? tags.join(",") : tags }, formSchemas.question);
  if (!isValid) return respond(400, null, null, errors);
  try {
    // Sanitize rich HTML content server-side
    const safeContent = sanitizeHtml(content);
    const { moderateContent } = await import("@/utils/groqModeration");
    const moderationResult = await moderateContent(safeContent);
    if (!moderationResult.isAppropriate) {
      return respond(403, null, `Question rejected: ${moderationResult.reason || 'Inappropriate content.'}`);
    }
    // Normalize tags: trim, lowercase, unique
    const rawTags = Array.isArray(tags) ? tags : sanitizedData.tags.split(/[,\s]+/);
    const normalizedTags = [...new Set(rawTags.filter(Boolean).map(t => t.trim().toLowerCase()))].slice(0, 10);
    if (!normalizedTags.length) return respond(400, null, "At least one tag required");

    // Ensure unique slug (increment suffix on collision)
    let baseSlug = slugify(title);
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await prisma.question.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${counter++}`;
      if (counter > 50) break; // fail-safe
    }

    const tagRecords = await Promise.all(
      normalizedTags.map(async (tagName) =>
        prisma.tag.upsert({ where: { name: tagName }, update: {}, create: { name: tagName } })
      )
    );

    const question = await prisma.question.create({
      data: {
        title: sanitizedData.title,
        content: safeContent,
        slug: uniqueSlug,
        authorId,
        tags: {
          connect: tagRecords.map((tag) => ({ id: tag.id })),
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        tags: true,
      },
    });
    return respond(201, { question }, "Question posted");
  } catch (error) {
    logError('createQuestion', error);
    return respond(500, null, "Internal server error");
  }
};

export const getAllQuestions = async ({ page = 1, limit = 10, sort = "latest" }) => {
  try {
    // For 'liked' sort, we need to fetch all questions first, calculate scores, then sort and paginate
    if (sort === "liked") {
      const [allQuestions, total] = await Promise.all([
        prisma.question.findMany({
          include: {
            author: { select: { id: true, name: true } },
            tags: true,
            vote: true, // Get all votes to calculate net score
            _count: {
              select: {
                answers: true,
                comments: true,
              },
            },
          },
          orderBy: { createdAt: "desc" }, // Default order for base query
        }),
        prisma.question.count(),
      ]);

      // Calculate net vote scores for each question
      const questionsWithScores = allQuestions.map(question => {
        const upvotes = question.vote.filter(v => v.type === 'UP').length;
        const downvotes = question.vote.filter(v => v.type === 'DOWN').length;
        const score = upvotes - downvotes;
        
        return {
          ...question,
          _count: {
            ...question._count,
            vote: score // Net score
          },
          netScore: score // Add explicit net score for sorting
        };
      });

      // Sort by net score (highest first)
      questionsWithScores.sort((a, b) => b.netScore - a.netScore);

      // Apply pagination after sorting
      const skip = (page - 1) * limit;
      const paginatedQuestions = questionsWithScores.slice(skip, skip + limit);

      return respond(200, { 
        questions: paginatedQuestions, 
        total, 
        page, 
        totalPages: Math.ceil(total / limit) 
      });
    }

    // For other sorts, use database-level sorting
    const skip = (page - 1) * limit;
    let orderBy;
    if (sort === "frequent") {
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
          vote: true, // Get all votes to calculate net score
          _count: {
            select: {
              answers: true,
              comments: true,
            },
          },
        },
        orderBy,
      }),
      prisma.question.count(),
    ]);

    // Calculate net vote scores for each question
    const questionsWithScores = questions.map(question => {
      const upvotes = question.vote.filter(v => v.type === 'UP').length;
      const downvotes = question.vote.filter(v => v.type === 'DOWN').length;
      const score = upvotes - downvotes;
      
      return {
        ...question,
        _count: {
          ...question._count,
          vote: score // Override with net score instead of total count
        }
      };
    });

    return respond(200, { 
      questions: questionsWithScores, 
      total, 
      page, 
      totalPages: Math.ceil(total / limit) 
    });
  } catch (error) {
    logError('getAllQuestions', error);
    return respond(500, null, "Internal server error");
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
        vote: true, // Get all votes to calculate net score
        _count: {
          select: {
            answers: true,
            comments: true,
          },
        },
      },
    });

    // Calculate net vote scores for each question
    const questionsWithScores = questions.map(question => {
      const upvotes = question.vote.filter(v => v.type === 'UP').length;
      const downvotes = question.vote.filter(v => v.type === 'DOWN').length;
      const score = upvotes - downvotes;
      
      return {
        ...question,
        _count: {
          ...question._count,
          vote: score // Override with net score instead of total count
        }
      };
    });

    return respond(200, { questions: questionsWithScores });
  } catch (error) {
    logError('getUserQuestions', error);
    return respond(500, null, "Internal server error");
  }
};


export const getQuestionBySlug = async (slug, { includeAnswers = true, answersLimit = 20 } = {}) => {
  try {
    const question = await prisma.question.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, name: true },
        },
        tags: true,
        ...(includeAnswers ? { answers: {
          include: {
            author: { select: { id: true, name: true } },
            comments: { take: 5, orderBy: { createdAt: 'desc' } },
            votes: true,
            _count: {
              select: {
                votes: true,
              },
            },
          },
          take: answersLimit,
          orderBy: { createdAt: 'desc' },
        }} : {}),
        comments: {
          include: {
            author: true,
          },
        },
        vote: true,
        _count: {
          select: {
            answers: true,
          },
        },
      },
    });

    if (!question) return respond(404, null, "Question not found");
    
    // Calculate net vote score for the question
    const upvotes = question.vote.filter(v => v.type === 'UP').length;
    const downvotes = question.vote.filter(v => v.type === 'DOWN').length;
    const questionScore = upvotes - downvotes;
    
    // Calculate net vote scores for answers if included
    let processedAnswers = question.answers;
    if (includeAnswers && question.answers) {
      processedAnswers = question.answers.map(answer => {
        const answerUpvotes = answer.votes.filter(v => v.type === 'UP').length;
        const answerDownvotes = answer.votes.filter(v => v.type === 'DOWN').length;
        const answerScore = answerUpvotes - answerDownvotes;
        
        return {
          ...answer,
          _count: {
            ...answer._count,
            vote: answerScore
          }
        };
      });
    }
    
    const processedQuestion = {
      ...question,
      answers: processedAnswers,
      _count: {
        ...question._count,
        vote: questionScore
      }
    };
    
    return respond(200, { question: processedQuestion });
  } catch (error) {
    logError('getQuestionBySlug', error);
    return respond(500, null, "Internal server error");
  }
};



export const getQuestionsByTag = async (tagName) => {
  if (!tagName) return respond(400, null, "Tag is required");

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

  return respond(200, { data: questions });
  } catch (error) {
  logError('getQuestionsByTag', error);
  return respond(500, null, "Internal server error");
  }
};



export const searchQuestions = async (query) => {
  if (!query) return respond(400, null, "Query is required");

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

  return respond(200, { data: questions });
  } catch (error) {
  logError('searchQuestions', error);
  return respond(500, null, "Internal server error");
  }
};

// Delete a question (only by the author)
export const deleteQuestion = async ({ questionId, authorId }) => {
  if (!questionId || !authorId) return respond(400, null, "Question ID and Author ID are required");

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

  if (!question) return respond(404, null, "Question not found");
  if (question.authorId !== authorId) return respond(403, null, "You can only delete your own questions");

    // Delete the question (this will cascade delete related answers, comments, votes due to Prisma schema)
    await prisma.question.delete({
      where: { id: questionId },
    });

  return respond(200, null, "Question deleted successfully");
  } catch (error) {
  logError('deleteQuestion', error);
  return respond(500, null, "Internal server error");
  }
};
