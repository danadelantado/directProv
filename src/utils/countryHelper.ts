import { Carrier } from '../types';
import { getCarrierResidence } from './geoResidence';

export interface DynamicCountryInfo {
  name: string;
  flag: string;
  count: number;
  carriers: Carrier[];
  region?: string;
}

// Official mapping of country names and synonyms to flags & standard English names
export const COUNTRY_FLAG_MAP: Record<string, { flag: string; region: string; normalized: string; spanish: string }> = {
  // Europe
  'alemania': { flag: '🇩🇪', region: 'Europe', normalized: 'Germany', spanish: 'Alemania' },
  'germany': { flag: '🇩🇪', region: 'Europe', normalized: 'Germany', spanish: 'Alemania' },
  'deutschland': { flag: '🇩🇪', region: 'Europe', normalized: 'Germany', spanish: 'Alemania' },
  'austria': { flag: '🇦🇹', region: 'Europe', normalized: 'Austria', spanish: 'Austria' },
  'bélgica': { flag: '🇧🇪', region: 'Europe', normalized: 'Belgium', spanish: 'Bélgica' },
  'belgica': { flag: '🇧🇪', region: 'Europe', normalized: 'Belgium', spanish: 'Bélgica' },
  'belgium': { flag: '🇧🇪', region: 'Europe', normalized: 'Belgium', spanish: 'Bélgica' },
  'bulgaria': { flag: '🇧🇬', region: 'Europe', normalized: 'Bulgaria', spanish: 'Bulgaria' },
  'suiza': { flag: '🇨🇭', region: 'Europe', normalized: 'Switzerland', spanish: 'Suiza' },
  'switzerland': { flag: '🇨🇭', region: 'Europe', normalized: 'Switzerland', spanish: 'Suiza' },
  'polonia': { flag: '🇵🇱', region: 'Europe', normalized: 'Poland', spanish: 'Polonia' },
  'poland': { flag: '🇵🇱', region: 'Europe', normalized: 'Poland', spanish: 'Polonia' },
  'república checa': { flag: '🇨🇿', region: 'Europe', normalized: 'Czech Republic', spanish: 'República Checa' },
  'republica checa': { flag: '🇨🇿', region: 'Europe', normalized: 'Czech Republic', spanish: 'República Checa' },
  'czech republic': { flag: '🇨🇿', region: 'Europe', normalized: 'Czech Republic', spanish: 'República Checa' },
  'chequia': { flag: '🇨🇿', region: 'Europe', normalized: 'Czech Republic', spanish: 'República Checa' },
  'hungría': { flag: '🇭🇺', region: 'Europe', normalized: 'Hungary', spanish: 'Hungría' },
  'hungria': { flag: '🇭🇺', region: 'Europe', normalized: 'Hungary', spanish: 'Hungría' },
  'hungary': { flag: '🇭🇺', region: 'Europe', normalized: 'Hungary', spanish: 'Hungría' },
  'dinamarca': { flag: '🇩🇰', region: 'Europe', normalized: 'Denmark', spanish: 'Dinamarca' },
  'denmark': { flag: '🇩🇰', region: 'Europe', normalized: 'Denmark', spanish: 'Dinamarca' },
  'finlandia': { flag: '🇫🇮', region: 'Europe', normalized: 'Finland', spanish: 'Finlandia' },
  'finland': { flag: '🇫🇮', region: 'Europe', normalized: 'Finland', spanish: 'Finlandia' },
  'francia': { flag: '🇫🇷', region: 'Europe', normalized: 'France', spanish: 'Francia' },
  'france': { flag: '🇫🇷', region: 'Europe', normalized: 'France', spanish: 'Francia' },
  'grecia': { flag: '🇬🇷', region: 'Europe', normalized: 'Greece', spanish: 'Grecia' },
  'greece': { flag: '🇬🇷', region: 'Europe', normalized: 'Greece', spanish: 'Grecia' },
  'irlanda': { flag: '🇮🇪', region: 'Europe', normalized: 'Ireland', spanish: 'Irlanda' },
  'ireland': { flag: '🇮🇪', region: 'Europe', normalized: 'Ireland', spanish: 'Irlanda' },
  'italia': { flag: '🇮🇹', region: 'Europe', normalized: 'Italy', spanish: 'Italia' },
  'italy': { flag: '🇮🇹', region: 'Europe', normalized: 'Italy', spanish: 'Italia' },
  'españa': { flag: '🇪🇸', region: 'Europe', normalized: 'Spain', spanish: 'España' },
  'espana': { flag: '🇪🇸', region: 'Europe', normalized: 'Spain', spanish: 'España' },
  'spain': { flag: '🇪🇸', region: 'Europe', normalized: 'Spain', spanish: 'España' },
  'portugal': { flag: '🇵🇹', region: 'Europe', normalized: 'Portugal', spanish: 'Portugal' },
  'eslovaquia': { flag: '🇸🇰', region: 'Europe', normalized: 'Slovakia', spanish: 'Eslovaquia' },
  'slovakia': { flag: '🇸🇰', region: 'Europe', normalized: 'Slovakia', spanish: 'Eslovaquia' },
  'eslovenia': { flag: '🇸🇮', region: 'Europe', normalized: 'Slovenia', spanish: 'Eslovenia' },
  'slovenia': { flag: '🇸🇮', region: 'Europe', normalized: 'Slovenia', spanish: 'Eslovenia' },
  'rumania': { flag: '🇷🇴', region: 'Europe', normalized: 'Romania', spanish: 'Rumania' },
  'romania': { flag: '🇷🇴', region: 'Europe', normalized: 'Romania', spanish: 'Rumania' },
  'serbia': { flag: '🇷🇸', region: 'Europe', normalized: 'Serbia', spanish: 'Serbia' },
  'croacia': { flag: '🇭🇷', region: 'Europe', normalized: 'Croatia', spanish: 'Croacia' },
  'croatia': { flag: '🇭🇷', region: 'Europe', normalized: 'Croatia', spanish: 'Croacia' },
  'suecia': { flag: '🇸🇪', region: 'Europe', normalized: 'Sweden', spanish: 'Suecia' },
  'sweden': { flag: '🇸🇪', region: 'Europe', normalized: 'Sweden', spanish: 'Suecia' },
  'ucrania': { flag: '🇺🇦', region: 'Europe', normalized: 'Ukraine', spanish: 'Ucrania' },
  'ukraine': { flag: '🇺🇦', region: 'Europe', normalized: 'Ukraine', spanish: 'Ucrania' },
  'países bajos': { flag: '🇳🇱', region: 'Europe', normalized: 'Netherlands', spanish: 'Países Bajos' },
  'paises bajos': { flag: '🇳🇱', region: 'Europe', normalized: 'Netherlands', spanish: 'Países Bajos' },
  'holanda': { flag: '🇳🇱', region: 'Europe', normalized: 'Netherlands', spanish: 'Países Bajos' },
  'netherlands': { flag: '🇳🇱', region: 'Europe', normalized: 'Netherlands', spanish: 'Países Bajos' },
  'turquía': { flag: '🇹🇷', region: 'Europe', normalized: 'Turkey', spanish: 'Turquía' },
  'turquia': { flag: '🇹🇷', region: 'Europe', normalized: 'Turkey', spanish: 'Turquía' },
  'turkey': { flag: '🇹🇷', region: 'Europe', normalized: 'Turkey', spanish: 'Turquía' },
  'turkiye': { flag: '🇹🇷', region: 'Europe', normalized: 'Turkey', spanish: 'Turquía' },
  'reino unido': { flag: '🇬🇧', region: 'Europe', normalized: 'United Kingdom', spanish: 'Reino Unido' },
  'uk': { flag: '🇬🇧', region: 'Europe', normalized: 'United Kingdom', spanish: 'Reino Unido' },
  'united kingdom': { flag: '🇬🇧', region: 'Europe', normalized: 'United Kingdom', spanish: 'Reino Unido' },
  'georgia': { flag: '🇬🇪', region: 'Europe', normalized: 'Georgia', spanish: 'Georgia' },
  'monaco': { flag: '🇲🇨', region: 'Europe', normalized: 'Monaco', spanish: 'Mónaco' },
  'mónaco': { flag: '🇲🇨', region: 'Europe', normalized: 'Monaco', spanish: 'Mónaco' },

  // Asia
  'china': { flag: '🇨🇳', region: 'Asia', normalized: 'China', spanish: 'China' },
  'hong kong': { flag: '🇭🇰', region: 'Asia', normalized: 'Hong Kong', spanish: 'Hong Kong' },
  'india': { flag: '🇮🇳', region: 'Asia', normalized: 'India', spanish: 'India' },
  'vietnam': { flag: '🇻🇳', region: 'Asia', normalized: 'Vietnam', spanish: 'Vietnam' },
  'singapur': { flag: '🇸🇬', region: 'Asia', normalized: 'Singapore', spanish: 'Singapur' },
  'singapore': { flag: '🇸🇬', region: 'Asia', normalized: 'Singapore', spanish: 'Singapur' },
  'japón': { flag: '🇯🇵', region: 'Asia', normalized: 'Japan', spanish: 'Japón' },
  'japon': { flag: '🇯🇵', region: 'Asia', normalized: 'Japan', spanish: 'Japón' },
  'japan': { flag: '🇯🇵', region: 'Asia', normalized: 'Japan', spanish: 'Japón' },
  'corea del sur': { flag: '🇰🇷', region: 'Asia', normalized: 'South Korea', spanish: 'Corea del Sur' },
  'south korea': { flag: '🇰🇷', region: 'Asia', normalized: 'South Korea', spanish: 'Corea del Sur' },
  'taiwan': { flag: '🇹🇼', region: 'Asia', normalized: 'Taiwan', spanish: 'Taiwán' },
  'taiwán': { flag: '🇹🇼', region: 'Asia', normalized: 'Taiwan', spanish: 'Taiwán' },
  'tailandia': { flag: '🇹🇭', region: 'Asia', normalized: 'Thailand', spanish: 'Tailandia' },
  'thailand': { flag: '🇹🇭', region: 'Asia', normalized: 'Thailand', spanish: 'Tailandia' },

  // Middle East & Africa
  'emiratos árabes unidos': { flag: '🇦🇪', region: 'Middle East & Africa', normalized: 'UAE', spanish: 'Emiratos Árabes Unidos' },
  'emiratos arabes unidos': { flag: '🇦🇪', region: 'Middle East & Africa', normalized: 'UAE', spanish: 'Emiratos Árabes Unidos' },
  'emiratos árabes': { flag: '🇦🇪', region: 'Middle East & Africa', normalized: 'UAE', spanish: 'Emiratos Árabes Unidos' },
  'emiratos arabes': { flag: '🇦🇪', region: 'Middle East & Africa', normalized: 'UAE', spanish: 'Emiratos Árabes Unidos' },
  'dubai': { flag: '🇦🇪', region: 'Middle East & Africa', normalized: 'UAE', spanish: 'Emiratos Árabes Unidos' },
  'uae': { flag: '🇦🇪', region: 'Middle East & Africa', normalized: 'UAE', spanish: 'Emiratos Árabes Unidos' },
  'marruecos': { flag: '🇲🇦', region: 'Middle East & Africa', normalized: 'Morocco', spanish: 'Marruecos' },
  'morocco': { flag: '🇲🇦', region: 'Middle East & Africa', normalized: 'Morocco', spanish: 'Marruecos' },
  'jordania': { flag: '🇯🇴', region: 'Middle East & Africa', normalized: 'Jordan', spanish: 'Jordania' },
  'jordan': { flag: '🇯🇴', region: 'Middle East & Africa', normalized: 'Jordan', spanish: 'Jordania' },

  // America
  'estados unidos': { flag: '🇺🇸', region: 'USA - MEX', normalized: 'United States', spanish: 'Estados Unidos' },
  'usa': { flag: '🇺🇸', region: 'USA - MEX', normalized: 'United States', spanish: 'Estados Unidos' },
  'eeuu': { flag: '🇺🇸', region: 'USA - MEX', normalized: 'United States', spanish: 'Estados Unidos' },
  'united states': { flag: '🇺🇸', region: 'USA - MEX', normalized: 'United States', spanish: 'Estados Unidos' },
  'méxico': { flag: '🇲🇽', region: 'Mexico / Local', normalized: 'Mexico', spanish: 'México' },
  'mexico': { flag: '🇲🇽', region: 'Mexico / Local', normalized: 'Mexico', spanish: 'México' },
  'canadá': { flag: '🇨🇦', region: 'USA - MEX', normalized: 'Canada', spanish: 'Canadá' },
  'canada': { flag: '🇨🇦', region: 'USA - MEX', normalized: 'Canada', spanish: 'Canadá' },
  'brasil': { flag: '🇧🇷', region: 'South America', normalized: 'Brazil', spanish: 'Brasil' },
  'brazil': { flag: '🇧🇷', region: 'South America', normalized: 'Brazil', spanish: 'Brasil' },
  'honduras': { flag: '🇭🇳', region: 'South America', normalized: 'Honduras', spanish: 'Honduras' },
  'chile': { flag: '🇨🇱', region: 'South America', normalized: 'Chile', spanish: 'Chile' },
  'colombia': { flag: '🇨🇴', region: 'South America', normalized: 'Colombia', spanish: 'Colombia' },
};

/**
 * Words that are regions/continents, not countries.
 * Never match these as countries.
 */
const NON_COUNTRY_WORDS = new Set([
  'asia', 'europa', 'america', 'américa', 'norteamerica', 'norteamérica',
  'sudamerica', 'sudamérica', 'global', 'cualquier país', 'cualquier pais',
  'internacional', 'península ibérica', 'peninsula iberica', 'nórdicos',
  'nordicos', 'balcanes', 'medio oriente', 'africa', 'áfrica', 'centroamerica',
  'centroamérica', 'latam', 'latinoamerica', 'latinoamérica', 'asia pacífico', 'asia pacifico'
]);

/**
 * Resolves flag and normalized name for any valid country string
 */
export function getCountryMeta(countryStr: string): { flag: string; region: string; normalized: string } | null {
  if (!countryStr) return null;
  const clean = countryStr.toLowerCase().trim();
  
  // Filter out continents or general terms
  if (NON_COUNTRY_WORDS.has(clean)) return null;

  // Exact match
  if (COUNTRY_FLAG_MAP[clean]) {
    return COUNTRY_FLAG_MAP[clean];
  }

  // Exact word boundary match only
  for (const [key, meta] of Object.entries(COUNTRY_FLAG_MAP)) {
    if (clean === key) return meta;
  }

  return null;
}

/**
 * Dynamically extracts all verified countries serviced by the provided carriers list
 */
export function extractDynamicCountries(carriers: Carrier[]): DynamicCountryInfo[] {
  const countryMap = new Map<string, { flag: string; region: string; carriers: Carrier[] }>();

  carriers.forEach((carrier) => {
    if (!carrier.active) return;

    const carrierCountryKeys = new Set<string>();

    // 1. Primary Residence Country
    const residence = getCarrierResidence(carrier);
    if (residence && residence.country) {
      const meta = getCountryMeta(residence.country);
      if (meta) {
        carrierCountryKeys.add(meta.normalized);
      }
    }

    // 2. Hubs countries
    if (Array.isArray(carrier.hubs)) {
      carrier.hubs.forEach((h) => {
        if (h.country) {
          const meta = getCountryMeta(h.country);
          if (meta) {
            carrierCountryKeys.add(meta.normalized);
          }
        }
      });
    }

    // 3. Explicit country property
    if (carrier.country) {
      const meta = getCountryMeta(carrier.country);
      if (meta) {
        carrierCountryKeys.add(meta.normalized);
      }
    }

    // Add this carrier to each resolved country
    carrierCountryKeys.forEach((normName) => {
      const meta = Object.values(COUNTRY_FLAG_MAP).find((m) => m.normalized === normName);
      if (!meta) return;

      if (!countryMap.has(normName)) {
        countryMap.set(normName, {
          flag: meta.flag,
          region: meta.region,
          carriers: [],
        });
      }

      const entry = countryMap.get(normName)!;
      if (!entry.carriers.some((c) => c.id === carrier.id)) {
        entry.carriers.push(carrier);
      }
    });
  });

  // Convert to sorted array (highest carrier count first, then alphabetical)
  const result: DynamicCountryInfo[] = Array.from(countryMap.entries())
    .map(([name, data]) => ({
      name,
      flag: data.flag,
      count: data.carriers.length,
      carriers: data.carriers,
      region: data.region,
    }))
    .filter((c) => c.count > 0);

  result.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return result;
}
