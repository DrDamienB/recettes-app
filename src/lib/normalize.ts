export function normalizeName(s: string) {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // accents
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim();
}
