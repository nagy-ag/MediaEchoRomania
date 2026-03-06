"use client";

import { useId, type MouseEvent as ReactMouseEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { flushSync } from "react-dom";

import { useUiPreferences } from "@/features/shell/ui-preferences";
import { cn } from "@/lib/utils";

type ThemeToggleEvent = ReactMouseEvent<HTMLButtonElement> | ReactKeyboardEvent<HTMLButtonElement>;

type ViewTransitionHandle = {
  ready: Promise<void>;
};

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => ViewTransitionHandle;
};

const themeTransitionDuration = 840;
const themeTransitionTiming = `${themeTransitionDuration}ms`;
const themeTransitionEasing = "cubic-bezier(0.22, 1, 0.36, 1)";

function getToggleOrigin(target: HTMLButtonElement) {
  const rect = target.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function getRevealRadius(x: number, y: number) {
  const distances = [
    Math.hypot(x, y),
    Math.hypot(window.innerWidth - x, y),
    Math.hypot(x, window.innerHeight - y),
    Math.hypot(window.innerWidth - x, window.innerHeight - y),
  ];

  return Math.max(...distances);
}

export function ThemeSwitcher() {
  const { setTheme, theme } = useUiPreferences();
  const isDark = theme === "dark";
  const moonMaskId = useId();

  const toggleTheme = (event: ThemeToggleEvent) => {
    const nextTheme = isDark ? "light" : "dark";
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const documentWithTransition = document as DocumentWithViewTransition;

    if (!documentWithTransition.startViewTransition || prefersReducedMotion) {
      setTheme(nextTheme);
      return;
    }

    const target = event.currentTarget;
    const { x, y } = getToggleOrigin(target);
    const radius = getRevealRadius(x, y);
    const root = document.documentElement;

    root.style.setProperty("--theme-transition-x", `${x}px`);
    root.style.setProperty("--theme-transition-y", `${y}px`);
    root.style.setProperty("--theme-transition-radius", `${radius}px`);

    const transition = documentWithTransition.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme);
      });
    });

    transition.ready.then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: themeTransitionDuration,
          easing: themeTransitionEasing,
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "group relative flex h-9 w-[62px] shrink-0 items-center rounded-full border border-[var(--border-soft)] p-[2px]",
        "transition-colors ease-[var(--ease-fluid)]",
        "bg-[var(--panel-subtle)]",
      )}
      style={{ transitionDuration: themeTransitionTiming }}
      aria-label="Toggle theme"
    >
      <div
        className={cn(
          "relative z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full transition-all ease-[var(--ease-fluid)]",
          isDark
            ? "translate-x-0 bg-[var(--panel-raised)] shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
            : "translate-x-[28px] border border-[color:rgba(24,24,22,0.08)] bg-[var(--panel-raised)] shadow-[0_2px_8px_rgba(24,24,22,0.12)]",
        )}
        style={{ transitionDuration: themeTransitionTiming }}
      >
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity",
            isDark ? "opacity-100" : "opacity-0",
          )}
          style={{ color: "var(--toggle-warm)", transitionDuration: themeTransitionTiming }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
            style={{ filter: "drop-shadow(0 0 4px var(--toggle-warm-shadow))" }}
          >
            <defs>
              <mask id={moonMaskId}>
                <rect width="24" height="24" fill="black" />
                <circle cx="10.9" cy="12" r="9.15" fill="white" />
                <circle cx="16.45" cy="9.35" r="8.35" fill="black" />
              </mask>
            </defs>
            <rect width="24" height="24" fill="currentColor" mask={`url(#${moonMaskId})`} />
          </svg>
        </div>

        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity",
            isDark ? "opacity-0" : "opacity-100",
          )}
          style={{ color: "var(--toggle-warm-strong)", transitionDuration: themeTransitionTiming }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
            style={{ filter: "drop-shadow(0 0 4px var(--toggle-warm-shadow))" }}
          >
            <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
          </svg>
        </div>
      </div>

      {[
        { right: 23, top: 9, size: 2.25 },
        { right: 18, top: 12, size: 1.5 },
        { right: 20, top: 16, size: 1.75 },
      ].map((star, index) => (
        <span
          key={index}
          className={cn(
            "absolute rounded-full transition-all",
            isDark ? "scale-100 opacity-80" : "scale-0 opacity-0",
          )}
          style={{
            width: star.size,
            height: star.size,
            right: star.right,
            top: star.top,
            backgroundColor: "var(--toggle-warm)",
            transitionDuration: themeTransitionTiming,
          }}
        />
      ))}
    </button>
  );
}
