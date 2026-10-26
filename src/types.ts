export type TransportMode = 'Terrestre' | 'WCA' | 'LCL' | 'FCL' | 'Aereo';

export type ContactChannel = 'WhatsApp' | 'Correo' | 'Correo o Pagina' | 'Correo o WHA' | 'Pagina Web';

export type UrgencyLevel = 'Critica' | 'Alta' | 'Media' | 'Planificada';

export type GeographicRegion = 
  | 'México / Local'
  | 'USA - MEX'
  | 'Europa'
  | 'Asia / China'
  | 'Sudamérica'
  | 'Global / Cualquier País';

export type TerrestrialCategory = 
  | 'hazmat'
  | 'refrigerados'
  | 'sobredimensionados'
  | 'nacionales'
  | 'puerta_a_puerta';

export interface CarrierEvaluation {
  id: string;
  date: string;
  evaluatorName: string;
  overallScore: number; // 1.0 to 10.0 (e.g. 8.5, 9.0, 5.0)
  criteriaScores: {
    slaResponse: number; // 1-10: Tiempo de Respuesta SLA
    unitAvailability: number; // 1-10: Disponibilidad de Unidades / Espacio
    rateCompetitiveness: number; // 1-10: Competitividad de Tarifas
    trackingCommunication: number; // 1-10: Seguimiento & Estatus en Tránsito
    customerService: number; // 1-10: Atención al Cliente & Tráfico
    securityCompliance: number; // 1-10: Seguridad & Cumplimiento Normativo
  };
  comments: string;
  recommendation?: 'Altamente Recomendado' | 'Conforme / Aceptable' | 'Bajo Observación' | 'No Recomendado';
}

export interface CarrierHub {
  name: string;
  city: string;
  state?: string;
  country: string;
  lat: number;
  lng: number;
  type: 'Patio / Base' | 'Oficina Central' | 'Hub Aéreo' | 'Terminal Portuaria' | 'Punto Fronterizo' | string;
}

export type AltaEntity = 'Performer' | 'Kosmos' | 'Ambos' | 'Ninguno';

export interface CarrierStation {
  country: string;
  flag?: string;
  city?: string;
  services?: string[];
  emails: string[];
}

export interface Carrier {
  id: string;
  wcaId?: string; // ID de Membresía o Identificador WCA (ej. 27841, 91402)
  country?: string; // País de residencia u oficina principal del contacto (ej. 'Portugal', 'España', 'China', 'Alemania', 'México', 'Estados Unidos')
  continent?: string; // Continente o macro-región de residencia (ej. 'Europa', 'Asia / China', 'USA - MEX', 'México / Local', 'Sudamérica')
  name: string;
  mode: TransportMode;
  coverage: string;
  contactChannel: ContactChannel;
  originalChannel: string; // 'WHA', 'CORREO', 'PAGINA', 'CORREO O PAGINA'
  altaEntity?: AltaEntity; // 'Performer' | 'Kosmos' | 'Ambos' | 'Ninguno'
  hasWhatsappGroup?: boolean; // Indica si tenemos grupo de WhatsApp activo con el transportista
  responseTimeMinutes?: number; // Opcional / Evaluado en desempeño
  responseTimeLabel?: string; // Opcional / Evaluado en desempeño
  urgencyLevel?: UrgencyLevel; // Opcional / Evaluado en desempeño
  regions: GeographicRegion[];
  hazmat: boolean;
  unitTypes?: string[]; // Tipos de unidades (Porta contenedor, Full de planas, 3.5t, etc.)
  location?: string; // Ubicación / Instalaciones / Patios
  address?: string; // Dirección física / Oficinas
  frequentRoutes?: string[]; // Rutas frecuentes
  servicesOffered?: string[]; // Servicios ofrecidos (GPS 24/7, cuenta espejo, patio seguro, etc.)
  whatsappGroup?: string; // Optional specific WhatsApp group name
  phone?: string;
  email?: string;
  website?: string;
  notes?: string;
  rating?: number; // 1-5 stars
  scoreOutOf10?: number; // Calificación formal de 1 a 10 (ej. 9.5, 8.0, 5.0)
  evaluations?: CarrierEvaluation[]; // Historial de evaluaciones y comentarios
  hubs?: CarrierHub[]; // Puntos geográficos específicos para mapa
  airCountries?: string[]; // Países y estados para búsqueda aérea
  stations?: CarrierStation[]; // Oficinas y contactos específicos por país
  additionalModes?: TransportMode[]; // Modos complementarios (ej. Sky Global en WCA y Aéreo)
  quoteUrl?: string; // Enlace directo al portal o sistema de cotización online
  active: boolean;
}

export interface QuoteRequest {
  carrier: Carrier;
  origin: string;
  destination: string;
  cargoType: string;
  weightVolume: string;
  urgency?: UrgencyLevel;
  notes: string;
  referenceCode: string;
}

export interface CarrierFilter {
  searchQuery: string;
  mode: TransportMode | 'Todos';
  channel: string;
  region: string;
  altaEntity?: AltaEntity | 'Todas';
  whatsappGroupOnly?: boolean;
  hazmatOnly: boolean;
}

