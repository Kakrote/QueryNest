import { createTag, getAllTags } from "@/controllers/tagController";
import { verifyAuth } from "@/middleware/auth";

export async function POST(req) {
    const user = await verifyAuth(req);

    if (!user) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), {
            status: 401, // Use 401 for unauthorized
        });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || name.trim() === "") {
        return new Response(JSON.stringify({ message: "Tag name is required." }), {
            status: 400,
        });
    }

    const result = await createTag(name.trim());
    return new Response(JSON.stringify(result), {
        status: result.status,
    });
}

export async function GET() {
    const result = await getAllTags();
    return new Response(JSON.stringify(result), {
        status: result.status,
    });
}
