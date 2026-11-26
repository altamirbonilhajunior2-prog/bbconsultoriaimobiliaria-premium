export const maritalStatuses = ["Solteiro(a)", "Casado(a)", "União estável", "Divorciado(a)", "Separado(a)", "Viúvo(a)"] as const;

export function parsePersonalDetails(form: FormData) {
  const text = (key: string, max: number) => {
    const value = String(form.get(key) ?? "").trim();
    if (value.length > max) throw new Error(`Campo ${key} excede o tamanho permitido.`);
    return value || null;
  };
  const rawCpf = text("cpf", 14);
  const cpf = rawCpf?.replace(/[.\-\s]/g, "") || null;
  if (cpf) {
    if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) throw new Error("Confira o CPF informado.");
    for (const size of [9, 10]) {
      const sum = [...cpf.slice(0, size)].reduce((total, digit, index) => total + Number(digit) * (size + 1 - index), 0);
      const check = (sum * 10) % 11 % 10;
      if (check !== Number(cpf[size])) throw new Error("Confira o CPF informado.");
    }
  }
  const maritalStatus = text("maritalStatus", 40);
  if (maritalStatus && !(maritalStatuses as readonly string[]).includes(maritalStatus)) throw new Error("Confira o estado civil.");
  const rawIncome = text("monthlyIncome", 24);
  let monthlyIncome: string | null = null;
  if (rawIncome) {
    if (!/^(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{1,2})?$/.test(rawIncome) && !/^\d+(?:\.\d{1,2})?$/.test(rawIncome)) throw new Error("Informe a renda mensal em reais, por exemplo 5.000,00.");
    monthlyIncome = rawIncome.includes(",") || /^\d{1,3}(?:\.\d{3})+$/.test(rawIncome) ? rawIncome.replace(/\./g, "").replace(",", ".") : rawIncome;
    if (Number(monthlyIncome) >= 1e13) throw new Error("Renda mensal acima do limite permitido.");
  }
  const rawBirthDate = text("birthDate", 10);
  let birthDate: Date | null = null;
  if (rawBirthDate) {
    birthDate = new Date(`${rawBirthDate}T12:00:00-03:00`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(rawBirthDate) || Number.isNaN(birthDate.getTime()) || birthDate.toISOString().slice(0,10) !== rawBirthDate || rawBirthDate > new Date().toISOString().slice(0,10)) throw new Error("Confira a data de nascimento.");
  }
  return { cpf, rg: text("rg", 40), maritalStatus, profession: text("profession", 180), monthlyIncome, birthDate, address: text("address", 300) };
}
