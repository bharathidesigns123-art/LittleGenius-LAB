export type NominatimAddress = {
  house_number?: string;
  building?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  quarter?: string;
  hamlet?: string;
  residential?: string;
  village?: string;
  town?: string;
  city?: string;
  city_district?: string;
  county?: string;
  municipality?: string;
  state_district?: string;
  state?: string;
  postcode?: string;
};

export type NominatimSearchHit = {
  display_name: string;
  address?: NominatimAddress;
};

export type IndianMappedAddressFields = {
  line1: string;
  city: string;
  state: string;
  pincode: string;
};

function partsAddressLine1(addr: NominatimAddress | undefined): string[] {
  if (!addr) {
    return [];
  }
  return [
    addr.house_number,
    addr.building,
    addr.road,
    addr.neighbourhood,
    addr.suburb,
    addr.quarter,
    addr.hamlet,
    addr.residential,
  ].filter((p): p is string => Boolean(p && p.trim()));
}

/** Maps a Nominatim search hit (India, addressdetails=1) to checkout-style fields. */
export function mapNominatimHitToIndianAddress(hit: NominatimSearchHit): IndianMappedAddressFields {
  const addr = hit.address;
  const lineParts = partsAddressLine1(addr);
  let line1 = lineParts.join(", ").trim();
  if (!line1 && hit.display_name) {
    line1 = hit.display_name.split(",").slice(0, 3).join(", ").trim();
  }

  const city =
    addr?.city?.trim() ||
    addr?.town?.trim() ||
    addr?.village?.trim() ||
    addr?.municipality?.trim() ||
    addr?.county?.trim() ||
    addr?.city_district?.trim() ||
    addr?.state_district?.trim() ||
    "";

  const state = addr?.state?.trim() ?? "";
  const rawPostcode = addr?.postcode?.replace(/\D/g, "") ?? "";
  const pincode = rawPostcode.slice(0, 6);

  return { line1, city, state, pincode };
}
