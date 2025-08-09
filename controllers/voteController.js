import { prisma } from "@/lib/prisma";

const respond = (status, data = null, message = null, error = null) => ({ status, ...(message && { message }), ...(error && { error }), ...(data && data) });
const logError = (scope, err) => console.error(`[${scope}]`, err?.message || err);

export const vote = async ({ userId, voteType, questionId = null, answerId = null }) => {
    if (!userId || !voteType || (!questionId && !answerId)) return respond(400, null, "Missing required fields");
    if (!['UP', 'DOWN'].includes(voteType)) return respond(400, null, "Invalid vote type");
    try {
        const existingVote = await prisma.vote.findFirst({
            where: { userId, questionId: questionId || undefined, answerId: answerId || undefined },
        });
        if (existingVote) {
            const updated = await prisma.vote.update({
                where: { id: existingVote.id },
                data: { type: voteType },
                select: { id: true, type: true, questionId: true, answerId: true },
            });
            return respond(200, { vote: updated }, "Vote updated");
        }
        const created = await prisma.vote.create({
            data: { type: voteType, userId, questionId, answerId },
            select: { id: true, type: true, questionId: true, answerId: true },
        });
        return respond(201, { vote: created }, "Vote recorded");
    } catch (error) {
        logError('vote', error);
        return respond(500, null, "Internal server error");
    }
};


export const getVoteCount = async ({ questionId = null, answerId = null }) => {
    if (!questionId && !answerId) return respond(400, null, "questionId or answerId required");
    try {
        const votes = await prisma.vote.findMany({
            where: { questionId: questionId || undefined, answerId: answerId || undefined },
            select: { type: true },
        });
        const upvotes = votes.filter(v => v.type === 'UP').length;
        const downvotes = votes.filter(v => v.type === 'DOWN').length;
        return respond(200, { upvotes, downvotes, score: upvotes - downvotes });
    } catch (error) {
        logError('getVoteCount', error);
        return respond(500, null, "Internal server error");
    }
};

// Get user's vote for a specific question or answer
export const getUserVote = async ({ userId, questionId = null, answerId = null }) => {
    if (!userId || (!questionId && !answerId)) return respond(400, null, "userId and target id required");
    try {
        const userVote = await prisma.vote.findFirst({
            where: { userId, questionId: questionId || undefined, answerId: answerId || undefined },
            select: { type: true },
        });
        return respond(200, { userVote: userVote ? userVote.type : null });
    } catch (error) {
        logError('getUserVote', error);
        return respond(500, null, "Internal server error");
    }
};
