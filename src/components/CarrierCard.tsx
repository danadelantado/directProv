import React, { useState } from 'react';
import { Carrier, AltaEntity } from '../types';
import { getCarrierResidence } from '../utils/geoResidence';
import { MessageSquare, Mail, Globe, MapPin, ShieldAlert, Star, ArrowRight, CheckSquare, Square, Info, Truck, Copy, Check, Phone, Trash2, ExternalLink, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CarrierCardProps {
  carrier: Carrier;
  onSelectForQuote: (carrier: Carrier) => void;
  onEditCarrier: (carrier: Carrier) => void;
  onViewServiceInfo: (carrier: Carrier) => void;
  onEvaluateCarrier?: (carrier: Carrier) => void;
  onDeleteCarrier?: (carrierId: string, carrierName: string) => void;
  isCompared: boolean;
  onToggleCompare: (carrier: Carrier) => void;
  onToggleAlta?: (carrierId: string, newAlta: AltaEntity) => void;
  onToggleWhatsappGroup?: (carrierId: string, hasGroup: boolean) => void;
}

export const CarrierCard: React.FC<CarrierCardProps> = ({
  carrier,
  onSelectForQuote,
  onEditCarrier,
  onViewServiceInfo,
  onEvaluateCarrier,
  onDeleteCarrier,
  isCompared,
  onToggleCompare,
  onToggleAlta,
  onToggleWhatsappGroup,
}) => {

  const { user } = useAuth();
  const [copiedWcaId, setCopiedWcaId] = useState(false);
  const residence = getCarrierResidence(carrier);
  const alta = carrier.altaEntity ?? 'Performer';
  const hasWha = Boolean(carrier.hasWhatsappGroup || (carrier.whatsappGroup && carrier.whatsappGroup.trim().length > 0) || carrier.contactChannel === 'WhatsApp');

  const handleCopyWcaId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (carrier.wcaId) {
      navigator.clipboard.writeText(carrier.wcaId);
      setCopiedWcaId(true);
      setTimeout(() => setCopiedWcaId(false), 2000);
    }
  };

  return (
    <div
      className={`group relative bg-white hover:bg-slate-50/90 border rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between ${
        isCompared
          ? 'border-[#310052] ring-2 ring-[#310052]/20'
          : 'border-slate-200/90 hover:border-slate-300'
      }`}
    >
      <div>
        {/* Top bar: Mode + Residence Country + HAZMAT (Left) | Compare Checkbox (Right) */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {/* Mode badge */}
            <span
              className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                carrier.mode === 'Terrestre'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : carrier.mode === 'WCA' || carrier.mode === 'Aereo'
                  ? 'bg-purple-50 text-[#310052] border-purple-200 font-black'
                  : 'bg-blue-50 text-blue-800 border-blue-200 font-black'
              }`}
            >
              {carrier.mode}
            </span>

            {/* Additional Modes badges if any */}
            {carrier.additionalModes && carrier.additionalModes.map((addMode) => (
              <span
                key={addMode}
                className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border bg-slate-100 text-slate-700 border-slate-300"
                title={`También registrado y activo en modalidad ${addMode}`}
              >
                +{addMode}
              </span>
            ))}

            {/* Country / Residence badge */}
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200/90 rounded-md"
              title={`País de Residencia: ${residence.country} (${residence.continent})`}
            >
              <span>{residence.flag}</span>
              <span>{residence.country}</span>
            </span>

            {/* Hazmat tag */}
            {carrier.hazmat && (
              <span className="flex items-center space-x-1 px-1.5 py-0.5 text-[9px] font-bold bg-rose-50 text-rose-800 border border-rose-200 rounded-md">
                <ShieldAlert className="w-2.5 h-2.5 text-rose-600" />
                <span>HAZMAT</span>
              </span>
            )}
          </div>

          {/* Compare toggle checkbox */}
          <button
            onClick={() => onToggleCompare(carrier)}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium transition shrink-0 cursor-pointer ${
              isCompared
                ? 'bg-[#310052] text-white border border-[#310052]'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
            }`}
            title={isCompared ? 'Quitar de la comparación' : 'Agregar a la comparación'}
          >
            {isCompared ? (
              <CheckSquare className="w-3.5 h-3.5 text-[#D2E603]" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>Comparar</span>
          </button>
        </div>

        {/* Carrier Title */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-black text-slate-900 group-hover:text-[#310052] transition-colors leading-tight">
            {carrier.name}
          </h3>
          
          {/* Calificación 1 al 10 (ej. 0/10 o 9.6/10) */}
          <button
            onClick={() => onEvaluateCarrier && onEvaluateCarrier(carrier)}
            className={`flex items-center space-x-1 text-xs font-black px-2 py-0.5 rounded-lg shrink-0 transition cursor-pointer shadow-2xs ${
              carrier.scoreOutOf10 && carrier.scoreOutOf10 > 0
                ? 'bg-purple-50 hover:bg-[#310052] text-[#310052] hover:text-white border border-[#310052]/20'
                : 'bg-slate-100 hover:bg-[#310052] text-slate-600 hover:text-white border border-slate-200 hover:border-[#310052]'
            }`}
            title="Ver evaluaciones de desempeño (calidad, SLA y servicio)"
          >
            <Star className={`w-3 h-3 ${carrier.scoreOutOf10 && carrier.scoreOutOf10 > 0 ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
            <span>
              {carrier.scoreOutOf10 && carrier.scoreOutOf10 > 0 ? `${carrier.scoreOutOf10.toFixed(1)}/10` : '0/10'}
            </span>
          </button>
        </div>

        {/* Alta con: Performer / Kosmos / Ambos Selector */}
        <div className="mt-2.5 p-1.5 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center justify-between gap-1.5">
          <div className="flex items-center space-x-1 min-w-0">
            <Building2 className="w-3.5 h-3.5 text-[#310052] shrink-0" />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
              Alta:
            </span>
          </div>
          <div className="flex items-center bg-slate-200/60 p-0.5 rounded-lg text-[10px] font-bold">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleAlta?.(carrier.id, 'Performer');
              }}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                alta === 'Performer'
                  ? 'bg-[#310052] text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Registrado / Alta con Performer"
            >
              Performer
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleAlta?.(carrier.id, 'Kosmos');
              }}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                alta === 'Kosmos'
                  ? 'bg-sky-700 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Registrado / Alta con Kosmos"
            >
              Kosmos
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleAlta?.(carrier.id, 'Ambos');
              }}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                alta === 'Ambos'
                  ? 'bg-linear-to-r from-[#310052] to-sky-800 text-[#D2E603] shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Registrado con Ambos (Performer y Kosmos)"
            >
              Ambos
            </button>
          </div>
        </div>

        {/* WCA Dedicated ID Panel (for quick visualization and copying) */}
        {carrier.wcaId && (
          <div className="mt-2 px-2.5 py-1.5 bg-linear-to-r from-amber-50/90 to-yellow-50/70 border border-amber-200/90 rounded-lg flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center space-x-1.5 min-w-0">
              <Globe className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="text-[11px] font-bold text-amber-950">ID WCA Oficial:</span>
              <span className="font-mono font-black text-amber-900 bg-amber-100/90 px-1.5 py-0.5 rounded text-xs tracking-wider border border-amber-300/60">
                #{carrier.wcaId}
              </span>
            </div>
            <button
              onClick={handleCopyWcaId}
              className="text-[10px] font-bold text-amber-900 hover:text-amber-950 bg-amber-200/70 hover:bg-amber-200 px-2 py-0.5 rounded transition flex items-center gap-1 cursor-pointer shrink-0 border border-amber-300/70"
              title="Copiar ID WCA al portapapeles"
            >
              {copiedWcaId ? (
                <>
                  <Check className="w-3 h-3 text-emerald-700" />
                  <span className="text-emerald-800">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-amber-800" />
                  <span>Copiar ID</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Cobertura / Geographic Coverage */}
        <div className="mt-2 text-xs font-semibold text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="truncate">{carrier.coverage}</span>
        </div>

        {/* Ubicación / Domicilio si existe */}
        {(carrier.address || carrier.location) && (
          <div className="mt-2 text-[11px] text-slate-700 bg-slate-100/70 px-2.5 py-1.5 rounded-md border border-slate-200 flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              {carrier.address ? (
                <div className="text-[11px] leading-tight">
                  <span className="font-bold text-slate-900 block text-[10px]">Domicilio / Oficinas:</span>
                  <span className="text-slate-700 font-medium line-clamp-2">{carrier.address}</span>
                </div>
              ) : (
                <span className="truncate font-medium block">{carrier.location}</span>
              )}
            </div>
          </div>
        )}

        {/* Unidades Destacadas si existen */}
        {carrier.unitTypes && carrier.unitTypes.length > 0 && (
          <div className="mt-2 text-[11px] text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200 flex items-start gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#310052] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-slate-500 font-semibold block">Unidades / Flota:</span>
              <span className="truncate block font-semibold text-slate-900">
                {carrier.unitTypes.slice(0, 2).join(' • ')}
                {carrier.unitTypes.length > 2 ? ` (+${carrier.unitTypes.length - 2} más)` : ''}
              </span>
            </div>
          </div>
        )}

        {/* WhatsApp Group Status Box (Independiente de canal de contacto directo) */}
        <div
          className={`mt-2.5 px-2.5 py-2 rounded-xl border flex items-center justify-between gap-2 transition ${
            hasWha
              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          <div className="flex items-center space-x-2 min-w-0">
            <MessageSquare className={`w-4 h-4 shrink-0 ${hasWha ? 'text-emerald-600' : 'text-slate-400'}`} />
            <div className="leading-tight truncate">
              <span className="text-[10px] font-bold block uppercase tracking-wider text-slate-500">
                Grupo WhatsApp:
              </span>
              <span className={`text-xs font-bold truncate block ${hasWha ? 'text-emerald-900' : 'text-slate-500 italic'}`}>
                {hasWha ? (carrier.whatsappGroup || 'Grupo de WhatsApp Activo') : 'Sin grupo'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWhatsappGroup?.(carrier.id, !hasWha);
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition shrink-0 cursor-pointer border shadow-2xs ${
              hasWha
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                : 'bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border-slate-300'
            }`}
            title={hasWha ? 'Desmarcar grupo de WhatsApp' : 'Marcar que tenemos grupo de WhatsApp activo'}
          >
            {hasWha ? '✓ Activo' : '+ Activar'}
          </button>
        </div>

        {/* Canal Directo de Solicitud */}
        <div className="mt-2 px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
          <span className="text-[10px] text-slate-500 font-medium">Medio Directo:</span>
          <span className="font-bold text-slate-800 flex items-center gap-1">
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

        {/* Email preview if available */}
        {carrier.email && (
          <div className="mt-2 text-[11px] text-sky-800 flex items-center gap-1.5 bg-sky-50/70 px-2 py-1 rounded border border-sky-200">
            <Mail className="w-3 h-3 text-sky-600 shrink-0" />
            <span className="truncate">{carrier.email}</span>
          </div>
        )}

        {/* Phone preview if available */}
        {carrier.phone && (
          <div className="mt-1.5 text-[11px] text-slate-800 flex items-center gap-1.5 bg-slate-100/80 px-2 py-1 rounded border border-slate-200">
            <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate font-medium">{carrier.phone}</span>
          </div>
        )}

        {/* Direct Quote Platform Link if available */}
        {carrier.quoteUrl && (
          <a
            href={carrier.quoteUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-2.5 px-3 py-2 bg-linear-to-r from-[#310052] to-[#4a0d6d] hover:from-[#260040] hover:to-[#3b0858] text-white rounded-xl text-xs font-bold transition flex items-center justify-between shadow-xs group cursor-pointer border border-purple-900"
            title="Abrir plataforma o sistema de cotización en línea"
          >
            <div className="flex items-center space-x-1.5 min-w-0">
              <ExternalLink className="w-3.5 h-3.5 text-[#D2E603] shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">Cotizar en Portal Online</span>
            </div>
            <span className="text-[10px] bg-[#D2E603] text-slate-950 px-2 py-0.5 rounded font-black shrink-0">
              Acceder ↗
            </span>
          </a>
        )}

        {/* Notes preview */}
        {carrier.notes && (
          <p className="mt-2 text-[11px] text-slate-600 line-clamp-2 italic">
            "{carrier.notes}"
          </p>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
        <button
          onClick={() => onViewServiceInfo(carrier)}
          className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-[#310052] border border-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
        >
          <Info className="w-3.5 h-3.5 text-[#310052]" />
          <span>Ver Información de Servicios & Unidades</span>
        </button>

        <div className="flex items-center justify-between gap-1.5">
          <button
            onClick={() => onEvaluateCarrier && onEvaluateCarrier(carrier)}
            className="px-2.5 py-2 text-xs font-bold text-[#310052] hover:bg-purple-50 rounded-xl border border-purple-200 transition cursor-pointer flex items-center space-x-1"
            title="Evaluar puntos y agregar comentarios"
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Evaluar</span>
          </button>

          {user?.role === 'admin' &&(
              <>
          <button
            onClick={() => onEditCarrier(carrier)}
            className="px-2.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
            title="Editar proveedor"
          >
            Editar
          </button>

          {onDeleteCarrier && (
            <button
              onClick={() => onDeleteCarrier(carrier.id, carrier.name)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 hover:border-rose-200 transition cursor-pointer"
              title={`Eliminar a ${carrier.name}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          </>
          )}

          <button
            onClick={() => onSelectForQuote(carrier)}
            className="flex-1 py-2 px-3 bg-[#310052] hover:bg-[#431366] text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm hover:shadow cursor-pointer"
          >
            <span>Pedir Cotización</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D2E603]" />
          </button>
        </div>
      </div>
    </div>
  );
};


