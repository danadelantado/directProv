import React from 'react';
import { Carrier } from '../types';
import { X, Scale, Clock, MapPin, MessageSquare, Mail, Globe, ShieldAlert, Star, ArrowRight, Check, AlertCircle } from 'lucide-react';

interface CompareModalProps {
  carriers: Carrier[];
  onClose: () => void;
  onSelectForQuote: (carrier: Carrier) => void;
  onRemoveFromCompare: (id: string) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  carriers,
  onClose,
  onSelectForQuote,
  onRemoveFromCompare,
}) => {
  if (carriers.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-white border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 border border-purple-200 text-[#310052] rounded-xl">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Comparativa Lado a Lado de Proveedores
              </h3>
              <p className="text-xs text-slate-500">
                Comparando {carriers.length} transportistas seleccionados por tiempo de respuesta y capacidades
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

        {/* Grid Comparison */}
        <div className="p-5 overflow-y-auto">
          <div className={`grid gap-4 ${
            carriers.length === 1
              ? 'grid-cols-1 max-w-md mx-auto'
              : carriers.length === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 md:grid-cols-3'
          }`}>
            {carriers.map((carrier) => (
              <div
                key={carrier.id}
                className="relative bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs"
              >
                {/* Remove button */}
                <button
                  onClick={() => onRemoveFromCompare(carrier.id)}
                  className="absolute top-3 right-3 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="Quitar de comparativa"
                >
                  <X className="w-4 h-4" />
                </button>

                <div>
                  {/* Mode badge + Name */}
                  <span
                    className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md mb-2 border ${
                      carrier.mode === 'Terrestre'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : carrier.mode === 'WCA' || carrier.mode === 'Aereo'
                        ? 'bg-purple-50 text-[#310052] border-purple-200 font-black'
                        : 'bg-blue-50 text-blue-800 border-blue-200 font-black'
                    }`}
                  >
                    {carrier.mode}
                  </span>

                  <h4 className="text-lg font-black text-slate-900 pr-6">{carrier.name}</h4>

                  {/* Rating 1 al 10 */}
                  <div className="flex items-center space-x-1 text-xs text-[#310052] font-black mt-1 bg-purple-50 px-2 py-0.5 rounded-lg w-fit border border-purple-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>
                      {carrier.scoreOutOf10 && carrier.scoreOutOf10 > 0 ? `${carrier.scoreOutOf10.toFixed(1)} / 10` : '0 / 10'}
                    </span>
                  </div>

                  {/* Comparison Rows */}
                  <div className="mt-4 space-y-3 text-xs divide-y divide-slate-200">
                    
                    {/* WCA Member ID if applicable */}
                    {carrier.wcaId && (
                      <div className="pt-2">
                        <span className="text-slate-500 block text-[11px] font-semibold">
                          ID de Miembro WCA:
                        </span>
                        <span className="font-mono font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded text-xs inline-block mt-0.5">
                          #{carrier.wcaId}
                        </span>
                      </div>
                    )}

                    {/* Alta con */}
                    <div className="pt-2">
                      <span className="text-slate-500 block text-[11px] font-semibold">
                        Alta Registrada Con:
                      </span>
                      <span
                        className={`inline-block mt-0.5 font-bold px-2 py-0.5 rounded text-xs border ${
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

                    {/* Grupo WhatsApp */}
                    <div className="pt-2">
                      <span className="text-slate-500 block text-[11px] font-semibold">
                        Grupo de WhatsApp:
                      </span>
                      {carrier.hasWhatsappGroup || (carrier.whatsappGroup && carrier.whatsappGroup.trim().length > 0) || carrier.contactChannel === 'WhatsApp' ? (
                        <span className="inline-flex items-center space-x-1 mt-0.5 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-200">
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span>{carrier.whatsappGroup || 'Grupo Activo'}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic mt-0.5 block">
                          Sin grupo registrado
                        </span>
                      )}
                    </div>

                    {/* Coverage */}
                    <div className="pt-2">
                      <span className="text-slate-500 block text-[11px] font-semibold">
                        Cobertura Geográfica:
                      </span>
                      <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{carrier.coverage}</span>
                      </span>
                    </div>

                    {/* Contact Channel */}
                    <div className="pt-2">
                      <span className="text-slate-500 block text-[11px] font-semibold">
                        Canal Preferido de Solicitud:
                      </span>
                      <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                        {carrier.contactChannel === 'WhatsApp' ? (
                          <>
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">WhatsApp ({carrier.originalChannel})</span>
                          </>
                        ) : carrier.contactChannel === 'Correo' ? (
                          <>
                            <Mail className="w-3.5 h-3.5 text-sky-600" />
                            <span className="text-sky-700">Correo Electrónico</span>
                          </>
                        ) : (
                          <>
                            <Globe className="w-3.5 h-3.5 text-purple-600" />
                            <span className="text-purple-700">{carrier.contactChannel}</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Capacidades Terrestres / Especialidades */}
                    <div className="pt-2">
                      <span className="text-slate-500 block text-[11px] font-semibold mb-1">
                        Especialidades / Categorías:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {carrier.hazmat && (
                          <span className="px-1.5 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded font-bold text-[9px]">
                            ☣️ HAZMAT
                          </span>
                        )}
                        {carrier.refrigerado && (
                          <span className="px-1.5 py-0.5 bg-cyan-50 text-cyan-800 border border-cyan-200 rounded font-bold text-[9px]">
                            ❄️ Refrigerado
                          </span>
                        )}
                        {carrier.sobredimensionado && (
                          <span className="px-1.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded font-bold text-[9px]">
                            🚜 Sobredimensionado
                          </span>
                        )}
                        {carrier.nacional && (
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold text-[9px]">
                            🇲🇽 Nacional
                          </span>
                        )}
                        {carrier.puertaAPuerta && (
                          <span className="px-1.5 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded font-bold text-[9px]">
                            🚪 Puerta a Puerta
                          </span>
                        )}
                        {!carrier.hazmat && !carrier.refrigerado && !carrier.sobredimensionado && !carrier.nacional && !carrier.puertaAPuerta && (
                          <span className="text-slate-500 text-[10px]">Carga General</span>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="pt-2">
                      <span className="text-slate-500 block text-[11px] font-semibold">
                        Notas & Especialidad:
                      </span>
                      <p className="text-slate-600 text-[11px] mt-0.5 italic">
                        {carrier.notes || 'Carga general en sus rutas autorizadas.'}
                      </p>
                    </div>

                  </div>
                </div>

                {/* Quote Action */}
                <div className="mt-5 pt-3 border-t border-slate-200">
                  <button
                    onClick={() => {
                      onClose();
                      onSelectForQuote(carrier);
                    }}
                    className="w-full py-2.5 px-3 bg-[#310052] hover:bg-[#431366] text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Cotizar con {carrier.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D2E603]" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Selecciona un proveedor para iniciar la solicitud de cotización inmediata.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-bold border border-slate-200 transition cursor-pointer"
          >
            Cerrar Comparativa
          </button>
        </div>

      </div>
    </div>
  );
};
