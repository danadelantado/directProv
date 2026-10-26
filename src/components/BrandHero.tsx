import React from 'react';
import { Truck, Plane, Ship, ShieldCheck, Zap, Globe, Plus, ExternalLink, Building2, MessageSquare, Upload } from 'lucide-react';
import { PerformerLogo } from './PerformerLogo';
import { useAuth } from '../context/AuthContext';

interface BrandHeroProps {
  onOpenNewCarrierModal: () => void;
  onOpenBulkImportModal?: () => void;
}

export const BrandHero: React.FC<BrandHeroProps> = ({
  onOpenNewCarrierModal,
  onOpenBulkImportModal,
}) => {
  const { user } = useAuth();
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm mb-6 p-5 sm:p-6 transition-all">
      {/* Subtle brand background accent */}
      <div className="absolute top-0 right-0 w-80 h-full bg-linear-to-l from-slate-50 via-[#310052]/5 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        
        {/* Left Column: Brand Identity & Messaging */}
        <div className="space-y-3 max-w-3xl">
          {/* Top Brand Pill & Modes */}
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="https://www.performerlogistics.com.mx"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block hover:opacity-90 transition cursor-pointer"
              title="Visitar sitio web oficial www.performerlogistics.com.mx"
            >
              <PerformerLogo size="md" variant="dark" showTagline={true} />
            </a>

            <span className="hidden sm:inline text-slate-300">|</span>

            {/* Transport Mode Badges */}
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-700 font-medium">
              <Truck className="w-3.5 h-3.5 text-[#310052]" />
              <Plane className="w-3.5 h-3.5 text-sky-600" />
              <Ship className="w-3.5 h-3.5 text-cyan-600" />
              <span className="text-[11px] text-slate-600 ml-1">Directorio Multimodal</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Catálogo Oficial Activo
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              Directorio de Proveedores y Transportistas Logísticos
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1">
              Consulta y gestión de transportistas dados de alta con <strong>Performer</strong> o <strong>Kosmos</strong>, grupos de WhatsApp activos, tipos de unidad, rutas frecuentes y coberturas.
            </p>
          </div>

          {/* Quick value badges */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#310052]" />
              <span className="font-semibold text-slate-800">Alta Performer / Kosmos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold text-slate-800">Grupos de WhatsApp</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-600" />
              <span className="font-medium text-slate-700">México, USA, Europa & Asia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-medium text-slate-700">Validación HAZMAT</span>
            </div>
          </div>
        </div>

        {/* Right Column: CTA Action */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-center gap-2.5 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-6">
          
          {user?.role === 'admin' && (
            <>
              <button
                onClick={onOpenNewCarrierModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#310052] hover:bg-[#431366] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#D2E603]" />
                <span>+ Registrar Proveedor</span>
              </button>

              {onOpenBulkImportModal && (
                <button
                  onClick={onOpenBulkImportModal}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Importar / Actualizar Lista</span>
                </button>
              )}
            </>
          )}

          <a
            href="https://www.performerlogistics.com.mx"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-slate-500 hover:text-[#310052] flex items-center gap-1 transition"
          >
            <span>performerlogistics.com.mx</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
};
