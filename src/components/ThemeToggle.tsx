"use client";

import { useSyncExternalStore } from "react";

type Theme = "system" | "light" | "dark";
const KEY = "mapo-hygiene-theme";
const listeners = new Set<() => void>();

function read(): Theme {
  try {
    const t = localStorage.getItem(KEY);
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function apply(t: Theme) {
  try {
    if (t === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, t);
  } catch {}
  if (t === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", t);
  listeners.forEach((l) => l());
}

const ORDER: Theme[] = ["system", "light", "dark"];
const LABEL: Record<Theme, string> = { system: "자동", light: "밝게", dark: "어둡게" };

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, read, () => "system" as Theme);
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
  return (
    <button
      type="button"
      className={`btn btn-sm ${className}`}
      onClick={() => apply(next)}
      aria-label={`화면 밝기: ${LABEL[theme]}. 누르면 ${LABEL[next]}`}
      title="밝게/어둡게"
    >
      <span aria-hidden>{theme === "dark" ? "☾" : theme === "light" ? "☼" : "◐"}</span> {LABEL[theme]}
    </button>
  );
}
