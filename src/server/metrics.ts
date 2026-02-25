export function computeMetrics(params: {
  sentence: string;
  typed: string;
  startedAt: number;
  now: number;
}): { wpm: number; accuracy: number } {
  const { sentence, typed, startedAt, now } = params;
  const totalTyped = typed.length;
  const limit = Math.min(sentence.length, typed.length);

  let correctChars = 0;
  for (let i = 0; i < limit; i++) {
    if (typed[i] === sentence[i]) correctChars++;
  }
  const accuracy = totalTyped === 0 ? 0 : correctChars / totalTyped;

  const sentenceWords = sentence.trim().split(/\s+/);
  const typedWords = typed.trim().split(/\s+/);

  let correctWords = 0;
  const wordsToCheck = Math.min(sentenceWords.length, typedWords.length);

  for (let i = 0; i < wordsToCheck; i++) {
    if (typedWords[i] === sentenceWords[i]) correctWords++;
    else break;
  }

  const elapsedMs = Math.max(1, now - startedAt);
  const elapsedMin = elapsedMs / 60000;

  const wpm = elapsedMin > 0 ? correctWords / elapsedMin : 0;

  return { wpm, accuracy };
}
