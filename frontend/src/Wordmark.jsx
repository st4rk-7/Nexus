// Wordmark.jsx — the "nexus" logo, drawn as monoline strokes.
// With `draw`, it animates as if written by one pen line (login only).

import { useEffect, useRef } from "react";

function Wordmark({ draw = false, className = "wordmark" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!draw || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Each stroke takes time in proportion to its length; the next one starts
    // before the previous ends, so the word reads as one continuous line.
    let delay = 200;
    for (const path of ref.current.querySelectorAll("path")) {
      const length = path.getTotalLength();
      const duration = 260 + length * 1.4;
      path.style.strokeDasharray = length;
      path.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], {
        duration,
        delay,
        easing: "cubic-bezier(0.65, 0, 0.35, 1)",
        fill: "backwards",
      });
      delay += duration * 0.62;
    }
  }, [draw]);

  return (
    <svg ref={ref} className={className} viewBox="-10 0 425 120" role="img" aria-label="nexus">
      <path d="M10 100 V50 Q10 20 40 20 Q70 20 70 50 V100" />
      <path d="M100 62 H158 Q158 20 129 20 Q100 20 100 60 Q100 100 134 100 Q152 100 160 88" />
      <path d="M182 20 L238 100" />
      <path d="M238 20 L182 100" />
      <path d="M262 20 V62 Q262 100 292 100 Q322 100 322 62 V20 M322 62 V100" />
      <path d="M394 30 Q386 20 368 20 Q346 20 346 39 Q346 56 370 59 Q396 62 396 81 Q396 100 370 100 Q350 100 342 89" />
    </svg>
  );
}

export default Wordmark;
