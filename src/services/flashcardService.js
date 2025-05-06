import axios from "axios";

export async function generateFlashcards(text) {
  const res = await axios.post(
    "https://nougat-omega.vercel.app/nougat/cards",
    { text },
    { headers: { "Content-Type": "application/json" } }
  );
  // returns [{ front: "...", back: { definition: "...", "fill in the blank": "..." }}, …]
  return res.data.questions;
}
