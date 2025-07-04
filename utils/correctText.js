import axios from "axios";

export const correctText = async (text) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post("/api/spellCheck", { text },{
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data.corrected || text;
  } catch (error) {
    console.error("Correction API failed:", error);
    return text; // fallback: original text
  }
};
