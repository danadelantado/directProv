import React from 'react';
import { Carrier } from '../types';
import { Truck, Globe, Layers, Zap, MessageSquare, Mail, ShieldAlert } from 'lucide-react';

interface StatsOverviewProps {
  carriers: Carrier[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ carriers }) => {
  const total = carriers.length;
  const terrestreCount = carriers.filter((c) => c.mode === 'Terrestre').length;
  const wcaCount = carriers.filter((c) => c.mode === 'WCA' || c.mode === 'Aereo').length;
  const lclCount = carriers.filter((c) => c.mode === 'LCL' || c.mode === 'Maritimo').length;

  const expressCount = carriers.filter((c) => c.responseTimeMinutes <= 30).length;
  const whatsappCount = carriers.filter((c) => c.contactChannel === 'WhatsApp').length;
  const correoCount = carriers.filter((c) => c.contactChannel === 'Correo' || c.contactChannel === 'Correo o Pagina').length;
  const hazmatCount = carriers.filter((c) => c.hazmat).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 my-4">
      {/* Total Carriers */}
      <div className="p-3 bg-white border border-slate-200/90 rounded-xl shadow-sm hover:border-slate-300 transition">
        <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
          <span>Total Proveedores</span>
          <span className="p-1 bg-slate-100 rounded text-slate-700">📦</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-black text-slate-900">{total}</span>
          <span className="text-[10px] text-slate-500 font-medium">Activos</span>
        </div>
      </div>

      {/* Terrestres */}
      <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl shadow-sm hover:border-emerald-300 transition">
        <div className="flex items-center justify-between text-emerald-800 text-[11px] font-semibold">
          <span>Terrestres</span>
          <Truck className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-black text-emerald-900">{terrestreCount}</span>
          <span className="text-[10px] text-emerald-700 font-medium">USA / MEX / AICM</span>
        </div>
      </div>

      {/* WCA Network */}
      <div className="p-3 bg-purple-50/60 border border-purple-200/80 rounded-xl shadow-sm hover:border-purple-300 transition">
        <div className="flex items-center justify-between text-[#310052] text-[11px] font-semibold">
          <span>WCA Network</span>
          <Globe className="w-3.5 h-3.5 text-[#310052]" />
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-black text-[#310052]">{wcaCount}</span>
          <span className="text-[10px] text-[#310052]/80 font-medium">Europa, Asia & Latam</span>
        </div>
      </div>

      {/* LCL Consolidadores */}
      <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl shadow-sm hover:border-blue-300 transition">
        <div className="flex items-center justify-between text-blue-800 text-[11px] font-semibold">
          <span>LCL Neutral</span>
          <Layers className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-black text-blue-900">{lclCount}</span>
          <span className="text-[10px] text-blue-700 font-medium">CTL, IFS, Newtral, FPS</span>
        </div>
      </div>

      {/* Ultra Express SLA */}
      <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl shadow-sm hover:border-amber-300 transition">
        <div className="flex items-center justify-between text-amber-800 text-[11px] font-semibold">
          <span>Respuesta &lt;30m</span>
          <Zap className="w-3.5 h-3.5 text-amber-600" />
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-black text-amber-900">{expressCount}</span>
          <span className="text-[10px] text-amber-700 font-medium">Urgencias</span>
        </div>
      </div>

      {/* Vía WhatsApp */}
      <div className="p-3 bg-teal-50/60 border border-teal-200/80 rounded-xl shadow-sm hover:border-teal-300 transition">
        <div className="flex items-center justify-between text-teal-800 text-[11px] font-semibold">
          <span>WhatsApp</span>
          <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-black text-teal-900">{whatsappCount}</span>
          <span className="text-[10px] text-teal-700 font-medium">Chat Directo</span>
        </div>
      </div>

      {/* Vía Correo */}
      <div className="p-3 bg-indigo-50/60 border border-indigo-200/80 rounded-xl shadow-sm hover:border-indigo-300 transition">
        <div className="flex items-center justify-between text-indigo-800 text-[11px] font-semibold">
          <span>Correo Oficial</span>
          <Mail className="w-3.5 h-3.5 text-indigo-600" />
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-black text-indigo-900">{correoCount}</span>
          <span className="text-[10px] text-indigo-700 font-medium">Internacional</span>
        </div>
      </div>

      {/* HAZMAT */}
      <div className="p-3 bg-rose-50/60 border border-rose-200/80 rounded-xl shadow-sm hover:border-rose-300 transition">
        <div className="flex items-center justify-between text-rose-800 text-[11px] font-semibold">
          <span>HAZMAT</span>
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-black text-rose-900">{hazmatCount}</span>
          <span className="text-[10px] text-rose-700 font-medium">Peligrosos</span>
        </div>
      </div>
    </div>
  );
};
