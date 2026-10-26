import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Carrier } from '../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Globe,
  Building2,
  ChevronRight,
  Filter,
  Layers,
  Compass,
  X,
  Search,
  CheckCircle2,
  Navigation,
} from 'lucide-react';
import { getCarrierResidence } from '../utils/geoResidence';
import { COUNTRY_FLAG_MAP } from '../utils/countryHelper';

interface InteractiveLogisticsMapProps {
  carriers: Carrier[];
  onSelectCarrierForQuote: (carrier: Carrier) => void;
  onViewCarrierInfo: (carrier: Carrier) => void;
  onFilterByRegionOrLocation: (locationText: string) => void;
  selectedFilterText?: string;
}

export interface HubCluster {
  id: string;
  name: string;
  city: string;
  state?: string;
  country: string;
  continent: string;
  flag: string;
  lat: number;
  lng: number;
  type: string;
  carriers: Carrier[];
}

export type MapContinentScope =
  | 'global'
  | 'mexico'
  | 'europa'
  | 'asia'
  | 'usa'
  | 'sudamerica'
  | 'mideast_africa';

interface ContinentConfig {
  id: MapContinentScope;
  name: string;
  shortName: string;
  flag: string;
  center: [number, number];
  zoom: number;
  accentColor: string;
}

export const CONTINENT_CONFIGS: ContinentConfig[] = [
  {
    id: 'global',
    name: 'Mundial / Todos los Continentes',
    shortName: 'Global',
    flag: '🌍',
    center: [25.0, 15.0],
    zoom: 2,
    accentColor: '#310052',
  },
  {
    id: 'mexico',
    name: 'México (Nacional)',
    shortName: 'México',
    flag: '🇲🇽',
    center: [23.8, -102.5],
    zoom: 5,
    accentColor: '#310052',
  },
  {
    id: 'europa',
    name: 'Europa',
    shortName: 'Europa',
    flag: '🇪🇺',
    center: [48.5, 14.5],
    zoom: 4,
    accentColor: '#1e40af',
  },
  {
    id: 'asia',
    name: 'Asia',
    shortName: 'Asia',
    flag: '🇨🇳',
    center: [28.0, 105.0],
    zoom: 4,
    accentColor: '#b45309',
  },
  {
    id: 'usa',
    name: 'Norteamérica (USA - Crossborder)',
    shortName: 'USA',
    flag: '🇺🇸',
    center: [38.0, -96.0],
    zoom: 4,
    accentColor: '#0369a1',
  },
  {
    id: 'sudamerica',
    name: 'Sudamérica & Centroamérica',
    shortName: 'Sudamérica',
    flag: '🌎',
    center: [-14.0, -55.0],
    zoom: 3,
    accentColor: '#047857',
  },
  {
    id: 'mideast_africa',
    name: 'Medio Oriente & África',
    shortName: 'Medio Oriente',
    flag: '🌍',
    center: [26.0, 42.0],
    zoom: 4,
    accentColor: '#7c3aed',
  },
];

/**
 * Standardizes any raw country name and maps it to proper Spanish spelling, flag, and continent
 */
export function resolveCountryDetails(rawCountry: string): {
  country: string;
  continent: string;
  flag: string;
  continentScope: MapContinentScope;
} {
  const clean = rawCountry.trim().toLowerCase();

  // Mexico
  if (clean === 'méxico' || clean === 'mexico' || clean === 'mx') {
    return { country: 'Mexico', continent: 'México', flag: '🇲🇽', continentScope: 'mexico' };
  }

  // United States
  if (
    clean === 'estados unidos' ||
    clean === 'usa' ||
    clean === 'eeuu' ||
    clean === 'ee.uu' ||
    clean === 'united states' ||
    clean === 'us'
  ) {
    return { country: 'United States', continent: 'Norteamérica', flag: '🇺🇸', continentScope: 'usa' };
  }

  // Canada
  if (clean === 'canadá' || clean === 'canada' || clean === 'ca') {
    return { country: 'Canada', continent: 'Norteamérica', flag: '🇨🇦', continentScope: 'usa' };
  }

  // Asia
  const asianMap: Record<string, { country: string; flag: string }> = {
    'china': { country: 'China', flag: '🇨🇳' },
    'hong kong': { country: 'Hong Kong', flag: '🇭🇰' },
    'india': { country: 'India', flag: '🇮🇳' },
    'vietnam': { country: 'Vietnam', flag: '🇻🇳' },
    'singapur': { country: 'Singapore', flag: '🇸🇬' },
    'singapore': { country: 'Singapore', flag: '🇸🇬' },
    'japón': { country: 'Japan', flag: '🇯🇵' },
    'japon': { country: 'Japan', flag: '🇯🇵' },
    'japan': { country: 'Japan', flag: '🇯🇵' },
    'corea del sur': { country: 'South Korea', flag: '🇰🇷' },
    'south korea': { country: 'South Korea', flag: '🇰🇷' },
    'taiwan': { country: 'Taiwan', flag: '🇹🇼' },
    'taiwán': { country: 'Taiwan', flag: '🇹🇼' },
    'tailandia': { country: 'Thailand', flag: '🇹🇭' },
    'thailand': { country: 'Thailand', flag: '🇹🇭' },
    'pakistan': { country: 'Pakistan', flag: '🇵🇰' },
    'pakistán': { country: 'Pakistan', flag: '🇵🇰' },
    'bangladesh': { country: 'Bangladesh', flag: '🇧🇩' },
    'bangladés': { country: 'Bangladesh', flag: '🇧🇩' },
  };
  if (asianMap[clean]) {
    return { country: asianMap[clean].country, continent: 'Asia', flag: asianMap[clean].flag, continentScope: 'asia' };
  }

  // Sudamérica & Centroamérica
  if (clean === 'brasil' || clean === 'brazil') {
    return { country: 'Brazil', continent: 'Sudamérica & Centroamérica', flag: '🇧🇷', continentScope: 'sudamerica' };
  }
  if (clean === 'honduras') {
    return { country: 'Honduras', continent: 'Sudamérica & Centroamérica', flag: '🇭🇳', continentScope: 'sudamerica' };
  }
  if (clean === 'chile') {
    return { country: 'Chile', continent: 'Sudamérica & Centroamérica', flag: '🇨🇱', continentScope: 'sudamerica' };
  }
  if (clean === 'colombia') {
    return { country: 'Colombia', continent: 'Sudamérica & Centroamérica', flag: '🇨🇴', continentScope: 'sudamerica' };
  }
  if (clean === 'argentina') {
    return { country: 'Argentina', continent: 'Sudamérica & Centroamérica', flag: '🇦🇷', continentScope: 'sudamerica' };
  }

  // Medio Oriente & África
  if (clean.includes('emiratos') || clean.includes('dubai') || clean.includes('uae')) {
    return {
      country: 'UAE',
      continent: 'Medio Oriente & África',
      flag: '🇦🇪',
      continentScope: 'mideast_africa',
    };
  }
  if (clean === 'marruecos' || clean === 'morocco') {
    return {
      country: 'Morocco',
      continent: 'Medio Oriente & África',
      flag: '🇲🇦',
      continentScope: 'mideast_africa',
    };
  }
  if (clean === 'jordania' || clean === 'jordan' || clean === 'jo') {
    return {
      country: 'Jordan',
      continent: 'Medio Oriente & África',
      flag: '🇯🇴',
      continentScope: 'mideast_africa',
    };
  }
  if (clean === 'georgia') {
    return {
      country: 'Georgia',
      continent: 'Europa & Cáucaso',
      flag: '🇬🇪',
      continentScope: 'europa',
    };
  }

  // Europe (all countries standardized to English)
  const europeanMap: Record<string, { country: string; flag: string }> = {
    'alemania': { country: 'Germany', flag: '🇩🇪' },
    'germany': { country: 'Germany', flag: '🇩🇪' },
    'deutschland': { country: 'Germany', flag: '🇩🇪' },
    'austria': { country: 'Austria', flag: '🇦🇹' },
    'bélgica': { country: 'Belgium', flag: '🇧🇪' },
    'belgica': { country: 'Belgium', flag: '🇧🇪' },
    'belgium': { country: 'Belgium', flag: '🇧🇪' },
    'monaco': { country: 'Monaco', flag: '🇲🇨' },
    'mónaco': { country: 'Monaco', flag: '🇲🇨' },
    'bulgaria': { country: 'Bulgaria', flag: '🇧🇬' },
    'croacia': { country: 'Croatia', flag: '🇭🇷' },
    'croatia': { country: 'Croatia', flag: '🇭🇷' },
    'dinamarca': { country: 'Denmark', flag: '🇩🇰' },
    'denmark': { country: 'Denmark', flag: '🇩🇰' },
    'eslovaquia': { country: 'Slovakia', flag: '🇸🇰' },
    'slovakia': { country: 'Slovakia', flag: '🇸🇰' },
    'eslovenia': { country: 'Slovenia', flag: '🇸🇮' },
    'slovenia': { country: 'Slovenia', flag: '🇸🇮' },
    'españa': { country: 'Spain', flag: '🇪🇸' },
    'espana': { country: 'Spain', flag: '🇪🇸' },
    'spain': { country: 'Spain', flag: '🇪🇸' },
    'finlandia': { country: 'Finland', flag: '🇫🇮' },
    'finland': { country: 'Finland', flag: '🇫🇮' },
    'francia': { country: 'France', flag: '🇫🇷' },
    'france': { country: 'France', flag: '🇫🇷' },
    'grecia': { country: 'Greece', flag: '🇬🇷' },
    'greece': { country: 'Greece', flag: '🇬🇷' },
    'hungría': { country: 'Hungary', flag: '🇭🇺' },
    'hungria': { country: 'Hungary', flag: '🇭🇺' },
    'hungary': { country: 'Hungary', flag: '🇭🇺' },
    'irlanda': { country: 'Ireland', flag: '🇮🇪' },
    'ireland': { country: 'Ireland', flag: '🇮🇪' },
    'italia': { country: 'Italy', flag: '🇮🇹' },
    'italy': { country: 'Italy', flag: '🇮🇹' },
    'países bajos': { country: 'Netherlands', flag: '🇳🇱' },
    'paises bajos': { country: 'Netherlands', flag: '🇳🇱' },
    'holanda': { country: 'Netherlands', flag: '🇳🇱' },
    'netherlands': { country: 'Netherlands', flag: '🇳🇱' },
    'polonia': { country: 'Poland', flag: '🇵🇱' },
    'poland': { country: 'Poland', flag: '🇵🇱' },
    'portugal': { country: 'Portugal', flag: '🇵🇹' },
    'reino unido': { country: 'United Kingdom', flag: '🇬🇧' },
    'uk': { country: 'United Kingdom', flag: '🇬🇧' },
    'united kingdom': { country: 'United Kingdom', flag: '🇬🇧' },
    'república checa': { country: 'Czech Republic', flag: '🇨🇿' },
    'republica checa': { country: 'Czech Republic', flag: '🇨🇿' },
    'czech republic': { country: 'Czech Republic', flag: '🇨🇿' },
    'chequia': { country: 'Czech Republic', flag: '🇨🇿' },
    'rumania': { country: 'Romania', flag: '🇷🇴' },
    'romania': { country: 'Romania', flag: '🇷🇴' },
    'serbia': { country: 'Serbia', flag: '🇷🇸' },
    'suecia': { country: 'Sweden', flag: '🇸🇪' },
    'sweden': { country: 'Sweden', flag: '🇸🇪' },
    'suiza': { country: 'Switzerland', flag: '🇨🇭' },
    'switzerland': { country: 'Switzerland', flag: '🇨🇭' },
    'turquía': { country: 'Turkey', flag: '🇹🇷' },
    'turquia': { country: 'Turkey', flag: '🇹🇷' },
    'turkey': { country: 'Turkey', flag: '🇹🇷' },
    'ucrania': { country: 'Ukraine', flag: '🇺🇦' },
    'ukraine': { country: 'Ukraine', flag: '🇺🇦' },
  };

  if (europeanMap[clean]) {
    return {
      country: europeanMap[clean].country,
      continent: 'Europa',
      flag: europeanMap[clean].flag,
      continentScope: 'europa',
    };
  }

  // Fallback lookup from COUNTRY_FLAG_MAP if available
  if (COUNTRY_FLAG_MAP[clean]) {
    const meta = COUNTRY_FLAG_MAP[clean];
    let scope: MapContinentScope = 'global';
    if (meta.region === 'Europe' || meta.region === 'Europa') scope = 'europa';
    else if (meta.region === 'Asia') scope = 'asia';
    else if (meta.region === 'USA - MEX' || meta.region === 'Norteamérica') scope = 'usa';
    else if (meta.region === 'South America' || meta.region === 'Sudamérica' || meta.region === 'Centroamérica') scope = 'sudamerica';
    else if (meta.region === 'Middle East & Africa' || meta.region === 'Medio Oriente' || meta.region === 'África') scope = 'mideast_africa';
    else if (meta.region === 'Mexico / Local' || meta.region === 'México') scope = 'mexico';

    return {
      country: meta.normalized,
      continent: meta.region,
      flag: meta.flag,
      continentScope: scope,
    };
  }

  return { country: rawCountry, continent: 'Internacional', flag: '🌐', continentScope: 'global' };
}

export const InteractiveLogisticsMap: React.FC<InteractiveLogisticsMapProps> = ({
  carriers,
  onSelectCarrierForQuote,
  onViewCarrierInfo,
  onFilterByRegionOrLocation,
  selectedFilterText,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeContinent, setActiveContinent] = useState<MapContinentScope>('global');
  const [selectedHub, setSelectedHub] = useState<HubCluster | null>(null);
  const [searchQuerySidebar, setSearchQuerySidebar] = useState('');

  // Group active carriers into unique, properly-labeled geographic Hub clusters
  const hubClusters: HubCluster[] = useMemo(() => {
    const clusterMap: { [key: string]: HubCluster } = {};

    carriers.forEach((carrier) => {
      if (!carrier.active) return;

      if (carrier.hubs && carrier.hubs.length > 0) {
        carrier.hubs.forEach((hub) => {
          const key = `${hub.lat.toFixed(3)},${hub.lng.toFixed(3)}`;
          const geo = resolveCountryDetails(hub.country);

          if (!clusterMap[key]) {
            clusterMap[key] = {
              id: key,
              name: hub.name,
              city: hub.city,
              state: hub.state,
              country: geo.country,
              continent: geo.continent,
              flag: geo.flag,
              lat: hub.lat,
              lng: hub.lng,
              type: hub.type,
              carriers: [],
            };
          }
          if (!clusterMap[key].carriers.some((c) => c.id === carrier.id)) {
            clusterMap[key].carriers.push(carrier);
          }
        });
      } else {
        // Fallback using carrier residence
        const res = getCarrierResidence(carrier);
        const geo = resolveCountryDetails(res.country);
        let lat = 19.4326;
        let lng = -99.1332;
        let city = 'Ciudad de México';
        let state = 'CDMX';

        const cov = (carrier.coverage + ' ' + (carrier.location || '')).toUpperCase();
        if (cov.includes('MANZANILLO')) {
          lat = 19.0545;
          lng = -104.3161;
          city = 'Manzanillo';
          state = 'Colima';
        } else if (cov.includes('ALTAMIRA')) {
          lat = 22.3925;
          lng = -97.8694;
          city = 'Altamira';
          state = 'Tamaulipas';
        } else if (cov.includes('NUEVO LAREDO') || cov.includes('LAREDO')) {
          lat = 27.4864;
          lng = -99.5058;
          city = 'Nuevo Laredo';
          state = 'Tamaulipas';
        } else if (cov.includes('MONTERREY')) {
          lat = 25.6866;
          lng = -100.3161;
          city = 'Monterrey';
          state = 'Nuevo León';
        } else if (cov.includes('GUADALAJARA')) {
          lat = 20.6597;
          lng = -103.3496;
          city = 'Guadalajara';
          state = 'Jalisco';
        }

        const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
        if (!clusterMap[key]) {
          clusterMap[key] = {
            id: key,
            name: `${carrier.name} Base`,
            city,
            state,
            country: geo.country,
            continent: geo.continent,
            flag: geo.flag,
            lat,
            lng,
            type: 'Base Operativa',
            carriers: [],
          };
        }
        if (!clusterMap[key].carriers.some((c) => c.id === carrier.id)) {
          clusterMap[key].carriers.push(carrier);
        }
      }
    });

    return Object.values(clusterMap);
  }, [carriers]);

  // Mexican states density breakdown
  const mexicoStateStats = useMemo(() => {
    const counts: {
      [state: string]: { count: number; cities: Set<string>; carriers: Set<string>; hub: HubCluster };
    } = {};

    hubClusters
      .filter((h) => h.country === 'Mexico' || h.country === 'México')
      .forEach((hub) => {
        const stateKey = hub.state || hub.city;
        if (!counts[stateKey]) {
          counts[stateKey] = { count: 0, cities: new Set(), carriers: new Set(), hub };
        }
        hub.carriers.forEach((c) => counts[stateKey].carriers.add(c.id));
        counts[stateKey].cities.add(hub.city);
      });

    return Object.entries(counts)
      .map(([state, data]) => ({
        state,
        carrierCount: data.carriers.size,
        cities: Array.from(data.cities).join(', '),
        representativeHub: data.hub,
      }))
      .sort((a, b) => b.carrierCount - a.carrierCount);
  }, [hubClusters]);

  // Countries density breakdown organized by Continent
  const countriesByContinent = useMemo(() => {
    const continentMap: {
      [continent: string]: {
        continentName: string;
        flag: string;
        scopeId: MapContinentScope;
        totalCarriers: Set<string>;
        countries: {
          [countryName: string]: {
            country: string;
            flag: string;
            cities: Set<string>;
            carriers: Set<string>;
            representativeHub: HubCluster;
          };
        };
      };
    } = {
      'Europa': {
        continentName: 'Europa',
        flag: '🇪🇺',
        scopeId: 'europa',
        totalCarriers: new Set(),
        countries: {},
      },
      'Asia': {
        continentName: 'Asia',
        flag: '🇨🇳',
        scopeId: 'asia',
        totalCarriers: new Set(),
        countries: {},
      },
      'Norteamérica': {
        continentName: 'Norteamérica (USA - Crossborder)',
        flag: '🇺🇸',
        scopeId: 'usa',
        totalCarriers: new Set(),
        countries: {},
      },
      'México': {
        continentName: 'México (Nacional)',
        flag: '🇲🇽',
        scopeId: 'mexico',
        totalCarriers: new Set(),
        countries: {},
      },
      'Sudamérica & Centroamérica': {
        continentName: 'Sudamérica & Centroamérica',
        flag: '🌎',
        scopeId: 'sudamerica',
        totalCarriers: new Set(),
        countries: {},
      },
      'Medio Oriente & África': {
        continentName: 'Medio Oriente & África',
        flag: '🌍',
        scopeId: 'mideast_africa',
        totalCarriers: new Set(),
        countries: {},
      },
    };

    hubClusters.forEach((hub) => {
      const geo = resolveCountryDetails(hub.country);
      let continentCategory = geo.continent;
      if (continentCategory === 'Europa & Cáucaso') continentCategory = 'Europa';
      if (!continentMap[continentCategory]) {
        continentMap[continentCategory] = {
          continentName: continentCategory,
          flag: geo.flag,
          scopeId: geo.continentScope,
          totalCarriers: new Set(),
          countries: {},
        };
      }

      const contGroup = continentMap[continentCategory];
      hub.carriers.forEach((c) => contGroup.totalCarriers.add(c.id));

      if (!contGroup.countries[geo.country]) {
        contGroup.countries[geo.country] = {
          country: geo.country,
          flag: geo.flag,
          cities: new Set(),
          carriers: new Set(),
          representativeHub: hub,
        };
      }
      hub.carriers.forEach((c) => contGroup.countries[geo.country].carriers.add(c.id));
      contGroup.countries[geo.country].cities.add(hub.city);
    });

    return Object.entries(continentMap).map(([key, data]) => ({
      continentName: data.continentName,
      flag: data.flag,
      scopeId: data.scopeId,
      carrierCount: data.totalCarriers.size,
      countries: Object.values(data.countries)
        .map((c) => ({
          country: c.country,
          flag: c.flag,
          carrierCount: c.carriers.size,
          cities: Array.from(c.cities).join(', '),
          representativeHub: c.representativeHub,
        }))
        .sort((a, b) => b.carrierCount - a.carrierCount || a.country.localeCompare(b.country)),
    }));
  }, [hubClusters]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [25.0, 15.0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 18,
        scrollWheelZoom: true,
      });

      // CartoDB Positron / Voyager clean tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright/">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map scope when activeContinent changes
  const handleContinentChange = (scope: MapContinentScope) => {
    setActiveContinent(scope);
    if (!mapInstanceRef.current) return;

    const config = CONTINENT_CONFIGS.find((c) => c.id === scope) || CONTINENT_CONFIGS[0];
    mapInstanceRef.current.flyTo(config.center, config.zoom, { duration: 1.2 });
  };

  // Render markers whenever hubClusters or activeContinent changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    hubClusters.forEach((hub) => {
      const count = hub.carriers.length;
      const geo = resolveCountryDetails(hub.country);

      // Color based on continent
      let markerBg = 'bg-[#310052]';
      if (geo.continentScope === 'europa') markerBg = 'bg-blue-700';
      else if (geo.continentScope === 'asia') markerBg = 'bg-amber-600';
      else if (geo.continentScope === 'usa') markerBg = 'bg-sky-600';
      else if (geo.continentScope === 'sudamerica') markerBg = 'bg-emerald-600';
      else if (geo.continentScope === 'mideast_africa') markerBg = 'bg-purple-700';

      const isDimmed = activeContinent !== 'global' && geo.continentScope !== activeContinent;

      const customIcon = L.divIcon({
        className: 'custom-carrier-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer transform hover:scale-125 transition-transform duration-150 ${
            isDimmed ? 'opacity-35 scale-90' : 'opacity-100'
          }">
            <div class="absolute -top-1.5 -right-1.5 z-10 flex items-center justify-center min-w-5 h-5 px-1 bg-[#D2E603] text-[#310052] text-[10px] font-black rounded-full border-2 border-white shadow-md">
              ${count}
            </div>
            <div class="w-8 h-8 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white text-white ${markerBg}">
              <span class="text-xs font-bold leading-none">${geo.flag}</span>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([hub.lat, hub.lng], { icon: customIcon });

      marker.on('click', () => {
        setSelectedHub(hub);
      });

      marker.bindTooltip(
        `<strong>${geo.flag} ${hub.city}, ${hub.state ? `${hub.state}, ` : ''}${hub.country}</strong><br/>${count} ${
          count === 1 ? 'proveedor activo' : 'proveedores activos'
        }`,
        { direction: 'top', offset: [0, -28] }
      );

      marker.addTo(markersGroupRef.current!);
    });
  }, [hubClusters, activeContinent]);

  const handleZoomToHub = (hub: HubCluster) => {
    if (!mapInstanceRef.current) return;
    setSelectedHub(hub);
    mapInstanceRef.current.flyTo([hub.lat, hub.lng], 9, { duration: 1.0 });
  };

  const handleSelectCountry = (countryName: string, repHub?: HubCluster) => {
    onFilterByRegionOrLocation(countryName);
    if (repHub) {
      handleZoomToHub(repHub);
    }
  };

  // Filtered continent groups according to active continent selector & text search
  const displayedContinentGroups = useMemo(() => {
    let list = countriesByContinent;

    if (activeContinent !== 'global') {
      list = list.filter((g) => g.scopeId === activeContinent);
    }

    if (searchQuerySidebar.trim()) {
      const q = searchQuerySidebar.toLowerCase().trim();
      list = list
        .map((group) => {
          const filteredCountries = group.countries.filter(
            (c) =>
              c.country.toLowerCase().includes(q) ||
              c.cities.toLowerCase().includes(q) ||
              group.continentName.toLowerCase().includes(q)
          );
          return {
            ...group,
            countries: filteredCountries,
          };
        })
        .filter((g) => g.countries.length > 0);
    }

    return list;
  }, [countriesByContinent, activeContinent, searchQuerySidebar]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden mb-8">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-linear-to-r from-slate-50 via-white to-slate-50 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#310052] text-[#D2E603] rounded-2xl shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black text-slate-900">
                  Mapa Interactivo de Cobertura y Proveeduría
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-black tracking-wide uppercase">
                  Red Verificada WCA & Nacional
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Explora la concentración real de proveedores por Continente, País y Hubs logísticos
              </p>
            </div>
          </div>

          {/* Active Filter Pill if search filter is applied from the map */}
          {selectedFilterText && (
            <div className="flex items-center space-x-2 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-2xl">
              <span className="text-xs font-bold text-[#310052] flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#310052]" />
                <span>Filtro activo: <strong>{selectedFilterText}</strong></span>
              </span>
              <button
                onClick={() => onFilterByRegionOrLocation('')}
                className="p-1 hover:bg-purple-200/60 rounded-full text-purple-800 transition cursor-pointer"
                title="Limpiar filtro"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Continents Navigation Selector Tabs */}
        <div className="pt-2 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {CONTINENT_CONFIGS.map((c) => {
            const isActive = activeContinent === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleContinentChange(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#310052] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
                }`}
              >
                <span>{c.flag}</span>
                <span>{c.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map + Organized Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-125">
        {/* Leaflet Map Canvas */}
        <div className="lg:col-span-7 xl:col-span-8 relative bg-slate-100 min-h-100 lg:min-h-130">
          <div ref={mapContainerRef} className="w-full h-full min-h-100 lg:min-h-130 z-10" />

          {/* Floating Map Legend */}
          <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-xs p-3 rounded-2xl border border-slate-200 shadow-md text-[11px] text-slate-700 space-y-1.5 max-w-70">
            <div className="font-bold text-[11px] text-slate-900 border-b border-slate-100 pb-1 flex items-center justify-between">
              <span>Código de Colores de Hubs:</span>
              <span className="text-[10px] text-slate-500">{hubClusters.length} Hubs</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#310052]" />
                <span className="truncate">🇲🇽 México</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-700" />
                <span className="truncate">🇪🇺 Europa</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                <span className="truncate">🇨🇳 Asia</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                <span className="truncate">🇺🇸 USA</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span className="truncate">🌎 Sudamérica</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-700" />
                <span className="truncate">🌍 M. Oriente & África</span>
              </div>
            </div>
          </div>
        </div>

        {/* Geographic Organization Sidebar */}
        <div className="lg:col-span-5 xl:col-span-4 p-4 sm:p-5 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between max-h-130 overflow-y-auto">
          <div className="space-y-4">
            {/* Header with Search within Map Hubs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#310052]" />
                  <span>Organización Geográfica</span>
                </h3>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                  {activeContinent === 'global' ? 'Todos los Continentes' : activeContinent.toUpperCase()}
                </span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuerySidebar}
                  onChange={(e) => setSearchQuerySidebar(e.target.value)}
                  placeholder="Buscar país, estado o ciudad en el mapa..."
                  className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#310052]/30 focus:outline-none"
                />
                {searchQuerySidebar && (
                  <button
                    onClick={() => setSearchQuerySidebar('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Special Section: Top Mexican States if in Mexico or Global scope */}
            {(activeContinent === 'mexico' || activeContinent === 'global') && !searchQuerySidebar && (
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span>🇲🇽</span>
                    <span>Concentración Nacional (México)</span>
                  </span>
                  <button
                    onClick={() => onFilterByRegionOrLocation('México')}
                    className="text-[10px] font-bold text-[#310052] hover:underline cursor-pointer"
                  >
                    Ver todos ({mexicoStateStats.reduce((acc, s) => acc + s.carrierCount, 0)})
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {mexicoStateStats.slice(0, 6).map((item) => (
                    <button
                      key={item.state}
                      onClick={() => {
                        onFilterByRegionOrLocation(item.state);
                        handleZoomToHub(item.representativeHub);
                      }}
                      className="p-1.5 bg-slate-50 hover:bg-purple-50 border border-slate-100 hover:border-[#310052]/30 rounded-xl text-left transition group cursor-pointer"
                    >
                      <div className="font-bold text-[11px] text-slate-800 group-hover:text-[#310052] truncate">
                        {item.state}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                        <span className="truncate">{item.cities.split(',')[0]}</span>
                        <strong className="text-[#310052] font-black">{item.carrierCount}</strong>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Continents & Countries List */}
            <div className="space-y-3">
              {displayedContinentGroups.map((group) => (
                <div key={group.continentName} className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <span>{group.flag}</span>
                      <span>{group.continentName}</span>
                    </span>
                    <button
                      onClick={() => {
                        const config = CONTINENT_CONFIGS.find((c) => c.id === group.scopeId);
                        if (config && mapInstanceRef.current) {
                          mapInstanceRef.current.flyTo(config.center, config.zoom);
                        }
                        onFilterByRegionOrLocation(group.continentName.split(' ')[0]);
                      }}
                      className="text-[10px] font-bold text-slate-500 hover:text-[#310052] cursor-pointer"
                    >
                      {group.carrierCount} {group.carrierCount === 1 ? 'proveedor' : 'proveedores'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {group.countries.map((item) => {
                      const isCountryActive =
                        selectedFilterText?.toLowerCase() === item.country.toLowerCase();
                      return (
                        <button
                          key={item.country}
                          onClick={() => handleSelectCountry(item.country, item.representativeHub)}
                          className={`p-2 rounded-xl text-left transition group cursor-pointer border shadow-2xs ${
                            isCountryActive
                              ? 'bg-purple-100 border-[#310052] text-[#310052]'
                              : 'bg-white hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[11px] text-slate-900 group-hover:text-[#310052] truncate flex items-center gap-1">
                              <span>{item.flag}</span>
                              <span className="truncate">{item.country}</span>
                            </span>
                            <span className="px-1.5 py-0.2 bg-slate-100 group-hover:bg-[#310052] group-hover:text-white rounded text-[10px] font-black text-slate-700 shrink-0 transition">
                              {item.carrierCount}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">
                            {item.cities || 'Hub activo'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {displayedContinentGroups.length === 0 && (
                <div className="p-4 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                  No se encontraron países ni ciudades que coincidan con la búsqueda.
                </div>
              )}
            </div>
          </div>

          {/* Selected Hub Detail Card */}
          {selectedHub && (
            <div className="mt-4 p-3.5 bg-white border-2 border-[#310052]/30 rounded-2xl shadow-sm text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#310052] flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    <span>Hub Seleccionado:</span>
                  </span>
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5 mt-0.5">
                    <span>{selectedHub.flag}</span>
                    <span>{selectedHub.city}</span>
                    <span className="text-slate-400 font-normal">({selectedHub.country})</span>
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    {selectedHub.name} • {selectedHub.continent}
                  </p>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="px-2 py-0.5 bg-[#D2E603] text-[#310052] font-black text-xs rounded-lg">
                    {selectedHub.carriers.length} Provs
                  </span>
                  <button
                    onClick={() => setSelectedHub(null)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5 max-h-36 overflow-y-auto">
                {selectedHub.carriers.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-1.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition text-[11px]"
                  >
                    <div className="min-w-0 pr-2">
                      <strong className="text-slate-900 block truncate">{c.name}</strong>
                      <span className="text-[10px] text-slate-500">
                        {c.mode} • ⚡ {c.responseTimeLabel}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => onViewCarrierInfo(c)}
                        className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded-md font-bold text-[10px] border border-slate-200 cursor-pointer"
                      >
                        Info
                      </button>
                      <button
                        onClick={() => onSelectCarrierForQuote(c)}
                        className="px-2 py-1 bg-[#310052] hover:bg-[#431366] text-white rounded-md font-bold text-[10px] cursor-pointer"
                      >
                        Cotizar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
