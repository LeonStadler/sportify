import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface ScrollHeaderProps {
  scrollContainerRef?: React.RefObject<HTMLElement>;
}

export function ScrollHeader({ scrollContainerRef }: ScrollHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const internalRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = scrollContainerRef?.current || internalRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const maxScroll = scrollHeight - clientHeight;

      setIsScrolled(scrollPosition > 20);

      // Berechne Scroll-Fortschritt (0-100%)
      if (maxScroll > 0) {
        const progress = (scrollPosition / maxScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      } else {
        setScrollProgress(0);
      }
    };

    // Check initial scroll position
    handleScroll();

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [scrollContainerRef]);

  if (!isScrolled) return null;

  return (
    <div
      className={cn(
        "absolute top-0 left-0 right-0 z-50 transition-all duration-300",
        "h-[calc(4rem+var(--safe-area-top))] pt-[var(--safe-area-top)]",
        "pl-[var(--safe-area-left)] pr-[var(--safe-area-right)]",
        "bg-background/80 backdrop-blur-sm border-b border-border/50",
        "shadow-lg shadow-black/5 dark:shadow-black/20",
        isScrolled
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 -translate-y-full pointer-events-none"
      )}
      role="banner"
      aria-label="Scroll-Indikator"
    >
      {/* Scroll-Indikator am unteren Rand */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border/30">
        <div
          className="h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </div>
  );
}
