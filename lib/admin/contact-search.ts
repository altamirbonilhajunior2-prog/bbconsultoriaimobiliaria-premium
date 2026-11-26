import { Prisma } from "../../generated/prisma/client";

export function contactSearchTerm(query: string) {
  const text = query.trim().slice(0, 180);
  const digits = text.replace(/\D/g, "");
  const phone = digits.length > 0 && /^[\d\s()+.\-]+$/.test(text);
  const localDigits = /^55\d{10,11}$/.test(digits) ? digits.slice(2) : digits;
  const value = phone ? localDigits : text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ");
  return { phone, pattern: `%${value.replace(/[\\%_]/g, "\\$&")}%` };
}

export function contactSearchSql(table: "Client" | "PortalLead", query: string, access: {isAdmin:boolean;agentId:number|null}) {
  const term = contactSearchTerm(query);
  const relation = table === "Client" ? Prisma.sql`"Client"` : Prisma.sql`"PortalLead"`;
  const field = term.phone
    ? Prisma.sql`regexp_replace(phone, '[^0-9]', '', 'g')`
    : Prisma.sql`regexp_replace(translate(lower(name), 'áàâãäéèêëíìîïóòôõöúùûüç', 'aaaaaeeeeiiiiooooouuuuc'), '[[:space:]]+', ' ', 'g')`;
  return Prisma.sql`SELECT id FROM ${relation}
    WHERE (${access.isAdmin} OR "agentId" = ${access.agentId ?? -1})
      AND ${field} LIKE ${term.pattern}
    ORDER BY "updatedAt" DESC, id DESC LIMIT 250`;
}
