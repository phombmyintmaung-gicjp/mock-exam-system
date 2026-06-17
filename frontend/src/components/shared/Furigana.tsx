interface FuriganaProps {
  text: string;
  className?: string;
}

export function Furigana({ text, className }: FuriganaProps) {
  const parts = text.split(/(\{[^}]+\|[^}]+\})/g);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        const match = part.match(/^\{(.+)\|(.+)\}$/);
        if (match) {
          return (
            <ruby key={i}>
              {match[1]}
              <rt className="text-[0.6em] text-amber-600 dark:text-amber-400">{match[2]}</rt>
            </ruby>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
