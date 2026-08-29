import { normalizeLocationKey } from "./normalize";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function confirmedNeighborhoodLocation(
  formData: FormData,
  location: { state: string; city: string; neighborhood: string },
) {
  if (text(formData, "neighborhoodMapConfirmed") !== "1") return null;

  const latitude = Number(text(formData, "neighborhoodLatitude"));
  const longitude = Number(text(formData, "neighborhoodLongitude"));
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

  return {
    state: location.state.toUpperCase(),
    city: location.city,
    normalizedName: normalizeLocationKey(location.neighborhood),
    displayName: location.neighborhood,
    latitude,
    longitude,
    radiusMeters: 700,
    source: text(formData, "neighborhoodLocationSource") || null,
    sourceUrl: text(formData, "neighborhoodLocationSourceUrl") || null,
  };
}
