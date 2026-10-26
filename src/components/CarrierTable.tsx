import React, { useState } from 'react';
import { Carrier, AltaEntity } from '../types';
import { getCarrierResidence } from '../utils/geoResidence';
import { MessageSquare, Mail, Globe, MapPin, ShieldAlert, Star, ArrowUpDown, ArrowRight, CheckSquare, Square, Edit3, Info, Copy, Check, Trash2, ExternalLink, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CarrierTableProps {
  carriers: Carrier[];
  onSelectForQuote: (carrier: Carrier) => void;
  onEditCarrier: (carrier: Carrier) => void;
  onViewServiceInfo: (carrier: Carrier) => void;
  onEvaluateCarrier?: (carrier: Carrier) => void;
  onDeleteCarrier?: (carrierId: string, carrierName: string) => void;
  comparedCarrierIds: string[];
  onToggleCompare: (carrier: Carrier) => void;
  onToggleAlta?: (carrierId: string, newAlta: AltaEntity) => void;
  onToggleWhatsappGroup?: (carrierId: string, hasGroup: boolean) => void;
}

type SortField = 'name' | 'mode' | 'altaEntity' | 'hasWhatsappGroup' | 'coverage' | 'contactChannel' | 'scoreOutOf10' | 'wcaId';

export const CarrierTable: React.FC<CarrierTableProps> = ({
  carriers,
  onSelectForQuote,
  onEditCarrier,
  onViewServiceInfo,
  onEvaluateCarrier,
  onDeleteCarrier,
  comparedCarrierIds,
  onToggleCompare,
  onToggleAlta,
  onToggleWhatsappGroup,
}) => {
  const { user } = useAuth();

  const [sortField, setSortField] = useState<SortField>('mode');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [copiedIdCarrierId, setCopiedIdCarrierId] = useState<string | null>(null);

  const handleCopyWcaId = (carrierId: string, wcaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(wcaId);
    setCopiedIdCarrierId(carrierId);
    setTimeout(() => setCopiedIdCarrierId(null), 2000);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedCarriers = [...carriers].sort((a, b) => {
    let result = 0;
    if (sortField === 'name') {
      result = a.name.localeCompare(b.name);
    } else if (sortField === 'mode') {
      result = a.mode.localeCompare(b.mode);
    } else if (sortField === 'altaEntity') {
      result = (a.altaEntity || 'Performer').localeCompare(b.altaEntity || 'Performer');
    } else if (sortField === 'hasWhatsappGroup') {
      const aWha = a.hasWhatsappGroup || !!a.whatsappGroup ? 1 : 0;
      const bWha = b.hasWhatsappGroup || !!b.whatsappGroup ? 1 : 0;
      result = bWha - aWha;
    } else if (sortField === 'coverage') {
      result = a.coverage.localeCompare(b.coverage);
    } else if (sortField === 'contactChannel') {
      result = a.contactChannel.localeCompare(b.contactChannel);
    } else if (sortField === 'scoreOutOf10') {
      result = (a.scoreOutOf10 || 0) - (b.scoreOutOf10 || 0);
    } else if (sortField === 'wcaId') {
      result = (a.wcaId || '').localeCompare(b.wcaId || '');
    }
    return sortAsc ? result : -result;
  });

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          {/* Table Header */}
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3 px-3 text-center w-10">
                <span className="sr-only">Comparar</span>
              </th>

              <th
                onClick={() => handleSort('name')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition"
              >
                <div className="flex items-center space-x-1">
                  <span>Proveedor</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('mode')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition"
              >
                <div className="flex items-center space-x-1">
                  <span>Modo</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('altaEntity')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition"
              >
                <div className="flex items-center space-x-1">
                  <span>Alta Con</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('hasWhatsappGroup')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition"
              >
                <div className="flex items-center space-x-1">
                  <span>Grupo WhatsApp</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('coverage')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition"
              >
                <div className="flex items-center space-x-1">
                  <span>Cobertura</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('contactChannel')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition"
              >
                <div className="flex items-center space-x-1">
                  <span>Medio Directo</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('scoreOutOf10')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition text-center"
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>Calificación</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {sortedCarriers.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500 font-medium">
                  No hay proveedores que coincidan con los filtros actuales.
                </td>
              </tr>
            ) : (
              sortedCarriers.map((carrier) => {
                const isCompared = comparedCarrierIds.includes(carrier.id);
                const residence = getCarrierResidence(carrier);
                const alta = carrier.altaEntity ?? 'Performer';
                const hasWha = Boolean(carrier.hasWhatsappGroup || (carrier.whatsappGroup && carrier.whatsappGroup.trim().length > 0) || carrier.contactChannel === 'WhatsApp');

                return (
                  <tr
                    key={carrier.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isCompared ? 'bg-purple-50/50' : ''
                    }`}
                  >
                    {/* Compare Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onToggleCompare(carrier)}
                        className="text-slate-400 hover:text-[#310052] p-1 cursor-pointer"
                        title="Comparar"
                      >
                        {isCompared ? (
                          <CheckSquare className="w-4 h-4 text-[#310052]" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </button>
                    </td>

                    {/* Carrier Name */}
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm hover:text-[#310052] transition-colors font-bold">{carrier.name}</span>
                          {carrier.mode === 'WCA' && (
                            carrier.wcaId ? (
                              <button
                                onClick={(e) => handleCopyWcaId(carrier.id, carrier.wcaId!, e)}
                                className="inline-flex items-center space-x-1 px-2 py-0.5 bg-amber-100/90 hover:bg-amber-200 text-amber-950 border border-amber-300 rounded-md font-mono text-[10px] font-black transition cursor-pointer shadow-2xs"
                                title="Copiar ID WCA al portapapeles"
                              >
                                <Globe className="w-2.5 h-2.5 text-amber-700" />
                                <span>WCA</span>
                                <span className="bg-amber-300 px-1 py-0.2 rounded border border-amber-400 font-mono font-black ml-0.5">
                                  ID: #{carrier.wcaId}
                                </span>
                                {copiedIdCarrierId === carrier.id ? (
                                  <Check className="w-2.5 h-2.5 text-emerald-700 ml-0.5" />
                                ) : (
                                  <Copy className="w-2.5 h-2.5 text-amber-800 ml-0.5" />
                                )}
                              </button>
                            ) : null
                          )}
                          {carrier.hazmat && (
                            <span className="flex items-center space-x-0.5 px-1 py-0.2 text-[9px] font-bold bg-rose-50 text-rose-800 border border-rose-200 rounded">
                              <ShieldAlert className="w-2.5 h-2.5 text-rose-600" />
                              <span>HAZMAT</span>
                            </span>
                          )}
                        </div>

                        {carrier.address && (
                          <span className="text-[10px] text-slate-500 font-normal truncate max-w-xs">
                            {carrier.address}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Modo */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-wrap items-center gap-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            carrier.mode === 'Terrestre'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : carrier.mode === 'WCA' || carrier.mode === 'Aereo'
                              ? 'bg-purple-50 text-[#310052] border-purple-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {carrier.mode}
                        </span>
                        {carrier.additionalModes && carrier.additionalModes.map((addMode) => (
                          <span
                            key={addMode}
                            className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded border bg-slate-100 text-slate-700 border-slate-300"
                            title={`También activo en ${addMode}`}
                          >
                            +{addMode}
                          </span>
                        ))}
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded"
                          title={`País: ${residence.country} (${residence.continent})`}
                        >
                          <span>{residence.flag}</span>
                          <span>{residence.country}</span>
                        </span>
                      </div>
                    </td>

                    {/* Alta Con: Performer / Kosmos / Ambos */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => onToggleAlta?.(carrier.id, 'Performer')}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                            alta === 'Performer'
                              ? 'bg-[#310052] text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Alta Performer"
                        >
                          Performer
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleAlta?.(carrier.id, 'Kosmos')}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                            alta === 'Kosmos'
                              ? 'bg-sky-700 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Alta Kosmos"
                        >
                          Kosmos
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleAlta?.(carrier.id, 'Ambos')}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                            alta === 'Ambos'
                              ? 'bg-purple-900 text-[#D2E603] shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Alta Ambos"
                        >
                          Ambos
                        </button>
                      </div>
                    </td>

                    {/* Grupo de WhatsApp */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => onToggleWhatsappGroup?.(carrier.id, !hasWha)}
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition cursor-pointer ${
                            hasWha
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                          title={hasWha ? 'Grupo WHA Activo (Click para desmarcar)' : 'Sin grupo (Click para activar)'}
                        >
                          <MessageSquare className={`w-3 h-3 ${hasWha ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span>{hasWha ? (carrier.whatsappGroup || 'WHA Activo') : 'Sin Grupo'}</span>
                        </button>
                      </div>
                    </td>

                    {/* Cobertura */}
                    <td className="py-3 px-4 text-slate-800 font-medium whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{carrier.coverage}</span>
                      </div>
                    </td>

                    {/* Canal Directo */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        {carrier.contactChannel === 'WhatsApp' ? (
                          <>
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-semibold">
                              WhatsApp
                            </span>
                          </>
                        ) : carrier.contactChannel === 'Correo' ? (
                          <>
                            <Mail className="w-3.5 h-3.5 text-sky-600" />
                            <span className="text-sky-700 font-semibold">Correo</span>
                          </>
                        ) : (
                          <>
                            <Globe className="w-3.5 h-3.5 text-purple-600" />
                            <span className="text-purple-700 font-semibold">
                              {carrier.contactChannel}
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Calificación 0 al 10 */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => onEvaluateCarrier && onEvaluateCarrier(carrier)}
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-xs font-black transition cursor-pointer ${
                          carrier.scoreOutOf10 && carrier.scoreOutOf10 > 0
                            ? 'bg-purple-50 hover:bg-[#310052] text-[#310052] hover:text-white border border-[#310052]/20'
                            : 'bg-slate-100 hover:bg-[#310052] text-slate-600 hover:text-white border border-slate-200'
                        }`}
                        title="Ver evaluación o calificar (0 al 10)"
                      >
                        <Star className={`w-3 h-3 ${carrier.scoreOutOf10 && carrier.scoreOutOf10 > 0 ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
                        <span>
                          {carrier.scoreOutOf10 && carrier.scoreOutOf10 > 0 ? `${carrier.scoreOutOf10.toFixed(1)}/10` : '0/10'}
                        </span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onViewServiceInfo(carrier)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[#310052] border border-slate-200 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                          title="Ver Ficha de Servicios, Flota y Ubicación"
                        >
                          <Info className="w-3.5 h-3.5 text-[#310052]" />
                          <span>Servicios</span>
                        </button>

                        <button
                          onClick={() => onEvaluateCarrier && onEvaluateCarrier(carrier)}
                          className="p-1 text-[#310052] hover:bg-purple-50 rounded-lg border border-purple-200 transition cursor-pointer"
                          title="Evaluar desempeño (1 al 10)"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        </button>

                        {user?.role === 'admin' && (
                        <>
                        <button
                          onClick={() => onEditCarrier(carrier)}
                          className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition cursor-pointer"
                          title="Editar información"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {onDeleteCarrier && (
                          <button
                            onClick={() => onDeleteCarrier(carrier.id, carrier.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-200 transition cursor-pointer"
                            title={`Eliminar a ${carrier.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        </>
                      )}

                        {carrier.quoteUrl && (
                          <a
                            href={carrier.quoteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-[#310052] border border-purple-300 font-bold text-xs rounded-lg transition flex items-center space-x-1 cursor-pointer"
                            title="Abrir sistema de cotizaciones en línea"
                          >
                            <ExternalLink className="w-3 h-3 text-[#310052]" />
                            <span>Portal</span>
                          </a>
                        )}

                        <button
                          onClick={() => onSelectForQuote(carrier)}
                          className="px-2.5 py-1 bg-[#310052] hover:bg-[#431366] text-white font-bold text-xs rounded-lg transition flex items-center space-x-1 cursor-pointer shadow-xs"
                        >
                          <span>Cotizar</span>
                          <ArrowRight className="w-3 h-3 text-[#D2E603]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
