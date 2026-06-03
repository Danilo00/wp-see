const DEBUG_ENV = process.env.DEBUG_ENABLE === "true";
const DEBUG_LEVEL = Number(process.env.DEBUG_LEVEL ?? "4") || 4;

export function isDebugEnabled(): boolean {
  if (typeof window !== "undefined") {
    try {
      if (localStorage.getItem("DEBUG_ENABLE") === "true") return true;
    } catch {
      /* ignore */
    }
  }
  return DEBUG_ENV;
}

export function getDebugLevel(): number {
  if (typeof window !== "undefined") {
    try {
      const local = localStorage.getItem("DEBUG_LEVEL");
      if (local) return Number(local) || 4;
    } catch {
      /* ignore */
    }
  }
  return DEBUG_LEVEL;
}

export function debugLog(level: 1 | 2 | 3 | 4, scope: string, message: string, data?: unknown): void {
  if (!isDebugEnabled() || level > getDebugLevel()) return;
  const prefix = `[wp-see:${scope}]`;
  if (data !== undefined) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }
}
