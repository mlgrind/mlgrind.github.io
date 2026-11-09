import { useState } from 'react';
import type { Lecture } from '../../data/lectures';

function fmt(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

interface Props {
  lecture: Lecture;
  title: string;
}

/**
 * Click-to-load YouTube lecture. Nothing is requested from YouTube until the
 * learner presses play (or a chapter); the embed then uses youtube-nocookie.
 * Captions are burned into the video, so YouTube captions stay off by default.
 */
export default function LecturePlayer({ lecture, title }: Props) {
  const [start, setStart] = useState<number | null>(null);

  const src =
    start === null
      ? null
      : `https://www.youtube-nocookie.com/embed/${lecture.videoId}?autoplay=1&rel=0&modestbranding=1&cc_load_policy=0&start=${start}`;

  return (
    <section
      aria-label={`${title} lecture`}
      className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-500 mb-8 overflow-hidden"
    >
      <div className="relative aspect-video bg-[#0c0f14]">
        {src ? (
          <iframe
            key={src}
            src={src}
            title={`${title} lecture`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setStart(0)}
            className="group absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-4 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-400"
            style={{
              background:
                'radial-gradient(ellipse at 20% 0%, rgba(108,92,231,.35), transparent 60%), radial-gradient(ellipse at 100% 100%, rgba(0,201,167,.18), transparent 55%), #0c0f14',
            }}
            aria-label={`Play the ${title} lecture (${fmt(lecture.durationSec)})`}
          >
            <span className="w-16 h-16 rounded-full bg-primary-500 group-hover:bg-primary-400 transition-colors flex items-center justify-center shadow-lg shadow-primary-900/40">
              <svg className="w-7 h-7 ml-1" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="text-center px-4">
              <span className="block font-mono text-xs tracking-[0.16em] uppercase text-primary-200">
                Animated lecture · {fmt(lecture.durationSec)}
              </span>
              <span className="block mt-1 text-lg font-semibold">{title}</span>
            </span>
          </button>
        )}
      </div>
      {lecture.chapters.length > 0 && (
        <ol className="flex flex-wrap gap-2 p-3 border-t border-gray-200 dark:border-dark-500">
          {lecture.chapters.map((c) => (
            <li key={c.start}>
              <button
                type="button"
                onClick={() => setStart(c.start)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                  start === c.start
                    ? 'border-primary-400 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-200'
                    : 'border-gray-200 dark:border-dark-500 text-gray-600 dark:text-dark-200 hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-200'
                }`}
              >
                <span className="font-mono text-gray-400 dark:text-dark-300 mr-1.5">{fmt(c.start)}</span>
                {c.title}
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
