import React, { useState } from 'react';
import { Carrier, TransportMode, ContactChannel, AltaEntity } from '../types';
import { X, Upload, CheckCircle2, AlertTriangle, RefreshCw, Plus, Sparkles, FileText, ArrowRight, Layers, MessageSquare, Building } from 'lucide-react';
import { PerformerLogo } from './PerformerLogo';

interface CarrierBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCarriers: Carrier[];
  onImportCarriers: (newCarriers: Carrier[], updatedCarriers: Carrier[]) => void;
}

interface ParsedCandidate {
  raw: string;
  name: string;
  mode: TransportMode;
  coverage: string;
  altaEntity: AltaEntity;
  hasWhatsappGroup: boolean;
  whatsappGroup?: string;
  contactChannel: ContactChannel;
  email?: string;
  phone?: string;
  notes?: string;
  isExisting: boolean;
  existingId?: string;
  existingMatch?: Carrier;
}

export const CarrierBulkImportModal: React.FC<CarrierBulkImportModalProps> = ({
  isOpen,
  onClose,
  existingCarriers,
  onImportCarriers,
}) => {
  const [inputText, setInputText] = useState('');
  const [defaultAlta, setDefaultAlta] = useState<AltaEntity>('Performer');
  const [defaultMode, setDefaultMode] = useState<TransportMode>('Terrestre');
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [parsedCandidates, setParsedCandidates] = useState<ParsedCandidate[]>([]);

  if (!isOpen) return null;

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

  const handleParse = () => {
    if (!inputText.trim()) return;

    const lines = inputText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('#'));

    const candidates: ParsedCandidate[] = [];

    for (const line of lines) {
      // Check if comma or semicolon or pipe separated
      const parts = line.includes(';')
        ? line.split(';')
        : line.includes('|')
        ? line.split('|')
        : line.includes('\t')
        ? line.split('\t')
        : line.split(',');

      const cleanParts = parts.map((p) => p.trim());
      const name = cleanParts[0] || '';
      if (!name) continue;

      const normName = normalize(name);

      // Search for existing carrier
      const existingMatch = existingCarriers.find((c) => {
        const normExist = normalize(c.name);
        return (
          normExist === normName ||
          (normName.length > 5 && (normExist.includes(normName) || normName.includes(normExist)))
        );
      });

      // Detect mode
      let mode: TransportMode = defaultMode;
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('aereo') || lowerLine.includes('aéreo') || lowerLine.includes('air') || lowerLine.includes('aicm') || lowerLine.includes('vuelo')) {
        mode = 'Aereo';
      } else if (lowerLine.includes('wca') || lowerLine.includes('agente internacional') || lowerLine.includes('forwarder')) {
        mode = 'WCA';
      } else if (lowerLine.includes('lcl') || lowerLine.includes('maritimo') || lowerLine.includes('marítimo') || lowerLine.includes('puerto') || lowerLine.includes('manzanillo') || lowerLine.includes('altamira')) {
        mode = lowerLine.includes('lcl') ? 'LCL' : 'Terrestre';
      } else if (lowerLine.includes('terrestre') || lowerLine.includes('caja') || lowerLine.includes('trailer') || lowerLine.includes('camion')) {
        mode = 'Terrestre';
      }

      // Detect Alta (Performer vs Kosmos)
      let altaEntity: AltaEntity = defaultAlta;
      if (lowerLine.includes('ambos') || (lowerLine.includes('performer') && lowerLine.includes('kosmos'))) {
        altaEntity = 'Ambos';
      } else if (lowerLine.includes('kosmos')) {
        altaEntity = 'Kosmos';
      } else if (lowerLine.includes('performer')) {
        altaEntity = 'Performer';
      }

      // If carrier is WCA, strictly set altaEntity to Performer
      if (mode === 'WCA') {
        altaEntity = 'Performer';
      }

      // Detect WhatsApp
      const hasWhatsappGroup =
        lowerLine.includes('whatsapp') ||
        lowerLine.includes('wha') ||
        lowerLine.includes('grupo') ||
        lowerLine.includes('chat');

      let whatsappGroup: string | undefined = undefined;
      const whaMatch = line.match(/(?:grupo|wha|whatsapp)[:\s]+([^,;|]+)/i);
      if (whaMatch && whaMatch[1]) {
        whatsappGroup = whaMatch[1].trim();
      } else if (hasWhatsappGroup) {
        whatsappGroup = `Grupo ${name}`;
      }

      // Detect email
      const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const email = emailMatch ? emailMatch[0] : existingMatch?.email;

      // Detect phone
      const phoneMatch = line.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/);
      const phone = phoneMatch ? phoneMatch[0] : existingMatch?.phone;

      // Coverage
      let coverage = cleanParts[1] || existingMatch?.coverage || 'Nacional / Crossborder';
      if (cleanParts.length >= 3 && (cleanParts[1] === 'Terrestre' || cleanParts[1] === 'Aereo' || cleanParts[1] === 'WCA')) {
        coverage = cleanParts[2];
      }

      // Contact Channel
      let contactChannel: ContactChannel = 'Correo';
      if (hasWhatsappGroup && !email) {
        contactChannel = 'WhatsApp';
      } else if (lowerLine.includes('portal') || lowerLine.includes('web') || lowerLine.includes('pagina')) {
        contactChannel = 'Pagina Web';
      }

      candidates.push({
        raw: line,
        name,
        mode,
        coverage,
        altaEntity,
        hasWhatsappGroup: hasWhatsappGroup || (existingMatch?.hasWhatsappGroup ?? false),
        whatsappGroup: whatsappGroup || existingMatch?.whatsappGroup,
        contactChannel: existingMatch?.contactChannel || contactChannel,
        email,
        phone,
        notes: `Importado en lote. ${cleanParts.slice(3).join(' ')}`.trim(),
        isExisting: !!existingMatch,
        existingId: existingMatch?.id,
        existingMatch,
      });
    }

    setParsedCandidates(candidates);
    setStep('preview');
  };

  const handleApply = () => {
    const newCarriersToAdd: Carrier[] = [];
    const updatedCarriersToSave: Carrier[] = [];

    for (const cand of parsedCandidates) {
      if (cand.isExisting && cand.existingMatch) {
        // Modify existing without duplicating!
        const updated: Carrier = {
          ...cand.existingMatch,
          altaEntity: cand.altaEntity || cand.existingMatch.altaEntity || 'Performer',
          hasWhatsappGroup: cand.hasWhatsappGroup || cand.existingMatch.hasWhatsappGroup || false,
          whatsappGroup: cand.whatsappGroup || cand.existingMatch.whatsappGroup,
          email: cand.email || cand.existingMatch.email,
          phone: cand.phone || cand.existingMatch.phone,
          coverage: cand.coverage !== 'Nacional / Crossborder' ? cand.coverage : cand.existingMatch.coverage,
        };
        updatedCarriersToSave.push(updated);
      } else {
        // Create new carrier
        const newCarrier: Carrier = {
          id: `carrier-import-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: cand.name.toUpperCase(),
          mode: cand.mode,
          coverage: cand.coverage,
          contactChannel: cand.contactChannel,
          originalChannel: cand.hasWhatsappGroup ? 'WHA' : 'CORREO',
          altaEntity: cand.altaEntity,
          hasWhatsappGroup: cand.hasWhatsappGroup,
          whatsappGroup: cand.whatsappGroup,
          email: cand.email,
          phone: cand.phone,
          regions: ['USA - MEX'],
          hazmat: false,
          notes: cand.notes,
          rating: 0,
          scoreOutOf10: 0,
          evaluations: [],
          active: true,
        };
        newCarriersToAdd.push(newCarrier);
      }
    }

    onImportCarriers(newCarriersToAdd, updatedCarriersToSave);
    onClose();
  };

  const loadExample = (type: 'terrestre' | 'aereo' | 'mixto') => {
    if (type === 'terrestre') {
      setInputText(
        `Transportes MP, Terrestre, CDMX y AICM, Performer, Grupo WHA: MP Trafico, contacto@mp.mx\n` +
        `Omega Transportes, Terrestre, Laredo y Monterrey, Kosmos, Grupo WHA: OMEGA Crossborder\n` +
        `Fletes y Remolques del Norte, Terrestre, Monterrey a Nuevo Laredo, Performer, Grupo WhatsApp\n` +
        `Transportes Especializados Azteca, Terrestre, Bajio y Manzanillo, Ambos, ventas@azteca.com`
      );
    } else if (type === 'aereo') {
      setInputText(
        `Sky Global Air, Aereo, AICM / Guadalajara / Monterrey, Performer, Grupo WHA: Sky Operaciones\n` +
        `Aerotransportes del Centro, Aereo, AICM Toluca y Bajio, Kosmos, trafico@aerocentro.mx\n` +
        `Express Cargo Fly, Aereo, Cobertura Nacional e Internacional, Ambos, grupo whatsapp activo`
      );
    } else {
      setInputText(
        `Transportes Loma, Terrestre, Manzanillo y Bajio, Performer, trafico@transferloma.com.mx\n` +
        `Logistica Integral Kosmos, Terrestre, USA - MEX Laredo, Kosmos, Grupo WHA: Kosmos Laredo\n` +
        `Global Alliance Freight, WCA, Europa y Asia, Ambos, Grupo WhatsApp: Global WCA`
      );
    }
  };

  const existingCount = parsedCandidates.filter((c) => c.isExisting).length;
  const newCount = parsedCandidates.filter((c) => !c.isExisting).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-white border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-50 text-[#310052] rounded-xl border border-purple-200">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>Carga y Actualización Inteligente de Transportes</span>
                <span className="text-[10px] uppercase px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-bold">
                  Anti-Duplicados
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Pega tus transportes. Los repetidos <strong>se modificarán sin duplicarse</strong> y los nuevos se agregarán al catálogo.
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
          {step === 'input' ? (
            <div className="space-y-4">
              {/* Default Settings Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#310052]" />
                    <span>Alta Predeterminada:</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDefaultAlta('Performer')}
                      className={`py-2 px-3 rounded-xl font-bold text-xs transition border cursor-pointer ${
                        defaultAlta === 'Performer'
                          ? 'bg-[#310052] text-white border-[#310052] shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Performer
                    </button>
                    <button
                      type="button"
                      onClick={() => setDefaultAlta('Kosmos')}
                      className={`py-2 px-3 rounded-xl font-bold text-xs transition border cursor-pointer ${
                        defaultAlta === 'Kosmos'
                          ? 'bg-sky-700 text-white border-sky-700 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Kosmos
                    </button>
                    <button
                      type="button"
                      onClick={() => setDefaultAlta('Ambos')}
                      className={`py-2 px-3 rounded-xl font-bold text-xs transition border cursor-pointer ${
                        defaultAlta === 'Ambos'
                          ? 'bg-purple-900 text-[#D2E603] border-purple-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Ambos
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Modo Predeterminado:</span>
                  </label>
                  <select
                    value={defaultMode}
                    onChange={(e) => setDefaultMode(e.target.value as TransportMode)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#310052]/20"
                  >
                    <option value="Terrestre">Terrestre (Cajas 53ft, Plataformas, Camiones)</option>
                    <option value="Aereo">Aéreo (AICM, Aeropuertos, Charters)</option>
                    <option value="WCA">WCA (Agentes Internacionales / Red Global)</option>
                    <option value="LCL">LCL (Consolidación Marítima Neutral)</option>
                  </select>
                </div>
              </div>

              {/* Text Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Pega la lista de transportes (una línea por transportista):</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Ejemplos rápidos:</span>
                    <button
                      type="button"
                      onClick={() => loadExample('terrestre')}
                      className="text-[10px] font-bold text-[#310052] hover:underline"
                    >
                      Terrestres
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => loadExample('aereo')}
                      className="text-[10px] font-bold text-[#310052] hover:underline"
                    >
                      Aéreos
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => loadExample('mixto')}
                      className="text-[10px] font-bold text-[#310052] hover:underline"
                    >
                      Mixto
                    </button>
                  </div>
                </div>

                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ejemplo:
Transportes MP, Terrestre, CDMX y AICM, Performer, Grupo WHA: MP Trafico
Omega Transportes, Terrestre, Laredo y Monterrey, Kosmos, Grupo WHA: OMEGA
Fletes y Remolques del Norte, Terrestre, Monterrey - Nuevo Laredo, Performer
Sky Global Air, Aereo, AICM y Guadalajara, Ambos, trafico@skyglobal.mx"
                  rows={8}
                  className="w-full p-3.5 bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#310052] rounded-2xl font-mono text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#310052]/20 transition"
                />
              </div>

              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2 text-[11px] text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Regla de no duplicación:</strong> Si un transporte ya existe en el catálogo (por coincidencia de nombre o razón social), 
                  el sistema <strong>no creará un duplicado</strong>; en su lugar, actualizará su registro con la asignación a Performer/Kosmos y su estado de grupo de WhatsApp.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Detectados</span>
                  <span className="text-xl font-black text-slate-900">{parsedCandidates.length}</span>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                  <span className="text-[10px] text-amber-800 uppercase font-bold block">Existentes a Modificar</span>
                  <span className="text-xl font-black text-amber-900 flex items-center justify-center gap-1">
                    <RefreshCw className="w-4 h-4 text-amber-600" />
                    <span>{existingCount} (sin duplicar)</span>
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <span className="text-[10px] text-emerald-800 uppercase font-bold block">Nuevos a Agregar</span>
                  <span className="text-xl font-black text-emerald-900 flex items-center justify-center gap-1">
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>{newCount}</span>
                  </span>
                </div>
              </div>

              {/* Candidates Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">Estado</th>
                        <th className="py-2.5 px-3">Transporte</th>
                        <th className="py-2.5 px-3">Modo</th>
                        <th className="py-2.5 px-3">Alta Con</th>
                        <th className="py-2.5 px-3">Grupo WhatsApp</th>
                        <th className="py-2.5 px-3">Cobertura</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedCandidates.map((cand, idx) => (
                        <tr key={idx} className={cand.isExisting ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'bg-white hover:bg-slate-50'}>
                          <td className="py-2.5 px-3">
                            {cand.isExisting ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                <RefreshCw className="w-3 h-3 text-amber-700" />
                                Modificar existente
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                <Plus className="w-3 h-3 text-emerald-700" />
                                Nuevo registro
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {cand.name}
                            {cand.isExisting && (
                              <span className="block text-[10px] text-amber-700 font-normal">
                                Encontrado: {cand.existingMatch?.name}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-semibold text-slate-700">
                              {cand.mode}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                cand.altaEntity === 'Performer'
                                  ? 'bg-purple-100 text-[#310052] border-purple-300'
                                  : cand.altaEntity === 'Kosmos'
                                  ? 'bg-sky-100 text-sky-900 border-sky-300'
                                  : 'bg-purple-900 text-[#D2E603] border-purple-900'
                              }`}
                            >
                              {cand.altaEntity}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {cand.hasWhatsappGroup ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <MessageSquare className="w-3 h-3 text-emerald-600" />
                                <span>{cand.whatsappGroup || 'Activo'}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">Sin grupo</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs">
                            {cand.coverage}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-200">
          {step === 'input' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleParse}
                disabled={!inputText.trim()}
                className="px-5 py-2.5 bg-[#310052] hover:bg-[#431366] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-sm cursor-pointer"
              >
                <span>Analizar y Revisar Duplicados</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D2E603]" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep('input')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>← Volver a Editar Texto</span>
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#D2E603]" />
                <span>Aplicar ({newCount} Nuevos, {existingCount} Modificados)</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
