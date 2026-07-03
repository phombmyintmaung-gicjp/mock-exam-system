import { useEffect, useState } from 'react';
import { KanjiVG, type KanjiData } from 'kanjivg-js';
import { KanjiCard } from 'kanjivg-js/react';

const kv = new KanjiVG();

interface KanjiStrokeOrderProps {
  character: string;
  size?: number;
}

// Renders an animated stroke-order diagram for a single kanji character.
export function KanjiStrokeOrder({ character, size = 72 }: KanjiStrokeOrderProps) {
  const [kanji, setKanji] = useState<KanjiData | null>(null);
  const [supported, setSupported] = useState(true);
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setKanji(null);

    kv.getKanji(character)
      .then((results) => {
        if (cancelled) return;
        if (!results.length) { setSupported(false); return; }
        setKanji(results[0]);
      })
      .catch(() => { if (!cancelled) setSupported(false); });

    return () => { cancelled = true; };
  }, [character]);

  if (!supported || !kanji) return null;

  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ width: size, height: size }}>
        <KanjiCard
          key={replayKey}
          kanji={kanji}
          animationOptions={{
            strokeSpeed: 800,
            strokeDelay: 300,
            showNumbers: false,
            showTrace: true,
            strokeStyling: {
              strokeColour: '#000000',
              strokeThickness: 5,
              strokeRadius: 0,
            },
            traceStyling: {
              traceColour: '#818181',
              traceThickness: 3,
              traceRadius: 0,
            },
          }}
        />
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setReplayKey((k) => k + 1);
        }}
        className="text-xs text-slate-400 transition-colors hover:text-amber-500"
        title="Replay stroke order"
      >
        ↺ {character}
      </button>
    </div>
  );
}
