import { Groq } from 'groq-sdk'; 
import { verifyAuth } from '@/middleware/auth'; 

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, 
});

export async function POST(req) {
  // Check if GROQ API key is configured
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
    return new Response(JSON.stringify({ 
      message: "GROQ API key not configured. Please add a valid GROQ_API_KEY to your .env.local file." 
    }), { status: 503 });
  }

  const user = await verifyAuth(req);
  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const { text, type } = await req.json();

  if (!text) {
    return new Response(JSON.stringify({ message: "No input text provided." }), { status: 400 });
  }

  try {
    let prompt;
    
    // Different prompts for different types of content
    if (type === 'tags') {
      prompt = `Correct the spelling of these comma-separated tags. Keep them as comma-separated tags, only fix spelling errors. Do not change the format or add explanations:\n\n${text}`;
    } else {
      prompt = `Correct the grammar, spelling, and logic of the following sentence. Return ONLY the corrected version, with NO explanation, quotes, or formatting:\n\n${text}`;
    }

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192", 
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature:0.3,
    });

    const corrected = completion.choices[0]?.message?.content;

    return new Response(JSON.stringify({ corrected }), { status: 200 });
  } catch (error) {
    console.error("Groq error:", error);
    
    // Handle specific Groq API errors
    if (error.status === 401) {
      return new Response(JSON.stringify({ 
        message: "Invalid GROQ API key. Please check your API key configuration." 
      }), { status: 503 });
    }
    
    return new Response(JSON.stringify({ 
      message: "Failed to correct text. Please try again later." 
    }), { status: 500 });
  }
}
