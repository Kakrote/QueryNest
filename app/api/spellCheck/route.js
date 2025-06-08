import { Groq } from 'groq-sdk'; 
import { verifyAuth } from '@/middleware/auth'; 

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, /
});

export async function POST(req) {
  const user = await verifyAuth(req);
  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const { text } = await req.json();

  if (!text) {
    return new Response(JSON.stringify({ message: "No input text provided." }), { status: 400 });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192", 
      messages: [
        {
          role: "user",
          content: `Correct the spelling and grammar of this text:\n"${text}"`,
        },
      ],
    });

    const corrected = completion.choices[0]?.message?.content;

    return new Response(JSON.stringify({ corrected }), { status: 200 });
  } catch (error) {
    console.error("Groq error:", error);
    return new Response(JSON.stringify({ message: "Failed to correct text." }), { status: 500 });
  }
}
