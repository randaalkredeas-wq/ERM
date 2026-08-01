import "server-only";

/** Generates the next sequential `${prefix}-####` code from existing codes. */
export function nextCode(existingCodes: string[], prefix: string): string {
  const max = existingCodes.reduce((acc, code) => {
    const num = Number(code.replace(`${prefix}-`, ""));
    return Number.isFinite(num) ? Math.max(acc, num) : acc;
  }, 1000);
  return `${prefix}-${max + 1}`;
}
