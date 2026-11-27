export type SheetItem = {
  kind: "info" | "text" | "checkbox" | "radio" | "select" | "signature";
  name: string;
  label: string;
  value: string;
  wide?: boolean;
  multiline?: boolean;
  checked?: boolean;
  options?: { value: string; label: string }[];
};
export type SheetModel = {
  title: string;
  code: string;
  notes?: string[];
  sections: { title: string; items: SheetItem[] }[];
};

// Read the current form, including unsaved edits. No client data is sent elsewhere.
export function readSheet(article: HTMLElement, code: string): SheetModel {
  const sections = Array.from(article.querySelectorAll("section")).map(section => {
    const items: SheetItem[] = [];
    const radioNames = new Set<string>();
    for (const element of section.querySelectorAll<HTMLElement>("[data-pdf-info], [data-pdf-signature], input, textarea, select")) {
      if (element.hasAttribute("data-pdf-info")) {
        items.push({kind:"info", name:"", label:element.querySelector("p")?.textContent?.trim() || "", value:element.querySelector<HTMLElement>("div")?.innerText.trim() || "", wide:element.className.includes("col-span-2")});
        continue;
      }
      if (element.hasAttribute("data-pdf-signature")) {
        const input = element.querySelector<HTMLInputElement>("input");
        items.push({kind:"signature", name:input?.name || "", label:element.dataset.pdfSignature || "Assinatura", value:input?.value || ""});
        continue;
      }
      if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)) continue;
      if (element instanceof HTMLInputElement && element.type === "hidden") continue;
      const label = element.closest("label");
      const labelText = label?.querySelector("span")?.textContent?.trim() || element.name;
      const item: SheetItem = {kind:"text", name:element.name, label:labelText, value:element.value, wide:label?.className.includes("col-span-2")};
      if (element instanceof HTMLInputElement && element.type === "radio") {
        if (radioNames.has(element.name)) continue;
        radioNames.add(element.name);
        const inputs = Array.from(section.querySelectorAll<HTMLInputElement>('input[type="radio"]')).filter(input => input.name === element.name);
        item.kind = "radio";
        item.label = label?.parentElement?.previousElementSibling?.textContent?.trim() || section.querySelector("h2")?.textContent?.trim() || "Opções";
        item.options = inputs.map(input => ({value:input.value, label:input.closest("label")?.textContent?.trim() || input.value}));
        item.value = inputs.find(input => input.checked)?.value || "";
        item.wide = true;
      } else if (element instanceof HTMLInputElement && element.type === "checkbox") {
        item.kind = "checkbox";
        item.checked = element.checked;
      } else if (element instanceof HTMLSelectElement) {
        item.kind = "select";
        item.options = Array.from(element.options).map(option => ({value:option.value,label:option.text}));
        item.wide = true;
      } else if (element instanceof HTMLTextAreaElement) {
        item.multiline = true;
        item.wide = true;
        // Keep Outros editable offline, even when not selected in the CRM.
        if (element.disabled) item.value = "";
      } else if (element instanceof HTMLInputElement && element.type === "date") {
        if (item.value) item.value = item.value.split("-").reverse().join("/");
        item.label += " (dd/mm/aaaa)";
      }
      items.push(item);
    }
    return {title:section.querySelector("h2")?.textContent?.trim() || "",items};
  }).filter(section => section.items.length);
  const notes = Array.from(article.children)
    .filter(element => (element.tagName === "P" || element.tagName === "DIV" || element.tagName === "FOOTER") && !element.querySelector("button"))
    .map(element => (element as HTMLElement).innerText.trim()).filter(Boolean);
  return {title:article.querySelector("h1")?.textContent?.trim() || "Ficha",code,sections,notes};
}
