import { prisma } from "@/lib/prisma";
import { slugify } from "@/utils/slugify";

export const createQuestion = async ({ title, content, tags, authorId })=>{
    if (!title || !content || !tags) return { status: 400, message: "fileds are required " };
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
