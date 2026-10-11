import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
children?: ReactNode;
front?: ReactNode;
back?: ReactNode;
delay?: number;
className?: string;
};

export default function Reveal({
children,
front,
back,
delay = 0,
className = "",
}: RevealProps) {
const ref = useRef<HTMLDivElement>(null);
const [shown, setShown] = useState(false);
const [flipped, setFlipped] = useState(false);

useEffect(() => {
const el = ref.current;
if (!el) return;

const io = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting) {
      setShown(true);
      io.disconnect();
    }
  },
  { threshold: 0.15 }
);

io.observe(el);
return () => io.disconnect();


}, []);

const isFlipCard = front !== undefined || back !== undefined;

if (isFlipCard) {
return (
<div
ref={ref}
className={`reveal ${shown ? "in" : ""} ${className}`}
style={{ transitionDelay: `${delay}ms` }}
>
<button
type="button"
className={`reveal-flip-card ${flipped ? "is-flipped" : ""}`}
onClick={() => setFlipped((value) => !value)}
aria-label={flipped ? "Show front of card" : "Show back of card"}
> <span className="reveal-flip-front">
{front} </span> <span className="reveal-flip-back">
{back} </span> </button> </div>
);
}

return (
<div
ref={ref}
className={`reveal ${shown ? "in" : ""} ${className}`}
style={{ transitionDelay: `${delay}ms` }}
>
{children} </div>
);
}

export function CountUp({
to,
duration = 1200,
}: {
to: number;
duration?: number;
}) {
const ref = useRef<HTMLSpanElement>(null);
const [val, setVal] = useState(0);

useEffect(() => {
const el = ref.current;
if (!el) return;


let raf = 0;

const io = new IntersectionObserver(
  ([entry]) => {
    if (!entry.isIntersecting) return;
    io.disconnect();

    const start = performance.now();

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));

      if (p < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
  },
  { threshold: 0.5 }
);

io.observe(el);

return () => {
  io.disconnect();
  cancelAnimationFrame(raf);
};

}, [to, duration]);

return <span ref={ref}>{val}</span>;
}
