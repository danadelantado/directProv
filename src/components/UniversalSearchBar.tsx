import React from 'react';
import { Search, X, Truck, Globe, Layers, ShieldAlert, RotateCcw, Plane } from 'lucide-react';
import { TransportMode, Carrier } from '../types';

interface UniversalSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeMode: TransportMode | 'Todos';
  setActiveMode: (mode: TransportMode | 'Todos') => void;
  selectedChannel: string;
  setSelectedChannel: (channel: string) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  hazmatOnly: boolean;
  setHazmatOnly: (hazmat: boolean) => void;
  totalResultsCount: number;
  totalCarriersCount: number;
  onResetFilters: () => void;
  carriers?: Carrier[];
}

export const UniversalSearchBar: React.FC<UniversalSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  activeMode,
  setActiveMode,
  selectedChannel,
  setSelectedChannel,
  selectedRegion,
  setSelectedRegion,
  hazmatOnly,
  setHazmatOnly,
  totalResultsCount,
  totalCarriersCount,
  onResetFilters,
}) => {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    activeMode !== 'Todos' ||
    selectedChannel !== 'Todos' ||
    selectedRegion !== 'Todas' ||
    hazmatOnly;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm my-6 transition-all">
      {/* Search Header & Prompt */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-4 h-4 text-[#310052]" />
            <span>Buscador y Filtros de Proveedores</span>
          </h2>
          <p className="text-xs text-slate-500">
            Filtra por país, puerto o combinación de unidad y ruta (ej. <em>Suiza, China, Manzanillo, Caja 53 Laredo, AICM</em>).
          </p>
        </div>

        {/* Results Counter Tag */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="inline-flex items-center px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-full text-xs font-semibold">
            {totalResultsCount} de {totalCarriersCount} proveedores disponibles
          </span>
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full font-medium transition cursor-pointer"
              title="Limpiar búsqueda y filtros"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Search Input Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Escribe país, puerto, unidad o ruta (ej. 'Alemania', 'Suiza', 'nissan manzanillo', 'caja 53 laredo')..."
          className="w-full pl-11 pr-10 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-300 focus:border-[#310052] rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#310052]/20 transition shadow-inner"
        />

        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
            title="Borrar texto"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Secondary Filter Controls Row */}
      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Mode Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Modo de Transporte
          </label>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveMode('Todos')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition cursor-pointer text-center ${
                activeMode === 'Todos'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveMode('Terrestre')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition cursor-pointer text-center flex items-center justify-center gap-1 ${
                activeMode === 'Terrestre'
                  ? 'bg-[#310052] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3 h-3" />
              <span>Terrestre</span>
            </button>
            <button
              onClick={() => setActiveMode('Aereo')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition cursor-pointer text-center flex items-center justify-center gap-1 ${
                activeMode === 'Aereo'
                  ? 'bg-[#310052] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#310052]'
              }`}
            >
              <Plane className="w-3 h-3" />
              <span>Aéreos</span>
            </button>
            <button
              onClick={() => setActiveMode('WCA')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition cursor-pointer text-center flex items-center justify-center gap-1 ${
                activeMode === 'WCA'
                  ? 'bg-[#310052] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#310052]'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>WCA</span>
            </button>
            <button
              onClick={() => setActiveMode('LCL')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition cursor-pointer text-center flex items-center justify-center gap-1 ${
                activeMode === 'LCL'
                  ? 'bg-[#310052] text-white shadow-sm'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>LCL</span>
            </button>
            <button
              onClick={() => setActiveMode('LCL')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition cursor-pointer text-center flex items-center justify-center gap-1 ${
                activeMode === 'FCL'
                  ? 'bg-[#310052] text-white shadow-sm'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>FCL</span>
            </button>
          </div>
        </div>

        {/* Region Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Región / Cobertura
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-200 text-xs font-medium text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#310052]/20 focus:border-[#310052]"
          >
            <option value="Todas">Todas las Regiones</option>
            <option value="México / Local">🇲🇽 México / Local / Manzanillo / Altamira</option>
            <option value="USA - MEX">🇺🇸🇲🇽 USA - México (Crossborder)</option>
            <option value="Europa">🇪🇺 Europa (Alemania, Suiza, etc.)</option>
            <option value="Asia">🇨🇳 Asia (China, Hong Kong, etc.)</option>
            <option value="Sudamérica">🌎 Sudamérica</option>
          </select>
        </div>

        {/* Channel Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Canal de Contacto
          </label>
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-200 text-xs font-medium text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#310052]/20 focus:border-[#310052]"
          >
            <option value="Todos">Todos los Canales</option>
            <option value="WhatsApp">💬 Grupos de WhatsApp</option>
            <option value="Correo">✉️ Correo Oficial</option>
            <option value="Pagina">🌐 Portal Web / Cotizador</option>
          </select>
        </div>

        {/* HAZMAT Toggle */}
        <div className="flex flex-col justify-end">
          <button
            onClick={() => setHazmatOnly(!hazmatOnly)}
            className={`w-full py-1.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
              hazmatOnly
                ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm ring-1 ring-rose-300'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${hazmatOnly ? 'text-rose-600' : 'text-slate-400'}`} />
            <span>Filtro HAZMAT (Peligrosos)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
