
export type DevelopmentLocation = {
  state: string;
  city: string;
  neighborhood: string;
};

export type RegisteredDevelopment = DevelopmentLocation & {
  name: string;
  active: boolean;
};

export type PreviousDevelopment = DevelopmentLocation & {
  name: string | null;
};

type DevelopmentLookup = (params: {
  state: string;
  normalizedName: string;
}) => Promise<readonly RegisteredDevelopment[]>;

type ValidationParams = DevelopmentLocation & {
  requestedName: string | null;
  previous?: PreviousDevelopment;
  lookup: DevelopmentLookup;
};

export class DevelopmentSelectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DevelopmentSelectionError";
  }
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("pt-BR");
}

function sameLocation(
  first: DevelopmentLocation,
  second: DevelopmentLocation,
): boolean {
  return (
    first.state.trim().toUpperCase() ===
      second.state.trim().toUpperCase() &&
    normalizeText(first.city) ===
      normalizeText(second.city) &&
    normalizeText(first.neighborhood) ===
      normalizeText(second.neighborhood)
  );
}

export async function validatePropertyDevelopment({
  requestedName,
  state,
  city,
  neighborhood,
  previous,
  lookup,
}: ValidationParams): Promise<string | null> {
  const name = requestedName?.trim() ?? "";

  // Imóveis sem condomínio ou edifício são permitidos.
  if (!name) {
    return null;
  }

  if (name.length > 180) {
    throw new DevelopmentSelectionError(
      "O nome do condomínio ou edifício deve ter no máximo 180 caracteres.",
    );
  }

  const location: DevelopmentLocation = {
    state: state.trim().toUpperCase(),
    city: city.trim(),
    neighborhood: neighborhood.trim(),
  };

  if (
    location.state.length !== 2 ||
    !location.city ||
    !location.neighborhood
  ) {
    throw new DevelopmentSelectionError(
      "Informe corretamente estado, cidade e bairro antes de selecionar o condomínio ou edifício.",
    );
  }

  // Compatibilidade com imóveis antigos:
  // preserva o vínculo já salvo quando nem o empreendimento
  // nem a localização foram alterados.
  if (
    previous?.name &&
    normalizeText(previous.name) === normalizeText(name) &&
    sameLocation(previous, location)
  ) {
    return previous.name;
  }

  // Consulta somente candidatos da UF e do nome informado.
  // A rotina chamadora deve consultar o banco sem gravar dados.
  const candidates = await lookup({
    state: location.state,
    normalizedName: normalizeText(name),
  });

  // Confere também cidade, bairro, estado e situação ativa.
  const matchingDevelopment = candidates.find(
    (candidate) =>
      candidate.active &&
      normalizeText(candidate.name) ===
        normalizeText(name) &&
      sameLocation(candidate, location),
  );

  if (!matchingDevelopment) {
    throw new DevelopmentSelectionError(
      "O condomínio ou edifício selecionado não está cadastrado como ativo para esta cidade e bairro. Verifique a localização e selecione um empreendimento válido.",
    );
  }

  // Utiliza o nome oficial registrado no cadastro.
  return matchingDevelopment.name;
}
