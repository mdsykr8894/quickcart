export function formatUsername(username?: string | null): string {
  if (!username) return "user";
  return username.trim().replace(/^@+/, "");
}
