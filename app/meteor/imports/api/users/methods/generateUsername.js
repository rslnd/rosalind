// Suggests a login name from a person's name: lowercase initials of first +
// last name ("Anna Bauer" → "ab"), reduced to the characters the username
// schema allows ([a-z0-9]). Falls back to whichever name part exists.
const clean = s => (s || '').toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '')

export const usernameInitials = ({ firstName, lastName } = {}) => {
  const f = clean(firstName)
  const l = clean(lastName)
  const initials = `${f.charAt(0)}${l.charAt(0)}`
  if (initials) { return initials }
  // Only one name (or none): use it directly, capped to a sane length.
  return (l || f).slice(0, 12)
}

// Returns the first free username: `base`, else `base2`, `base3`, …
// `isTaken(candidate)` returns true if a user with that username exists.
export const firstFreeUsername = (base, isTaken = () => false) => {
  if (!base) { return '' }
  if (!isTaken(base)) { return base }
  for (let i = 2; i < 1000; i++) {
    const candidate = `${base}${i}`
    if (!isTaken(candidate)) { return candidate }
  }
  return `${base}${Date.now()}` // pathological fallback
}
