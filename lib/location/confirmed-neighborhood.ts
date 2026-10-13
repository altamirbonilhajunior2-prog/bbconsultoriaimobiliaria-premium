
import { normalizeLocationKey } from "./normalize";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

export function confirmedNeighborhoodLocation(
  formData: FormData,
  location: {
    state: string;
    city: string;
    neighborhood: string;
  },
) {
  // Somente aceita localizações confirmadas.
  if (text(formData, "neighborhoodMapConfirmed") !== "1") {
    return null;
  }

  const state = location.state.trim().toUpperCase();
  const city = location.city.trim();
  const neighborhood = location.neighborhood.trim();

  // Identificação da localização efetivamente pesquisada.
  const lookupState = text(
    formData,
    "neighborhoodLookupState",
  ).toUpperCase();

  const lookupCity = text(
    formData,
    "neighborhoodLookupCity",
  );

  const lookupNeighborhood = text(
    formData,
    "neighborhoodLookupName",
  );

  // Impede confirmação sem identificação completa.
  if (
    !state ||
    !city ||
    !neighborhood ||
    !lookupState ||
    !lookupCity ||
    !lookupNeighborhood
  ) {
    return null;
  }

  // Impede reutilizar localização de outro estado,
  // cidade ou bairro.
  const sameState = state === lookupState;

  const sameCity =
    normalizeLocationKey(city) ===
    normalizeLocationKey(lookupCity);

  const sameNeighborhood =
    normalizeLocationKey(neighborhood) ===
    normalizeLocationKey(lookupNeighborhood);

  if (!sameState || !sameCity || !sameNeighborhood) {
    return null;
  }

  // Não permite converter coordenadas vazias em zero.
  const latitudeText = text(
    formData,
    "neighborhoodLatitude",
  );

  const longitudeText = text(
    formData,
    "neighborhoodLongitude",
  );

  if (!latitudeText || !longitudeText) {
    return null;
  }

  const latitude = Number(latitudeText);
  const longitude = Number(longitudeText);

  // Valida coordenadas geográficas.
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  // Descarta a coordenada nula (0, 0).
  if (latitude === 0 && longitude === 0) {
    return null;
  }

  return {
    state,
    city,
    normalizedName: normalizeLocationKey(neighborhood),
    displayName: neighborhood,
    latitude,
    longitude,
    radiusMeters: 700,
    source:
      text(formData, "neighborhoodLocationSource") || null,
    sourceUrl:
      text(formData, "neighborhoodLocationSourceUrl") || null,
  };
}
