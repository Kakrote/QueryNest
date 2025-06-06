
import { prisma } from "@/lib/prisma";

export const createTag = async (name) => {
  if (!name) return { status: 400, message: "Tag name is required" };

  try {
    const tag = await prisma.tag.create({
      data: { name }
    });
    return { status: 201, message: "Tag created", tag };
  } catch (error) {
    console.error("Tag creation error:", error);
    return { status: 500, message: "Server error" };
  }
};


export const getAllTags = async () => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" }
    });
    return { status: 200, tags };
  } catch (error) {
    return { status: 500, message: "Server error" };
  }
};
