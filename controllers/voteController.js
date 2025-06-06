import { prisma } from "@/lib/prisma";

export const vote = async ({ userId, voteType, questionId = null, answerId = null }) => {
    if (!userId || !voteType || (!questionId && !answerId)) return { status: 400, message: "Fileds are required" };
    try {
        const existingVote = await prisma.vote.findFirst({
            where: {
                userId: userId,
                questionId: questionId || undefined,
                answerId: answerId || undefined
            },
        })
        if (existingVote) {
            // update vote
            const updateVote = await prisma.vote.update({
                where: { id: existingVote.id },
                data: { type: voteType },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            })
            return { status: 200, message: "vote updated succesfuly", vote: updateVote }
        }
        // creating new vote
        const newVote = await prisma.vote.create({
            data: {
                type: voteType,
                userId,
                questionId,
                answerId,
            }
        })
        return { status: 200, message: "Voteing successfull ", vote: newVote }

    }
    catch (error) {
        console.log(error);
        return { status: 500, message: "Server Error" }
    }
}


export const getVoteCount = async ({ questionId = null, answerId = null }) => {
    if (!questionId && !answerId) {
        return { status: 400, message: "questionId or answerId is required." };
    }

    try {
        const votes = await prisma.vote.findMany({
            where: {
                questionId: questionId || undefined,
                answerId: answerId || undefined
            },
            include: {
                ...(questionId ? { question: true } : {}),
                ...(answerId ? { answer: true } : {}),
            }
        });


        const upvotes = votes.filter(v => v.type === "UP").length;
        const downvotes = votes.filter(v => v.type === "DOWN").length;

        return {
            status: 200,
            data: {
                upvotes,
                downvotes,
                total: upvotes - downvotes,
            },
        };
    } catch (error) {
        console.error("Vote count error:", error);
        return { status: 500, message: "Server error." };
    }
};
