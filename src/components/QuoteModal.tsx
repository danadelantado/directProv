import React, { useState } from 'react';
import { Carrier } from '../types';
import { X, MessageSquare, Mail, Copy, Check, Clock, Globe, ExternalLink } from 'lucide-react';
import { PerformerLogo } from './PerformerLogo';

interface QuoteModalProps {
  carrier: Carrier | null;
  onClose: () => void;
}

// Carrier lists requiring English templates
const ENGLISH_AIR_CARRIERS = [
  'MAURICE',
  'LOGIKOSS',
  'CARGOMIND',
  'ANCHOR',
  'JETWAT',
  'JETWAY',
  'TEMMEL',
  'ALAINE',
  'INTERJUMBO',
  'VOLANTIS',
];

const ENGLISH_SEA_CARRIERS = [
  'AM CARGO',
  'EVEREST',
];

export const isCarrierEnglishByDefault = (carrierName: string, carrierMode: string): boolean => {
  const nameUpper = carrierName.toUpperCase();
  const modeLower = carrierMode.toLowerCase();

  // Terrestres & Sobredimensionados are strictly Spanish
  if (modeLower.includes('terrestre') || modeLower.includes('sobredimension')) {
    return false;
  }

  // WCA or LCL carriers with international communication
  const allEnglishCarriers = [...ENGLISH_AIR_CARRIERS, ...ENGLISH_SEA_CARRIERS];
  return allEnglishCarriers.some((c) => nameUpper.includes(c));
};

export const QuoteModal: React.FC<QuoteModalProps> = ({ carrier, onClose }) => {
  const isAirOrWca = carrier ? (carrier.mode === 'WCA' || carrier.mode.toLowerCase().includes('aereo')) : false;
  const isTerrestre = carrier ? (carrier.mode.toLowerCase().includes('terrestre') || carrier.mode.toLowerCase().includes('sobredimension')) : false;
  const isDefaultEnglish = carrier ? isCarrierEnglishByDefault(carrier.name, carrier.mode) : false;

  const defaultDestType: 'AOD' | 'POD' | 'Destino' = isTerrestre ? 'Destino' : isAirOrWca ? 'AOD' : 'POD';

  const [language, setLanguage] = useState<'en' | 'es'>(isDefaultEnglish ? 'en' : 'es');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [destType, setDestType] = useState<'AOD' | 'POD' | 'Destino'>(defaultDestType);
  const [packages, setPackages] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [weight, setWeight] = useState('');
  const [stackable, setStackable] = useState<'Stackable' | 'Non-stackable' | 'Estibable' | 'No estibable' | ''>('');
  const [extraNotes, setExtraNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedStationIndex, setSelectedStationIndex] = useState<number | ''>('');

  if (!carrier) return null;

  // Sync stackable text when language changes
  const handleLanguageChange = (newLang: 'en' | 'es') => {
    setLanguage(newLang);
    if (newLang === 'en') {
      if (stackable === 'Estibable') setStackable('Stackable');
      if (stackable === 'No estibable') setStackable('Non-stackable');
    } else {
      if (stackable === 'Stackable') setStackable('Estibable');
      if (stackable === 'Non-stackable') setStackable('No estibable');
    }
  };

  const isEnglish = language === 'en';

  // Mode label for English intro line
  let modeLabelEn = 'AIR / WCA';
  if (carrier.mode === 'LCL' || carrier.mode.toLowerCase().includes('maritimo') || carrier.mode.toLowerCase().includes('marítimo')) {
    modeLabelEn = 'LCL / SEA';
  } else if (carrier.mode === 'WCA') {
    modeLabelEn = 'AIR / WCA';
  } else if (carrier.mode.toLowerCase().includes('terrestre') || carrier.mode.toLowerCase().includes('sobredimension')) {
    modeLabelEn = 'ROAD';
  }

  // Header intro text
  const introLine = isEnglish
    ? `Hello team,\nCould you help me with this quote via ${modeLabelEn}?`
    : `Hola equipo,\n¿Me podrían apoyar con esta cotización por favor?`;

  const pickupHeader = 'Pick Up:';
  const destHeader = `${destType}:`;
  const merchHeader = isEnglish ? 'Merchandise details:' : 'Detalle de mercancía:';

  const merchandiseLines = [
    packages,
    dimensions,
    weight,
    stackable,
    extraNotes,
  ].filter((line) => line && line.trim().length > 0).join('\n');

  // Exact clean format
  const messageText = `${introLine}\n\n\n${pickupHeader}\n\n${origin || '[Pick Up address]'}\n\n\n${destHeader}\n\n${destination || '[Destination]'}\n\n\n${merchHeader}\n${merchandiseLines ? `\n${merchandiseLines}` : ''}`;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const rawPhone = carrier.phone ? carrier.phone.replace(/[^0-9]/g, '') : '';
    const encodedText = encodeURIComponent(messageText);
    if (rawPhone) {
      window.open(`https://wa.me/${rawPhone}?text=${encodedText}`, '_blank');
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
    }
  };

  const recipientEmail = typeof selectedStationIndex === 'number' && carrier.stations && carrier.stations[selectedStationIndex]
    ? carrier.stations[selectedStationIndex].emails.join(',')
    : carrier.email || '';

  const handleMailto = () => {
    const recipient = recipientEmail;
    const stationLabel = typeof selectedStationIndex === 'number' && carrier.stations && carrier.stations[selectedStationIndex]
      ? ` - [${carrier.stations[selectedStationIndex].country}]`
      : '';
    const subject = encodeURIComponent(`QUOTE REQUEST / SOLICITUD COTIZACION - ${carrier.name}${stationLabel}`);
    const body = encodeURIComponent(messageText);
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-white border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <PerformerLogo size="sm" variant="dark" />
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Generador de Mensaje de Cotización</span>
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                <span>A:</span>
                <strong className="text-slate-800">{carrier.name}</strong>
                {carrier.mode === 'WCA' && (
                  <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300 font-mono text-[10px] font-black">
                    <Globe className="w-2.5 h-2.5 text-amber-700" />
                    <span>WCA</span>
                    {carrier.wcaId && (
                      <span className="bg-amber-300 px-1 py-0.2 rounded font-mono font-bold">
                        #{carrier.wcaId}
                      </span>
                    )}
                  </span>
                )}
                <span>— Cobertura: {carrier.coverage}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* SLA banner & Language status */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                SLA Respuesta: <strong>{carrier.responseTimeLabel}</strong> ({carrier.contactChannel})
              </span>
            </div>

            {/* Language Selector */}
            <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 px-1 font-semibold">Idioma:</span>
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#310052] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Inglés
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('es')}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  language === 'es'
                    ? 'bg-[#310052] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Español
              </button>
            </div>
          </div>

          {/* Online Quotation System Banner if available */}
          {carrier.quoteUrl && (
            <div className="p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start sm:items-center space-x-2.5">
                <div className="p-2 bg-[#310052] text-white rounded-xl shrink-0">
                  <ExternalLink className="w-4 h-4 text-[#D2E603]" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <span>Sistema / Portal de Cotización Digital</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded border border-emerald-300">
                      Activo
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    {carrier.name} dispone de plataforma web para cotizar en tiempo real o reservar espacios.
                  </div>
                </div>
              </div>
              <a
                href={carrier.quoteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-[#310052] hover:bg-[#431366] text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm shrink-0 border border-purple-900 cursor-pointer"
              >
                <span>Cotizar en Plataforma</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#D2E603]" />
              </a>
            </div>
          )}

          {/* WhatsApp Group Instruction */}
          {carrier.contactChannel === 'WhatsApp' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 text-xs">
              <div className="flex items-center space-x-2 font-bold text-emerald-900">
                <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Contacto por WhatsApp:</span>
              </div>
              <p className="mt-0.5 text-[11px] text-emerald-800">
                Buscar el grupo <strong className="text-emerald-950 underline font-mono">{carrier.whatsappGroup || carrier.name}</strong> en WhatsApp y pegar el mensaje generado.
              </p>
            </div>
          )}

          {/* Form inputs */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
            
            {/* Multi-country Station Picker (if available) */}
            {carrier.stations && carrier.stations.length > 0 && (
              <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl space-y-1.5">
                <label className="block font-bold text-[#310052] text-xs">
                  🌍 Estación / Oficina de Contacto ({carrier.stations.length} países disponibles):
                </label>
                <select
                  value={selectedStationIndex}
                  onChange={(e) => setSelectedStationIndex(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#310052] text-xs shadow-xs"
                >
                  <option value="">Oficina Central / Todos los correos principales</option>
                  {carrier.stations.map((st, idx) => (
                    <option key={idx} value={idx}>
                      {st.flag || '📍'} {st.country} {st.city ? `(${st.city})` : ''} — {st.emails[0] || 'Contacto'}
                    </option>
                  ))}
                </select>
                {typeof selectedStationIndex === 'number' && carrier.stations[selectedStationIndex] && (
                  <div className="text-[11px] text-purple-900 bg-white p-2 rounded-lg border border-purple-200 font-mono flex items-center justify-between">
                    <span>
                      Destinatarios: <strong>{carrier.stations[selectedStationIndex].emails.join(', ')}</strong>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Pick Up (Origin) */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Pick Up (Lugar / Dirección de Recolección):
              </label>
              <textarea
                rows={2}
                placeholder="Ej. 33 Okolovrasten pat str&#10;Karlovo, Bulgaria&#10;Postcode 4300"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#310052] font-mono text-xs shadow-xs"
              />
            </div>

            {/* AOD / POD & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Etiqueta Destino:</label>
                <select
                  value={destType}
                  onChange={(e) => setDestType(e.target.value as 'AOD' | 'POD' | 'Destino')}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#310052] shadow-xs"
                >
                  <option value="Destino">Destino</option>
                  <option value="AOD">AOD (Aeropuerto de Destino)</option>
                  <option value="POD">POD (Puerto de Destino)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-800 mb-1">
                  {destType} (Destino):
                </label>
                <input
                  type="text"
                  placeholder="Ej. LRD / AICM / Manzanillo / Monterrey NL"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#310052] font-mono text-xs shadow-xs"
                />
              </div>
            </div>

            {/* Merchandise details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Bultos / Empaque:</label>
                <input
                  type="text"
                  placeholder="Ej. 1 Pallet / 24 Tarimas"
                  value={packages}
                  onChange={(e) => setPackages(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#310052] font-mono text-xs shadow-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Medidas / Dimensiones:</label>
                <input
                  type="text"
                  placeholder="Ej. 95x58x52 cm"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#310052] font-mono text-xs shadow-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Peso Total:</label>
                <input
                  type="text"
                  placeholder="Ej. 194 kg total"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#310052] font-mono text-xs shadow-xs"
                />
              </div>
            </div>

            {/* Estibable / Stackable & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Condición Estibable:</label>
                <select
                  value={stackable}
                  onChange={(e) => setStackable(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#310052] shadow-xs"
                >
                  <option value="">Sin especificar / Vacío</option>
                  <option value={isEnglish ? 'Stackable' : 'Estibable'}>
                    {isEnglish ? 'Stackable (Estibable)' : 'Estibable'}
                  </option>
                  <option value={isEnglish ? 'Non-stackable' : 'No estibable'}>
                    {isEnglish ? 'Non-stackable (No estibable)' : 'No estibable'}
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Notas adicionales (Opcional):</label>
                <input
                  type="text"
                  placeholder="Ej. Carga HAZMAT, temperatura controlada..."
                  value={extraNotes}
                  onChange={(e) => setExtraNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#310052] font-mono text-xs shadow-xs"
                />
              </div>
            </div>

          </div>

          {/* Live Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-800 text-xs">
                Vista Previa del Texto a Copiar:
              </label>
              <span className="text-[10px] text-[#310052] font-bold">
                {isEnglish ? '🇬🇧 Formato en Inglés' : '🇲🇽 Formato en Español'}
              </span>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-emerald-300 font-mono text-xs leading-relaxed whitespace-pre-wrap select-all shadow-inner">
              {messageText}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          
          <button
            onClick={handleCopyMessage}
            className="flex items-center space-x-2 px-5 py-2.5 bg-[#310052] hover:bg-[#431366] text-white rounded-xl font-bold text-xs shadow-md transition transform active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-[#D2E603]" /> : <Copy className="w-4 h-4 text-[#D2E603]" />}
            <span>{copied ? '¡Texto Copiado al Portapapeles!' : 'Copiar Texto para Enviar'}</span>
          </button>

          <div className="flex items-center space-x-2">
            {/* Website portal */}
            {carrier.website && (
              <a
                href={carrier.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl font-bold text-xs border border-purple-200 transition cursor-pointer"
              >
                <Globe className="w-4 h-4 text-purple-700" />
                <span>Portal Web</span>
              </a>
            )}

            {/* Mailto */}
            {carrier.email && (
              <button
                onClick={handleMailto}
                className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-sky-100 hover:bg-sky-200 text-sky-900 rounded-xl font-bold text-xs border border-sky-200 transition cursor-pointer"
              >
                <Mail className="w-4 h-4 text-sky-700" />
                <span>Enviar Correo</span>
              </button>
            )}

            {/* WhatsApp */}
            {(carrier.contactChannel === 'WhatsApp' || carrier.contactChannel === 'Correo o WHA') && (
              <button
                onClick={handleWhatsApp}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Abrir WhatsApp</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
