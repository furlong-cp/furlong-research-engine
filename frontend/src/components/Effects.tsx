
import React, {
  useEffect,
  useRef,
  useState,
} from "react";

type WrapperProps = {
  children: React.ReactNode;
  className?: string;
};

/* =========================================
   CURSOR GLOW
   Smooth mouse-following ambient glow
========================================= */

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;

    if (!glow) return;

    const media = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const handleMove = (event: MouseEvent) => {
      if (media.matches) return;

      glow.style.setProperty("--cursor-x", `${event.clientX}px`);
      glow.style.setProperty("--cursor-y", `${event.clientY}px`);
      glow.style.opacity = "1";
    };

    const handleLeave = () => {
      glow.style.opacity = "0";
    };

    window.addEventListener("mousemove", handleMove, {
      passive: true,
    });

    document.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="cursor-glow"
      aria-hidden="true"
    />
  );
}

/* =========================================
   3D TILT
   Direct DOM updates keep pointer movement
   from triggering React renders
========================================= */

export function Tilt({
  children,
  className = "",
}: WrapperProps) {
  const tiltRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const element = tiltRef.current;

    if (!element) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const rect = element.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    const rotateX = (0.5 - y) * 8;
    const rotateY = (x - 0.5) * 8;

    element.style.transform =
      `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    element.style.transition = "transform 80ms ease-out";
  };

  const resetTilt = () => {
    const element = tiltRef.current;

    if (!element) return;

    element.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg)";

    element.style.transition = "transform 350ms ease";
  };

  return (
    <div
      ref={tiltRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      style={{
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

/* =========================================
   FLIP CARD
   Keeps the existing flip-card CSS contract
========================================= */

export function FlipCard({
  children,
  className = "",
}: WrapperProps) {
  return (
    <div className={`flip-card ${className}`.trim()}>
      {children}
    </div>
  );
}

/* =========================================
   FLIP WORDS
   Rotating headline words with cleanup
========================================= */

type FlipWordsProps = {
  words: string[];
  className?: string;
};

export function FlipWords({
  words,
  className = "",
}: FlipWordsProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length < 2) {
      setIndex(0);
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    if (reducedMotion.matches) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, 2400);

    return () => window.clearInterval(timer);
  }, [words]);

  if (words.length === 0) {
    return null;
  }

  const activeWord = words[index % words.length];

  return (
    <span
      className={`flip-words ${className}`.trim()}
      key={activeWord}
      aria-live="polite"
    >
      {activeWord}
    </span>
  );
}