import * as logos from '../utils/logos.js';

export const BRANDS = [
  { id: 'sony', label: 'Sony', logo: logos.SONY_LOGO, defaultScale: 1.0 },
  { id: 'fuji', label: 'Fuji', logo: logos.FUJI_LOGO, defaultScale: 1.0 },
  { id: 'canon', label: 'Canon', logo: logos.CANON_LOGO, defaultScale: 1.0 },
  { id: 'nikon', label: 'Nikon', logo: logos.NIKON_LOGO, defaultScale: 5.0 },
  { id: 'gmaster', label: 'Gmaster', logo: logos.GM_LOGO, defaultScale: 1.0 },
  { id: 'sigma', label: 'Sigma', logo: logos.SIGMA_LOGO, defaultScale: 3.0 },
];

export const getBrand = (brandId) =>
  BRANDS.find((brand) => brand.id === brandId) ?? BRANDS[0];
