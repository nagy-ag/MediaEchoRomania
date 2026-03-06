"use client";

import { useEffect, useRef, useState, type ReactNode, type UIEvent } from "react";
import { cn } from "@/lib/utils";

type ScrollState = {
  atTop: boolean;
  atBottom: boolean;
};

function getScrollState(element: HTMLDivElement): ScrollState {
  const { scrollTop, scrollHeight, clientHeight } = element;
  const maxScrollTop = Math.max(scrollHeight - clientHeight, 0);
  const tolerance = 2;

  return {
    atTop: scrollTop <= tolerance,
    atBottom: maxScrollTop - scrollTop <= tolerance,
  };
}

export function ScrollShadowPanel({
  children,
  className,
  contentClassName,
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [{ atTop, atBottom }, setScrollState] = useState<ScrollState>({
    atTop: true,
    atBottom: false,
  });

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const updateState = () => {
      setScrollState(getScrollState(element));
    };

    updateState();

    const resizeObserver = new ResizeObserver(updateState);
    resizeObserver.observe(element);

    for (const child of Array.from(element.children)) {
      resizeObserver.observe(child);
    }

    window.addEventListener("resize", updateState);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateState);
    };
  }, [children]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setScrollState(getScrollState(event.currentTarget));
  };

  return (
    <div className={cn("relative min-h-0 flex-1 overflow-hidden", className)}>
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 z-10 h-10 rounded-t-[inherit] transition-opacity duration-[var(--motion-base)]",
          "scroll-shadow-top",
          atTop ? "opacity-0" : "opacity-100",
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 rounded-b-[inherit] transition-opacity duration-[var(--motion-base)]",
          "scroll-shadow-bottom",
          atBottom ? "opacity-0" : "opacity-100",
        )}
      />
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={cn(
          "scrollbar-thin h-full min-h-0 overflow-y-auto overscroll-contain pr-1",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

