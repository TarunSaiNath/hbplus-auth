const ALLOWED_DOMAIN = (
  process.env.EXPO_PUBLIC_ALLOWED_DOMAIN ?? "hbplus.fit"
).toLowerCase();

export const DOMAIN_ERROR_MESSAGE =
  "Access restricted. Please login using your official domain email.";

export function isAllowedEmail(
  email?: string | null,
  emailVerified?: boolean,
): boolean {
  // Must have an email and it must be verified
  if (!email || emailVerified !== true) return false;

  // Normalize
  const clean = email.trim().toLowerCase();

  // Find last @
  const at = clean.lastIndexOf("@");
  if (at < 1) return false;

  const domain = clean.slice(at + 1);

  // Exact match only
  return domain === ALLOWED_DOMAIN;
}
