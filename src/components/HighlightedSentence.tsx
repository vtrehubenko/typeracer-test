"use client";

export function HighlightedSentence({
  sentence,
  typed,
}: {
  sentence: string;
  typed: string;
}) {
  const chars = sentence.split("");
  const typedChars = typed.split("");

  return (
    <div className="font-mono whitespace-pre-wrap break-words">
      {chars.map((ch, i) => {
        const t = typedChars[i];

        const className =
          t == null ? "" : t === ch ? "bg-green-200" : "bg-red-200";

        return (
          <span key={i} className={className}>
            {ch}
          </span>
        );
      })}
    </div>
  );
}
