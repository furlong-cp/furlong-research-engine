
import { useEffect, useState } from "react";
import "./BootIntro.css";

type BootIntroProps = {
  onComplete: () => void;
};

const pieces = [
  { x: -74, y: -74, delay: 250 },
  { x: 0, y: -92, delay: 550 },
  { x: 74, y: -74, delay: 350 },
  { x: -92, y: 0, delay: 650 },
  { x: 0, y: 0, delay: 100 },
  { x: 92, y: 0, delay: 450 },
  { x: -74, y: 74, delay: 500 },
  { x: 0, y: 92, delay: 300 },
  { x: 74, y: 74, delay: 700 },
];

export default function BootIntro({ onComplete }: BootIntroProps) {
  const [assembled, setAssembled] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const assembleTimer = window.setTimeout(() => {
      setAssembled(true);
    }, 500);

    const revealTimer = window.setTimeout(() => {
      setRevealed(true);
    }, 3000);

    const exitTimer = window.setTimeout(() => {
      setExiting(true);
    }, 6500);

    const completeTimer = window.setTimeout(() => {
      onComplete();
    }, 7300);

    return () => {
      window.clearTimeout(assembleTimer);
      window.clearTimeout(revealTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`puzzle-intro${exiting ? " puzzle-intro--exit" : ""}`}
      aria-label="Furlong Research Engine"
      role="status"
    >
      <div className="puzzle-intro__grid" />
      <div className="puzzle-intro__glow" />

      <div className="puzzle-intro__content">
        <div className={`puzzle-mark${assembled ? " is-assembled" : ""}`}>
          <div className="puzzle-mark__pieces">
            {pieces.map((piece, index) => (
              <div
                key={index}
                className={`puzzle-piece puzzle-piece--${index + 1}`}
                style={{
                  "--piece-x": `${piece.x}px`,
                  "--piece-y": `${piece.y}px`,
                  "--piece-delay": `${piece.delay}ms`,
                } as React.CSSProperties}
              >
                <span />
              </div>
            ))}
          </div>

          <div className="puzzle-mark__center">F</div>
        </div>

        <div className={`puzzle-intro__wordmark${revealed ? " is-visible" : ""}`}>
          <div className="puzzle-intro__overline">
            INDEPENDENT QUANTITATIVE RESEARCH
          </div>

          <h1>
            FURLONG<span>.</span>
          </h1>

          <p>Where every piece finds its place.</p>
        </div>

        <div className={`puzzle-intro__bottom${revealed ? " is-visible" : ""}`}>
          <div className="puzzle-intro__progress">
            <div />
          </div>
          <div className="puzzle-intro__caption">
            <span>IDEAS INTO STRATEGIES</span>
            <span>EST. 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}