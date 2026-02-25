export const sentences = [
  "The quick brown fox jumps over the lazy dog.",
  "Typing fast requires focus and accuracy.",
  "Next.js makes building full stack apps enjoyable.",
  "Real time applications are fun to build.",
  "Consistency beats intensity over the long run.",
  "Practice a little every day and you will improve quickly.",
];

export function getRandomSentence() {
  return sentences[Math.floor(Math.random() * sentences.length)];
}
