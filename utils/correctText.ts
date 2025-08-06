import axios from "axios";

export const correctText = async (text, type = 'text') => {
  try {
    // Skip correction for empty or very short text
    if (!text || text.trim().length < 3) {
      return text;
    }

    const token = localStorage.getItem("token");
    console.log("Sending text for correction:", text, "Type:", type);
    
    const res = await axios.post("/api/spellCheck", { text, type }, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    
    console.log("Correction response:", res.data);
    return res.data.corrected || text;
  } catch (error) {
    console.error("Correction API failed:", error);
    console.error("Error details:", error.response?.data);
    return text; // fallback: original text
  }
};
