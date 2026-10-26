import { Carrier } from '../types';

export interface GeoEntity {
  type: 'country' | 'continent';
  name: string;
  normalizedKey: string;
  flag?: string;
  continent?: string;
}

// Map of normalized country search keywords (Spanish, English, Native, Code) to standard English country names & continents
export const COUNTRY_DICTIONARY: Record<string, { country: string; continent: string; flag: string; spanish: string }> = {
  // Europe
  portugal: { country: 'Portugal', continent: 'Europe', flag: '🇵🇹', spanish: 'Portugal' },
  pt: { country: 'Portugal', continent: 'Europe', flag: '🇵🇹', spanish: 'Portugal' },

  españa: { country: 'Spain', continent: 'Europe', flag: '🇪🇸', spanish: 'España' },
  espana: { country: 'Spain', continent: 'Europe', flag: '🇪🇸', spanish: 'España' },
  spain: { country: 'Spain', continent: 'Europe', flag: '🇪🇸', spanish: 'España' },
  es: { country: 'Spain', continent: 'Europe', flag: '🇪🇸', spanish: 'España' },

  turquia: { country: 'Turkey', continent: 'Europe', flag: '🇹🇷', spanish: 'Turquía' },
  turquía: { country: 'Turkey', continent: 'Europe', flag: '🇹🇷', spanish: 'Turquía' },
  turkiye: { country: 'Turkey', continent: 'Europe', flag: '🇹🇷', spanish: 'Turquía' },
  turkey: { country: 'Turkey', continent: 'Europe', flag: '🇹🇷', spanish: 'Turquía' },
  tr: { country: 'Turkey', continent: 'Europe', flag: '🇹🇷', spanish: 'Turquía' },

  austria: { country: 'Austria', continent: 'Europe', flag: '🇦🇹', spanish: 'Austria' },
  österreich: { country: 'Austria', continent: 'Europe', flag: '🇦🇹', spanish: 'Austria' },
  osterreich: { country: 'Austria', continent: 'Europe', flag: '🇦🇹', spanish: 'Austria' },
  at: { country: 'Austria', continent: 'Europe', flag: '🇦🇹', spanish: 'Austria' },

  alemania: { country: 'Germany', continent: 'Europe', flag: '🇩🇪', spanish: 'Alemania' },
  germany: { country: 'Germany', continent: 'Europe', flag: '🇩🇪', spanish: 'Alemania' },
  deutschland: { country: 'Germany', continent: 'Europe', flag: '🇩🇪', spanish: 'Alemania' },
  de: { country: 'Germany', continent: 'Europe', flag: '🇩🇪', spanish: 'Alemania' },

  croacia: { country: 'Croatia', continent: 'Europe', flag: '🇭🇷', spanish: 'Croacia' },
  croatia: { country: 'Croatia', continent: 'Europe', flag: '🇭🇷', spanish: 'Croacia' },
  hr: { country: 'Croatia', continent: 'Europe', flag: '🇭🇷', spanish: 'Croacia' },

  'republica checa': { country: 'Czech Republic', continent: 'Europe', flag: '🇨🇿', spanish: 'República Checa' },
  'república checa': { country: 'Czech Republic', continent: 'Europe', flag: '🇨🇿', spanish: 'República Checa' },
  chequia: { country: 'Czech Republic', continent: 'Europe', flag: '🇨🇿', spanish: 'República Checa' },
  czech: { country: 'Czech Republic', continent: 'Europe', flag: '🇨🇿', spanish: 'República Checa' },
  'czech republic': { country: 'Czech Republic', continent: 'Europe', flag: '🇨🇿', spanish: 'República Checa' },
  cz: { country: 'Czech Republic', continent: 'Europe', flag: '🇨🇿', spanish: 'República Checa' },

  hungria: { country: 'Hungary', continent: 'Europe', flag: '🇭🇺', spanish: 'Hungría' },
  hungría: { country: 'Hungary', continent: 'Europe', flag: '🇭🇺', spanish: 'Hungría' },
  hungary: { country: 'Hungary', continent: 'Europe', flag: '🇭🇺', spanish: 'Hungría' },
  hu: { country: 'Hungary', continent: 'Europe', flag: '🇭🇺', spanish: 'Hungría' },

  polonia: { country: 'Poland', continent: 'Europe', flag: '🇵🇱', spanish: 'Polonia' },
  poland: { country: 'Poland', continent: 'Europe', flag: '🇵🇱', spanish: 'Polonia' },
  polska: { country: 'Poland', continent: 'Europe', flag: '🇵🇱', spanish: 'Polonia' },
  pl: { country: 'Poland', continent: 'Europe', flag: '🇵🇱', spanish: 'Polonia' },

  rumania: { country: 'Romania', continent: 'Europe', flag: '🇷🇴', spanish: 'Rumania' },
  romania: { country: 'Romania', continent: 'Europe', flag: '🇷🇴', spanish: 'Rumania' },
  ro: { country: 'Romania', continent: 'Europe', flag: '🇷🇴', spanish: 'Rumania' },

  serbia: { country: 'Serbia', continent: 'Europe', flag: '🇷🇸', spanish: 'Serbia' },
  rs: { country: 'Serbia', continent: 'Europe', flag: '🇷🇸', spanish: 'Serbia' },

  eslovaquia: { country: 'Slovakia', continent: 'Europe', flag: '🇸🇰', spanish: 'Eslovaquia' },
  slovakia: { country: 'Slovakia', continent: 'Europe', flag: '🇸🇰', spanish: 'Eslovaquia' },
  sk: { country: 'Slovakia', continent: 'Europe', flag: '🇸🇰', spanish: 'Eslovaquia' },

  eslovenia: { country: 'Slovenia', continent: 'Europe', flag: '🇸🇮', spanish: 'Eslovenia' },
  slovenia: { country: 'Slovenia', continent: 'Europe', flag: '🇸🇮', spanish: 'Eslovenia' },
  si: { country: 'Slovenia', continent: 'Europe', flag: '🇸🇮', spanish: 'Eslovenia' },

  suiza: { country: 'Switzerland', continent: 'Europe', flag: '🇨🇭', spanish: 'Suiza' },
  switzerland: { country: 'Switzerland', continent: 'Europe', flag: '🇨🇭', spanish: 'Suiza' },
  ch: { country: 'Switzerland', continent: 'Europe', flag: '🇨🇭', spanish: 'Suiza' },

  'reino unido': { country: 'United Kingdom', continent: 'Europe', flag: '🇬🇧', spanish: 'Reino Unido' },
  uk: { country: 'United Kingdom', continent: 'Europe', flag: '🇬🇧', spanish: 'Reino Unido' },
  'united kingdom': { country: 'United Kingdom', continent: 'Europe', flag: '🇬🇧', spanish: 'Reino Unido' },
  inglaterra: { country: 'United Kingdom', continent: 'Europe', flag: '🇬🇧', spanish: 'Reino Unido' },
  england: { country: 'United Kingdom', continent: 'Europe', flag: '🇬🇧', spanish: 'Reino Unido' },
  gb: { country: 'United Kingdom', continent: 'Europe', flag: '🇬🇧', spanish: 'Reino Unido' },

  ucrania: { country: 'Ukraine', continent: 'Europe', flag: '🇺🇦', spanish: 'Ucrania' },
  ukraine: { country: 'Ukraine', continent: 'Europe', flag: '🇺🇦', spanish: 'Ucrania' },
  ua: { country: 'Ukraine', continent: 'Europe', flag: '🇺🇦', spanish: 'Ucrania' },

  italia: { country: 'Italy', continent: 'Europe', flag: '🇮🇹', spanish: 'Italia' },
  italy: { country: 'Italy', continent: 'Europe', flag: '🇮🇹', spanish: 'Italia' },
  it: { country: 'Italy', continent: 'Europe', flag: '🇮🇹', spanish: 'Italia' },

  francia: { country: 'France', continent: 'Europe', flag: '🇫🇷', spanish: 'Francia' },
  france: { country: 'France', continent: 'Europe', flag: '🇫🇷', spanish: 'Francia' },
  fr: { country: 'France', continent: 'Europe', flag: '🇫🇷', spanish: 'Francia' },

  'paises bajos': { country: 'Netherlands', continent: 'Europe', flag: '🇳🇱', spanish: 'Países Bajos' },
  'países bajos': { country: 'Netherlands', continent: 'Europe', flag: '🇳🇱', spanish: 'Países Bajos' },
  holanda: { country: 'Netherlands', continent: 'Europe', flag: '🇳🇱', spanish: 'Países Bajos' },
  netherlands: { country: 'Netherlands', continent: 'Europe', flag: '🇳🇱', spanish: 'Países Bajos' },
  holland: { country: 'Netherlands', continent: 'Europe', flag: '🇳🇱', spanish: 'Países Bajos' },
  nl: { country: 'Netherlands', continent: 'Europe', flag: '🇳🇱', spanish: 'Países Bajos' },

  bélgica: { country: 'Belgium', continent: 'Europe', flag: '🇧🇪', spanish: 'Bélgica' },
  belgica: { country: 'Belgium', continent: 'Europe', flag: '🇧🇪', spanish: 'Bélgica' },
  belgium: { country: 'Belgium', continent: 'Europe', flag: '🇧🇪', spanish: 'Bélgica' },
  be: { country: 'Belgium', continent: 'Europe', flag: '🇧🇪', spanish: 'Bélgica' },

  bulgaria: { country: 'Bulgaria', continent: 'Europe', flag: '🇧🇬', spanish: 'Bulgaria' },
  bg: { country: 'Bulgaria', continent: 'Europe', flag: '🇧🇬', spanish: 'Bulgaria' },

  dinamarca: { country: 'Denmark', continent: 'Europe', flag: '🇩🇰', spanish: 'Dinamarca' },
  denmark: { country: 'Denmark', continent: 'Europe', flag: '🇩🇰', spanish: 'Dinamarca' },
  dk: { country: 'Denmark', continent: 'Europe', flag: '🇩🇰', spanish: 'Dinamarca' },

  finlandia: { country: 'Finland', continent: 'Europe', flag: '🇫🇮', spanish: 'Finlandia' },
  finland: { country: 'Finland', continent: 'Europe', flag: '🇫🇮', spanish: 'Finlandia' },
  fi: { country: 'Finland', continent: 'Europe', flag: '🇫🇮', spanish: 'Finlandia' },

  grecia: { country: 'Greece', continent: 'Europe', flag: '🇬🇷', spanish: 'Grecia' },
  greece: { country: 'Greece', continent: 'Europe', flag: '🇬🇷', spanish: 'Grecia' },
  gr: { country: 'Greece', continent: 'Europe', flag: '🇬🇷', spanish: 'Grecia' },

  irlanda: { country: 'Ireland', continent: 'Europe', flag: '🇮🇪', spanish: 'Irlanda' },
  ireland: { country: 'Ireland', continent: 'Europe', flag: '🇮🇪', spanish: 'Irlanda' },
  ie: { country: 'Ireland', continent: 'Europe', flag: '🇮🇪', spanish: 'Irlanda' },

  suecia: { country: 'Sweden', continent: 'Europe', flag: '🇸🇪', spanish: 'Suecia' },
  sweden: { country: 'Sweden', continent: 'Europe', flag: '🇸🇪', spanish: 'Suecia' },
  se: { country: 'Sweden', continent: 'Europe', flag: '🇸🇪', spanish: 'Suecia' },

  georgia: { country: 'Georgia', continent: 'Europe', flag: '🇬🇪', spanish: 'Georgia' },
  ge: { country: 'Georgia', continent: 'Europe', flag: '🇬🇪', spanish: 'Georgia' },
  monaco: { country: 'Monaco', continent: 'Europe', flag: '🇲🇨', spanish: 'Mónaco' },
  mónaco: { country: 'Monaco', continent: 'Europe', flag: '🇲🇨', spanish: 'Mónaco' },
  mc: { country: 'Monaco', continent: 'Europe', flag: '🇲🇨', spanish: 'Mónaco' },

  // Asia / Lejano Oriente
  china: { country: 'China', continent: 'Asia', flag: '🇨🇳', spanish: 'China' },
  cn: { country: 'China', continent: 'Asia', flag: '🇨🇳', spanish: 'China' },
  india: { country: 'India', continent: 'Asia', flag: '🇮🇳', spanish: 'India' },
  in: { country: 'India', continent: 'Asia', flag: '🇮🇳', spanish: 'India' },
  'hong kong': { country: 'Hong Kong', continent: 'Asia', flag: '🇭🇰', spanish: 'Hong Kong' },
  hongkong: { country: 'Hong Kong', continent: 'Asia', flag: '🇭🇰', spanish: 'Hong Kong' },
  hk: { country: 'Hong Kong', continent: 'Asia', flag: '🇭🇰', spanish: 'Hong Kong' },
  vietnam: { country: 'Vietnam', continent: 'Asia', flag: '🇻🇳', spanish: 'Vietnam' },
  vn: { country: 'Vietnam', continent: 'Asia', flag: '🇻🇳', spanish: 'Vietnam' },
  singapur: { country: 'Singapore', continent: 'Asia', flag: '🇸🇬', spanish: 'Singapur' },
  singapore: { country: 'Singapore', continent: 'Asia', flag: '🇸🇬', spanish: 'Singapur' },
  sg: { country: 'Singapore', continent: 'Asia', flag: '🇸🇬', spanish: 'Singapur' },
  japon: { country: 'Japan', continent: 'Asia', flag: '🇯🇵', spanish: 'Japón' },
  japón: { country: 'Japan', continent: 'Asia', flag: '🇯🇵', spanish: 'Japón' },
  japan: { country: 'Japan', continent: 'Asia', flag: '🇯🇵', spanish: 'Japón' },
  jp: { country: 'Japan', continent: 'Asia', flag: '🇯🇵', spanish: 'Japón' },
  'corea del sur': { country: 'South Korea', continent: 'Asia', flag: '🇰🇷', spanish: 'Corea del Sur' },
  'south korea': { country: 'South Korea', continent: 'Asia', flag: '🇰🇷', spanish: 'Corea del Sur' },
  taiwan: { country: 'Taiwan', continent: 'Asia', flag: '🇹🇼', spanish: 'Taiwán' },
  taiwán: { country: 'Taiwan', continent: 'Asia', flag: '🇹🇼', spanish: 'Taiwán' },
  tw: { country: 'Taiwan', continent: 'Asia', flag: '🇹🇼', spanish: 'Taiwán' },
  thailand: { country: 'Thailand', continent: 'Asia', flag: '🇹🇭', spanish: 'Tailandia' },
  tailandia: { country: 'Thailand', continent: 'Asia', flag: '🇹🇭', spanish: 'Tailandia' },
  pakistan: { country: 'Pakistan', continent: 'Asia', flag: '🇵🇰', spanish: 'Pakistán' },
  pakistán: { country: 'Pakistan', continent: 'Asia', flag: '🇵🇰', spanish: 'Pakistán' },
  pk: { country: 'Pakistan', continent: 'Asia', flag: '🇵🇰', spanish: 'Pakistán' },
  bangladesh: { country: 'Bangladesh', continent: 'Asia', flag: '🇧🇩', spanish: 'Bangladés' },
  bangladés: { country: 'Bangladesh', continent: 'Asia', flag: '🇧🇩', spanish: 'Bangladés' },
  bd: { country: 'Bangladesh', continent: 'Asia', flag: '🇧🇩', spanish: 'Bangladés' },

  // Middle East & Africa
  'emiratos arabes unidos': { country: 'UAE', continent: 'Middle East & Africa', flag: '🇦🇪', spanish: 'Emiratos Árabes Unidos' },
  'emiratos árabes unidos': { country: 'UAE', continent: 'Middle East & Africa', flag: '🇦🇪', spanish: 'Emiratos Árabes Unidos' },
  'emiratos arabes': { country: 'UAE', continent: 'Middle East & Africa', flag: '🇦🇪', spanish: 'Emiratos Árabes Unidos' },
  'emiratos árabes': { country: 'UAE', continent: 'Middle East & Africa', flag: '🇦🇪', spanish: 'Emiratos Árabes Unidos' },
  emiratos: { country: 'UAE', continent: 'Middle East & Africa', flag: '🇦🇪', spanish: 'Emiratos Árabes Unidos' },
  dubai: { country: 'UAE', continent: 'Middle East & Africa', flag: '🇦🇪', spanish: 'Emiratos Árabes Unidos' },
  uae: { country: 'UAE', continent: 'Middle East & Africa', flag: '🇦🇪', spanish: 'Emiratos Árabes Unidos' },
  'united arab emirates': { country: 'UAE', continent: 'Middle East & Africa', flag: '🇦🇪', spanish: 'Emiratos Árabes Unidos' },
  ae: { country: 'UAE', continent: 'Middle East & Africa', flag: '🇦🇪', spanish: 'Emiratos Árabes Unidos' },
  marruecos: { country: 'Morocco', continent: 'Middle East & Africa', flag: '🇲🇦', spanish: 'Marruecos' },
  morocco: { country: 'Morocco', continent: 'Middle East & Africa', flag: '🇲🇦', spanish: 'Marruecos' },
  ma: { country: 'Morocco', continent: 'Middle East & Africa', flag: '🇲🇦', spanish: 'Marruecos' },
  jordania: { country: 'Jordan', continent: 'Middle East & Africa', flag: '🇯🇴', spanish: 'Jordania' },
  jordan: { country: 'Jordan', continent: 'Middle East & Africa', flag: '🇯🇴', spanish: 'Jordania' },
  jo: { country: 'Jordan', continent: 'Middle East & Africa', flag: '🇯🇴', spanish: 'Jordania' },

  // North America / USA / MEX
  'estados unidos': { country: 'United States', continent: 'USA - MEX', flag: '🇺🇸', spanish: 'Estados Unidos' },
  usa: { country: 'United States', continent: 'USA - MEX', flag: '🇺🇸', spanish: 'Estados Unidos' },
  eeuu: { country: 'United States', continent: 'USA - MEX', flag: '🇺🇸', spanish: 'Estados Unidos' },
  'ee.uu': { country: 'United States', continent: 'USA - MEX', flag: '🇺🇸', spanish: 'Estados Unidos' },
  'united states': { country: 'United States', continent: 'USA - MEX', flag: '🇺🇸', spanish: 'Estados Unidos' },
  us: { country: 'United States', continent: 'USA - MEX', flag: '🇺🇸', spanish: 'Estados Unidos' },
  mexico: { country: 'Mexico', continent: 'Mexico / Local', flag: '🇲🇽', spanish: 'México' },
  méxico: { country: 'Mexico', continent: 'Mexico / Local', flag: '🇲🇽', spanish: 'México' },
  mx: { country: 'Mexico', continent: 'Mexico / Local', flag: '🇲🇽', spanish: 'México' },
  canada: { country: 'Canada', continent: 'USA - MEX', flag: '🇨🇦', spanish: 'Canadá' },
  canadá: { country: 'Canada', continent: 'USA - MEX', flag: '🇨🇦', spanish: 'Canadá' },
  ca: { country: 'Canada', continent: 'USA - MEX', flag: '🇨🇦', spanish: 'Canadá' },

  // South America
  brasil: { country: 'Brazil', continent: 'South America', flag: '🇧🇷', spanish: 'Brasil' },
  brazil: { country: 'Brazil', continent: 'South America', flag: '🇧🇷', spanish: 'Brasil' },
  br: { country: 'Brazil', continent: 'South America', flag: '🇧🇷', spanish: 'Brasil' },
  honduras: { country: 'Honduras', continent: 'South America', flag: '🇭🇳', spanish: 'Honduras' },
  hn: { country: 'Honduras', continent: 'South America', flag: '🇭🇳', spanish: 'Honduras' },
  chile: { country: 'Chile', continent: 'South America', flag: '🇨🇱', spanish: 'Chile' },
  colombia: { country: 'Colombia', continent: 'South America', flag: '🇨🇴', spanish: 'Colombia' },
  argentina: { country: 'Argentina', continent: 'South America', flag: '🇦🇷', spanish: 'Argentina' },
  ar: { country: 'Argentina', continent: 'South America', flag: '🇦🇷', spanish: 'Argentina' },
};

// Map of continent search terms to continent names (bilingual support)
export const CONTINENT_SYNONYMS: Record<string, string> = {
  europa: 'Europe',
  europe: 'Europe',
  europeo: 'Europe',
  europea: 'Europe',
  europeos: 'Europe',
  europeas: 'Europe',
  asia: 'Asia',
  asiatico: 'Asia',
  asiatica: 'Asia',
  asiaticos: 'Asia',
  asiaticas: 'Asia',
  'lejano oriente': 'Asia',
  'medio oriente': 'Middle East & Africa',
  'middle east': 'Middle East & Africa',
  norteamerica: 'USA - MEX',
  norteamérica: 'USA - MEX',
  'north america': 'USA - MEX',
  sudamerica: 'South America',
  sudamérica: 'South America',
  'south america': 'South America',
  suramerica: 'South America',
  suramérica: 'South America',
  latam: 'South America',
  latinoamerica: 'South America',
  latinoamérica: 'South America',
  africa: 'Middle East & Africa',
  áfrica: 'Middle East & Africa',
  mexico: 'Mexico / Local',
  méxico: 'Mexico / Local',
};

/**
 * Returns the Spanish name for any English country name
 */
export function getSpanishCountryName(countryName: string): string {
  if (!countryName) return '';
  const clean = countryName.toLowerCase().trim();
  if (COUNTRY_DICTIONARY[clean]) {
    return COUNTRY_DICTIONARY[clean].spanish;
  }
  for (const entry of Object.values(COUNTRY_DICTIONARY)) {
    if (entry.country.toLowerCase() === clean) {
      return entry.spanish;
    }
  }
  return countryName;
}

/**
 * Resolves the physical residence country and continent of a carrier.
 * If the carrier object already has `country` or `continent`, those are preferred.
 * Otherwise, deduces it from location, hubs, address, name, or mode.
 */
export function getCarrierResidence(carrier: Carrier): { country: string; continent: string; flag: string; spanish: string } {
  // If explicitly declared
  if (carrier.country) {
    const norm = carrier.country.toLowerCase().trim();
    if (COUNTRY_DICTIONARY[norm]) {
      return {
        country: COUNTRY_DICTIONARY[norm].country,
        continent: carrier.continent || COUNTRY_DICTIONARY[norm].continent,
        flag: COUNTRY_DICTIONARY[norm].flag,
        spanish: COUNTRY_DICTIONARY[norm].spanish,
      };
    }
    const spanish = getSpanishCountryName(carrier.country);
    return {
      country: carrier.country,
      continent: carrier.continent || (carrier.regions?.[0] ?? 'Global / Any Country'),
      flag: '📍',
      spanish,
    };
  }

  // Deduce from name / location / hubs
  const haystack = `${carrier.name} ${carrier.location || ''} ${carrier.address || ''} ${carrier.hubs?.map(h => `${h.country} ${h.city}`).join(' ') || ''}`.toLowerCase();

  // Check country dictionary keys (longest keys first)
  const sortedCountryKeys = Object.keys(COUNTRY_DICTIONARY).sort((a, b) => b.length - a.length);
  for (const key of sortedCountryKeys) {
    // Word boundary or parenthesized match
    const regex = new RegExp(`(^|[^a-záéíóúüñ])${key}([^a-záéíóúüñ]|$)`, 'i');
    if (regex.test(haystack)) {
      const match = COUNTRY_DICTIONARY[key];
      return {
        country: match.country,
        continent: match.continent,
        flag: match.flag,
        spanish: match.spanish,
      };
    }
  }

  // Check mode: Terrestre defaults to Mexico
  if (carrier.mode === 'Terrestre') {
    return {
      country: 'Mexico',
      continent: 'Mexico / Local',
      flag: '🇲🇽',
      spanish: 'México',
    };
  }

  // Fallback to first region
  const primaryRegion = (carrier.regions?.[0] || 'Global / Cualquier País') as string;
  const isMexico = primaryRegion === 'México / Local';
  return {
    country: isMexico ? 'Mexico' : primaryRegion,
    continent: primaryRegion,
    flag: isMexico ? '🇲🇽' : '🌐',
    spanish: isMexico ? 'México' : primaryRegion,
  };
}

/**
 * Checks if a search query string or token is a specific geographic residence filter.
 * Returns either the target country or continent if matched, or null if it's general text.
 */
export function parseGeographicFilter(token: string): { type: 'country' | 'continent'; value: string } | null {
  const clean = token.toLowerCase().trim();
  if (!clean) return null;

  // Check continent synonyms first
  if (CONTINENT_SYNONYMS[clean]) {
    return {
      type: 'continent',
      value: CONTINENT_SYNONYMS[clean],
    };
  }

  // Check country dictionary
  if (COUNTRY_DICTIONARY[clean]) {
    return {
      type: 'country',
      value: COUNTRY_DICTIONARY[clean].country,
    };
  }

  return null;
}

/**
 * Matches a carrier against a search query using residence-aware filtering.
 * Fully supports bilingual searches (e.g. searching "Alemania" or "Germany" matches German carriers;
 * "Reino Unido" or "UK" matches UK carriers; "España" or "Spain" matches Spanish carriers).
 */
export function matchesCarrierResidenceSearch(carrier: Carrier, searchQuery: string): boolean {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return true;

  const residence = getCarrierResidence(carrier);
  const residenceCountryLower = residence.country.toLowerCase();
  const residenceSpanishLower = residence.spanish.toLowerCase();
  const residenceContinentLower = residence.continent.toLowerCase();

  // Tokenize search query (support multi-term e.g. "cargomind alemania" or "maurice ward spain")
  const tokens = query.split(/\s+/).filter((t) => t.length > 0);

  // If the entire query matches a multi-word country directly (e.g. "estados unidos", "republica checa", "reino unido")
  const fullGeo = parseGeographicFilter(query);
  if (fullGeo) {
    if (fullGeo.type === 'continent') {
      return (
        residenceContinentLower === fullGeo.value.toLowerCase() ||
        residenceContinentLower.includes(fullGeo.value.toLowerCase()) || 
        fullGeo.value.toLowerCase().includes(residenceContinentLower)
      );
    }
    if (fullGeo.type === 'country') {
      const targetLower = fullGeo.value.toLowerCase();
      return (
        residenceCountryLower === targetLower ||
        residenceSpanishLower === targetLower ||
        (carrier.country && carrier.country.toLowerCase() === targetLower) ||
        (carrier.hubs && carrier.hubs.some((h) => h.country && h.country.toLowerCase() === targetLower))
      );
    }
  }

  // For each token in multi-term query:
  for (const token of tokens) {
    const geo = parseGeographicFilter(token);

    if (geo) {
      // This token is a strict residence geographic requirement
      if (geo.type === 'continent') {
        const matchesContinent = 
          residenceContinentLower === geo.value.toLowerCase() ||
          residenceContinentLower.includes(geo.value.toLowerCase()) || 
          geo.value.toLowerCase().includes(residenceContinentLower);
        
        if (!matchesContinent) {
          return false;
        }
      } else if (geo.type === 'country') {
        const targetLower = geo.value.toLowerCase();
        const matchesCountry = 
          residenceCountryLower === targetLower ||
          residenceSpanishLower === targetLower ||
          (carrier.country && carrier.country.toLowerCase() === targetLower) ||
          (carrier.hubs && carrier.hubs.some(h => h.country.toLowerCase() === targetLower));

        if (!matchesCountry) {
          return false;
        }
      }
    } else {
      // General token: searchable text includes English & Spanish country names for maximum searchability
      const searchableGeneralText = [
        carrier.name,
        carrier.wcaId || '',
        carrier.wcaId ? `wca id ${carrier.wcaId} #${carrier.wcaId}` : '',
        carrier.mode,
        carrier.coverage,
        carrier.location || '',
        carrier.address || '',
        ...(carrier.unitTypes || []),
        ...(carrier.frequentRoutes || []),
        ...(carrier.servicesOffered || []),
        carrier.email || '',
        carrier.phone || '',
        carrier.notes || '',
        carrier.originalChannel,
        carrier.contactChannel,
        carrier.whatsappGroup || '',
        residence.country,
        residence.spanish,
        residence.continent,
        ...(carrier.airCountries || []),
        ...(carrier.hubs?.map((h) => `${h.name} ${h.city} ${h.country}`) || []),
      ]
        .join(' ')
        .toLowerCase();

      // Check if token matches in general text OR is a known country synonym matching residence
      const tokenGeo = parseGeographicFilter(token);
      const matchesGeneral = searchableGeneralText.includes(token);
      const matchesGeoSynonym = tokenGeo && tokenGeo.type === 'country' && tokenGeo.value.toLowerCase() === residenceCountryLower;

      if (!matchesGeneral && !matchesGeoSynonym) {
        return false;
      }
    }
  }

  return true;
}

