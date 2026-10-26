import React, { useState } from 'react';
import { Carrier, CarrierStation } from '../types';
import { X, Truck, MapPin, Route, ShieldCheck, Mail, Globe, Clock, Star, MessageSquare, ExternalLink, Send, Copy, Check, Search, Building2, Phone, Trash2 } from 'lucide-react';
import { PerformerLogo } from './PerformerLogo';
import { useAuth } from '../context/AuthContext';

interface CarrierServiceInfoModalProps {
  carrier: Carrier | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenQuoteModal: (carrier: Carrier) => void;
  onOpenEvaluationModal?: (carrier: Carrier) => void;
  onDeleteCarrier?: (carrierId: string, carrierName: string) => void;
}

export const CarrierServiceInfoModal: React.FC<CarrierServiceInfoModalProps> = ({
  carrier,
  isOpen,
  onClose,
  onOpenQuoteModal,
  onOpenEvaluationModal,
  onDeleteCarrier,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [stationSearch, setStationSearch] = useState('');
  const [copiedStationIdx, setCopiedStationIdx] = useState<number | null>(null);

  const { user } = useAuth();

  if (!isOpen || !carrier) return null;

  const handleCopyEmails = () => {
    if (carrier.email) {
      navigator.clipboard.writeText(carrier.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleCopyStationEmails = (station: CarrierStation, idx: number) => {
    const text = station.emails.join(', ');
    navigator.clipboard.writeText(text);
    setCopiedStationIdx(idx);
    setTimeout(() => setCopiedStationIdx(null), 2000);
  };

  const emailList = carrier.email
    ? carrier.email.split(',').map((e) => e.trim()).filter(Boolean)
    : [];

  const filteredStations = carrier.stations
    ? carrier.stations.filter((st) => {
        if (!stationSearch) return true;
        const q = stationSearch.toLowerCase();
        return (
          st.country.toLowerCase().includes(q) ||
          (st.city && st.city.toLowerCase().includes(q)) ||
          (st.services && st.services.some((s) => s.toLowerCase().includes(q))) ||
          st.emails.some((em) => em.toLowerCase().includes(q))
        );
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <PerformerLogo size="sm" variant="dark" />
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h3 className="text-lg font-black text-slate-900 tracking-wide">{carrier.name}</h3>
                {carrier.mode === 'WCA' ? (
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-black bg-linear-to-r from-amber-100 to-amber-200/90 text-amber-950 border border-amber-400 rounded-lg font-mono shadow-xs">
                    <Globe className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                    <span>WCA</span>
                    {carrier.wcaId && (
                      <span className="px-1.5 py-0.5 bg-amber-300 text-amber-950 rounded border border-amber-400 font-mono font-black text-xs">
                        ID: #{carrier.wcaId}
                      </span>
                    )}
                  </span>
                ) : (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                      carrier.mode === 'Terrestre'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : carrier.mode === 'Aereo'
                        ? 'bg-purple-50 text-[#310052] border-purple-200 font-black'
                        : 'bg-blue-50 text-blue-800 border-blue-200 font-black'
                    }`}
                  >
                    {carrier.mode}
                  </span>
                )}
                {carrier.hazmat && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 rounded-md">
                    HAZMAT
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Ficha técnica: servicios, flota de unidades, rutas y canales de contacto
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-4 text-xs text-slate-700">

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Alta Con</span>
              <span
                className={`inline-block mt-0.5 font-bold px-2 py-0.5 rounded text-[11px] border ${
                  carrier.altaEntity === 'Performer'
                    ? 'bg-purple-50 text-[#310052] border-purple-200'
                    : carrier.altaEntity === 'Kosmos'
                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                    : carrier.altaEntity === 'Ambos'
                    ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {carrier.altaEntity || 'Performer'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Grupo WhatsApp</span>
              {carrier.hasWhatsappGroup || (carrier.whatsappGroup && carrier.whatsappGroup.trim().length > 0) || carrier.contactChannel === 'WhatsApp' ? (
                <span className="inline-flex items-center space-x-1 mt-0.5 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                  <MessageSquare className="w-3 h-3 text-emerald-600" />
                  <span>{carrier.whatsappGroup || 'Grupo Activo'}</span>
                </span>
              ) : (
                <span className="inline-block mt-0.5 font-medium text-slate-500 px-2 py-0.5 rounded text-[11px] bg-slate-100 border border-slate-200">
                  Sin Grupo
                </span>
              )}
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Canal Directo</span>
              <span className="mt-0.5 font-bold text-slate-800 block truncate">
                {carrier.contactChannel}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Calificación</span>
              <button
                onClick={() => {
                  if (onOpenEvaluationModal) {
                    onOpenEvaluationModal(carrier);
                  }
                }}
                className="flex items-center space-x-1 mt-0.5 text-[#310052] font-black bg-purple-50 hover:bg-[#310052] hover:text-white px-2 py-0.5 rounded-lg border border-[#310052]/20 transition cursor-pointer"
                title="Ver o agregar evaluaciones de desempeño"
              >
                <Star className={`w-3.5 h-3.5 ${carrier.scoreOutOf10 && carrier.scoreOutOf10 > 0 ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
                <span>{carrier.scoreOutOf10 && carrier.scoreOutOf10 > 0 ? `${carrier.scoreOutOf10.toFixed(1)} / 10` : '0 / 10'}</span>
              </button>
            </div>
          </div>

          {/* WCA Credential Card (If WCA Carrier) */}
          {(carrier.wcaId || carrier.mode === 'WCA') && (
            <div className="bg-linear-to-br from-amber-50/90 to-yellow-50/50 p-4 rounded-2xl border border-amber-300/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-amber-700" />
                  <span className="font-bold text-amber-950 text-sm">
                    Acreditación & Membresía WCA (World Cargo Alliance)
                  </span>
                </div>
                {carrier.wcaId && (
                  <span className="px-2 py-0.5 bg-amber-200/80 text-amber-950 rounded-md font-mono font-black text-xs border border-amber-300">
                    ID #{carrier.wcaId}
                  </span>
                )}
              </div>
              <p className="text-amber-900 text-xs leading-relaxed">
                Este agente se encuentra registrado en el Directorio Global de Carga WCA. Utiliza el identificador de miembro para solicitudes directas de cotización y despacho bilateral con agentes de origen.
              </p>
              {carrier.wcaId && (
                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(carrier.wcaId!);
                      setCopiedEmail(true);
                      setTimeout(() => setCopiedEmail(false), 2000);
                    }}
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer border border-amber-300/80"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-800" />
                    <span>Copiar ID WCA (#{carrier.wcaId})</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 1. Tipo de Unidades & Flota */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5 shadow-xs">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <Truck className="w-4 h-4 text-[#310052]" />
              <span>Tipo de Unidades & Capacidad de Flota</span>
            </div>
            
            {carrier.unitTypes && carrier.unitTypes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {carrier.unitTypes.map((unit, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 flex items-start space-x-2 transition"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#310052] mt-1 shrink-0" />
                    <span className="text-slate-800 font-semibold text-xs leading-relaxed">{unit}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                <p className="leading-relaxed">
                  {carrier.notes || `Flota y unidades dedicadas para servicios ${carrier.mode.toLowerCase()}s.`}
                </p>
              </div>
            )}
          </div>

          {/* 2. Ubicación / Instalaciones / Patios */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>Ubicación & Patios de Operación</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <p className="text-slate-900 font-bold text-xs">
                {carrier.location || `Cobertura principal: ${carrier.coverage}`}
              </p>
              {carrier.address && (
                <p className="text-slate-700 text-xs flex items-start gap-1.5 font-medium">
                  <span className="text-slate-500 font-bold">Dirección:</span>
                  <span>{carrier.address}</span>
                </p>
              )}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {carrier.regions.map((reg) => (
                  <span key={reg} className="px-2.5 py-1 bg-white text-slate-700 rounded-lg text-[10px] font-semibold border border-slate-200">
                    📍 {reg}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Rutas Frecuentes */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <Route className="w-4 h-4 text-sky-600" />
              <span>Rutas Frecuentes & Corredores Principales</span>
            </div>
            {carrier.frequentRoutes && carrier.frequentRoutes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {carrier.frequentRoutes.map((route, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-semibold flex items-center space-x-2">
                    <span className="text-sky-600 font-bold">➔</span>
                    <span>{route}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                <span>Rutas cubiertas: <strong>{carrier.coverage}</strong> ({carrier.regions.join(', ')})</span>
              </div>
            )}
          </div>

          {/* 4. Servicios Ofrecidos & Seguridad */}
          {((carrier.servicesOffered && carrier.servicesOffered.length > 0) || carrier.notes) && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Servicios Especiales & Monitoreo</span>
              </div>
              {carrier.servicesOffered && carrier.servicesOffered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {carrier.servicesOffered.map((srv, idx) => (
                    <div key={idx} className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80 text-emerald-950 font-semibold flex items-center space-x-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{srv}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              {carrier.notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                  <strong className="text-slate-900">Notas operativas:</strong> {carrier.notes}
                </div>
              )}
            </div>
          )}

          {/* 5. Directorio Especial de Estaciones y Contactos por País (si existen stations) */}
          {carrier.stations && carrier.stations.length > 0 && (
            <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3.5 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-[#D2E603]" />
                  <span className="font-bold text-sm text-white">
                    Directorio de Oficinas & Estaciones ({carrier.stations.length} Países)
                  </span>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={stationSearch}
                    onChange={(e) => setStationSearch(e.target.value)}
                    placeholder="Filtrar por país, ciudad o email..."
                    className="pl-8 pr-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#D2E603] w-full sm:w-56"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {filteredStations.map((station, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700 space-y-2 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-base">{station.flag || '🌍'}</span>
                        <span className="font-bold text-slate-100 text-xs">{station.country}</span>
                        {station.city && (
                          <span className="text-[10px] text-slate-400">({station.city})</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleCopyStationEmails(station, sIdx)}
                        className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] font-semibold flex items-center space-x-1 transition cursor-pointer"
                        title="Copiar todos los correos de esta estación"
                      >
                        {copiedStationIdx === sIdx ? (
                          <>
                            <Check className="w-3 h-3 text-[#D2E603]" />
                            <span className="text-[#D2E603]">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    {station.services && (
                      <div className="flex flex-wrap gap-1">
                        {station.services.map((srv, srvIdx) => (
                          <span
                            key={srvIdx}
                            className="px-1.5 py-0.5 bg-purple-950/80 border border-purple-800 text-[#D2E603] rounded text-[9px] font-semibold"
                          >
                            {srv}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="space-y-1 pt-1 border-t border-slate-700/60">
                      {station.emails.map((em, eIdx) => (
                        <a
                          key={eIdx}
                          href={`mailto:${em}`}
                          className="block text-[11px] font-mono text-sky-300 hover:text-sky-200 hover:underline truncate"
                        >
                          ✉ {em}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Contactos Directos Principales / WhatsApp / Web */}
          <div className="bg-purple-50/60 p-5 rounded-2xl border border-purple-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[#310052] font-black text-sm">
                <Mail className="w-4 h-4 text-[#310052]" />
                <span>Correos Centrales de Contacto</span>
              </div>
              {carrier.email && (
                <button
                  onClick={handleCopyEmails}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-[11px] font-bold flex items-center space-x-1.5 transition border border-slate-200 shadow-xs cursor-pointer"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copiar Correos</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Email List */}
            {emailList.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500">Mesa de Entrada & Pricing Central:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {emailList.map((em, idx) => (
                    <a
                      key={idx}
                      href={`mailto:${em}`}
                      className="p-2.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-[#310052] hover:underline font-mono text-xs font-semibold flex items-center space-x-2 transition shadow-xs"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{em}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Phone & Direct Lines */}
            {carrier.phone && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Teléfonos, Líneas Directas & Emergencias:</span>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 flex items-center space-x-2.5 shadow-xs">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{carrier.phone}</span>
                </div>
              </div>
            )}

            {/* WhatsApp Group */}
            {carrier.whatsappGroup && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Grupo WhatsApp Oficial: <strong className="font-bold underline">{carrier.whatsappGroup}</strong></span>
                </div>
              </div>
            )}

            {/* Website Link & Direct Quote Portal */}
            <div className="pt-1 flex flex-wrap gap-2">
              {carrier.website && (
                <a
                  href={carrier.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 transition shadow-xs"
                >
                  <Globe className="w-3.5 h-3.5 text-[#310052]" />
                  <span>Visitar Página Web</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}

              {carrier.quoteUrl && (
                <a
                  href={carrier.quoteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-linear-to-r from-[#310052] to-[#4a0d6d] hover:from-[#260040] hover:to-[#3b0858] text-white rounded-xl text-xs font-bold border border-purple-900 transition shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#D2E603]" />
                  <span>Cotizar en Sistema Online</span>
                  <span className="text-[10px] bg-[#D2E603] text-slate-950 px-1.5 py-0.5 rounded font-black ml-1">
                    Abrir Portal ↗
                  </span>
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cerrar Ficha
            </button>

            {user?.role === 'admin' &&(
              <>
            {onDeleteCarrier && (
              <button
                onClick={() => {
                  onDeleteCarrier(carrier.id, carrier.name);
                }}
                className="px-3.5 py-2.5 text-rose-600 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                title="Eliminar este proveedor del catálogo"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Proveedor</span>
              </button>
            )}
            </>
            )}
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenQuoteModal(carrier);
            }}
            className="px-5 py-2.5 bg-[#310052] hover:bg-[#431366] text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-md cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-[#D2E603]" />
            <span>Generar Formato de Cotización</span>
          </button>
        </div>

      </div>
    </div>
  );
};

