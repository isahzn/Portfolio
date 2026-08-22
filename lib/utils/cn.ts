/**
 * Minimal className combiner.
 *
 * Joins truthy class strings without any external dependency
 * (no clsx / tailwind-merge needed for this project's size).
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
