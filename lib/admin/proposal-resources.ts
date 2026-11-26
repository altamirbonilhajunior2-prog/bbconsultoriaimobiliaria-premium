export function parseOtherResources(formData: FormData): string | null {
  const selected = formData.get("usesOtherResources");
  if (selected !== "on" && selected !== "true" && selected !== "1") return null;
  const value = formData.get("otherResources");
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Especifique a origem dos outros recursos.");
  }
  const text = value.trim();
  if (text.length > 1000) throw new Error("Descreva os outros recursos em até 1.000 caracteres.");
  return text;
}
