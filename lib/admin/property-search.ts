type SearchableProperty = { code: string; title: string; development: string | null };

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, " ");
}

export function matchesAdminPropertySearch(property: SearchableProperty, query: string) {
  const search = normalize(query);
  if (!search) return true;
  const code = normalize(property.code).replace(/\s/g, "");
  const compact = search.replace(/\s/g, "");
  // A complete reference must not match a different property's longer reference.
  if (/^bb[a-z]\d+$/.test(compact)) return code === compact;
  if (code.includes(compact)) return true;
  const text = normalize(`${property.title} ${property.development ?? ""}`);
  return search.split(" ").every(word => text.includes(word));
}
