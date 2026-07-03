/* ── Old implementation (CDN hanzi-writer) — replaced by kanjivg-js, kept for reference ──
import { useEffect, useRef, useState } from 'react';

// Loaded once from CDN — avoids esbuild/Vite bundling issues with the package
const CDN = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.3/dist/hanzi-writer.min.js';

let scriptPromise: Promise<void> | null = null;

function ensureScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof window !== 'undefined' && (window as any).HanziWriter) {
    scriptPromise = Promise.resolve();
    return scriptPromise;
  }
  scriptPromise = new Promise((resolve, reject) => {
    const tag = document.createElement('script');
    tag.src = CDN;
    tag.crossOrigin = 'anonymous';
    tag.onload = () => resolve();
    tag.onerror = () => reject(new Error('hanzi-writer CDN load failed'));
    document.head.appendChild(tag);
  });
  return scriptPromise;
}

interface KanjiStrokeOrderPropsOld {
  character: string;
  size?: number;
}

export function KanjiStrokeOrderOld({ character, size = 72 }: KanjiStrokeOrderPropsOld) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const writerRef = useRef<any>(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    const el = containerRef.current;
    el.innerHTML = '';
    writerRef.current = null;

    ensureScript()
      .then(() => {
        if (cancelled || !el) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const HW = (window as any).HanziWriter;
        if (!HW) { setSupported(false); return; }

        const writer = HW.create(el, character, {
          width: size,
          height: size,
          padding: 6,
          showOutline: true,
          showCharacter: false,
          strokeColor: '#334155',
          outlineColor: '#e2e8f0',
          strokeAnimationSpeed: 1,
          delayBetweenStrokes: 150,
          onLoadCharDataError: () => { if (!cancelled) setSupported(false); },
        });
        writerRef.current = writer;
        writer.animateCharacter();
      })
      .catch(() => { if (!cancelled) setSupported(false); });

    return () => {
      cancelled = true;
      el.innerHTML = '';
    };
  }, [character, size]);

  if (!supported) return null;

  return (
    <div className="flex flex-col items-center gap-1">
      <div ref={containerRef} style={{ width: size, height: size }} />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          writerRef.current?.animateCharacter();
        }}
        className="text-xs text-slate-400 transition-colors hover:text-amber-500"
        title="Replay stroke order"
      >
        ↺ {character}
      </button>
    </div>
  );
}
── end old implementation ── */

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
