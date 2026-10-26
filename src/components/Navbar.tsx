import React from 'react';
import { Truck, Globe, Layers, Plus, Download, RotateCcw, Search, Scale, Plane, Upload, Ship, ShieldCheck } from 'lucide-react';
import { TransportMode } from '../types';
import { PerformerLogo } from './PerformerLogo';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeMode: TransportMode | 'Todos';
  setActiveMode: (mode: TransportMode | 'Todos') => void;
  totalCounts: {
    todos: number;
    terrestre: number;
    aereo: number;
    wca: number;
    lcl: number;
    fcl: number;
  };
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenNewCarrierModal: () => void;
  onOpenBulkImportModal?: () => void;
  onOpenCompareModal: () => void;
  compareCount: number;
  onExportCSV: () => void;
  onResetData: () => void;
  onOpenAdminPanel: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeMode,
  setActiveMode,
  totalCounts,
  searchQuery,
  setSearchQuery,
  onOpenNewCarrierModal,
  onOpenBulkImportModal,
  onOpenCompareModal,
  compareCount,
  onExportCSV,
  onResetData,
  onOpenAdminPanel,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Brand & Title */}
          <div className="flex items-center justify-between">
            <a
              href="https://www.performerlogistics.com.mx"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 hover:opacity-90 transition group cursor-pointer"
              title="Ir a la página oficial www.performerlogistics.com.mx"
            >
              <PerformerLogo size="md" variant="dark" showTagline={true} />
            </a>

            {/* Mobile quick actions */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={onOpenNewCarrierModal}
                className="p-2 bg-[#310052] text-white rounded-lg hover:bg-[#431366] text-xs font-bold transition"
                title="Nuevo Proveedor"
              >
                <Plus className="w-4 h-4 text-[#D2E603]" />
              </button>
            </div>
          </div>

          {/* Search Bar & Primary Actions */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-55">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar (ej. nissan manzanillo, caja 53...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#310052]/20 focus:border-[#310052] transition"
              />
            </div>

            {/* Comparar Button */}
            <button
              onClick={onOpenCompareModal}
              disabled={compareCount === 0}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                compareCount > 0
                  ? 'bg-[#310052] hover:bg-[#431366] text-white border-[#310052] shadow-sm cursor-pointer'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Comparar</span>
              {compareCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-[#D2E603] text-slate-950 rounded-full font-bold">
                  {compareCount}
                </span>
              )}
            </button>

            {/* Export CSV */}
            <button
              onClick={onExportCSV}
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs border border-slate-200 transition cursor-pointer"
              title="Exportar catálogo a CSV / Excel"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV</span>
            </button>

            {/* Reset Data */}
            <button
              onClick={onResetData}
              className="hidden sm:flex items-center space-x-1 px-2 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs transition cursor-pointer"
              title="Restaurar catálogo inicial"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Bulk Import / Update Carriers */}
            {user?.role === 'admin' && (
              <>
            {onOpenBulkImportModal && (
              <button
                onClick={onOpenBulkImportModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold transition cursor-pointer"
                title="Cargar y actualizar lista masiva de transportes (sin duplicados)"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-700" />
                <span>Importar / Actualizar Lista</span>
              </button>
            )}

            
              <button
                onClick={onOpenAdminPanel}
                className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#310052] border border-purple-200 rounded-lg text-xs font-bold transition cursor-pointer"
                title="Gestionar Usuarios y Roles"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Panel Admin</span>
                </button>

            {/* New Carrier Button */}
            <button
              onClick={onOpenNewCarrierModal}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-[#310052] hover:bg-[#431366] text-white rounded-lg text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#D2E603]" />
              <span>+ Agregar Proveedor</span>
            </button>
            </>
            )}

            <button
              onClick={logout}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-xs font-bold transition cursor-pointer ml-1"
              title="Cerrar Sesión"
            >
              Salir
            </button>
          </div>
        </div>

        {/* Primary Mode Selector Tabs */}
        <div className="flex items-center justify-between border-t border-slate-100 mt-2.5 pt-2 overflow-x-auto no-scrollbar gap-2">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setActiveMode('Todos')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeMode === 'Todos'
                  ? 'bg-[#310052] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Todos ({totalCounts.todos})
            </button>

            <button
              onClick={() => setActiveMode('Terrestre')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeMode === 'Terrestre'
                  ? 'bg-[#310052] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#310052] hover:bg-slate-100'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Terrestre ({totalCounts.terrestre})</span>
            </button>

            <button
              onClick={() => setActiveMode('Aereo')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeMode === 'Aereo'
                  ? 'bg-[#310052] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#310052] hover:bg-slate-100'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Aéreos ({totalCounts.aereo})</span>
            </button>

            <button
              onClick={() => setActiveMode('WCA')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeMode === 'WCA'
                  ? 'bg-[#310052] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#310052] hover:bg-slate-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>WCA ({totalCounts.wca})</span>
            </button>

            <button
              onClick={() => setActiveMode('LCL')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeMode === 'LCL'
                  ? 'bg-[#310052] text-white shadow-sm'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>LCL ({totalCounts.lcl})</span>
            </button>

              <button
              onClick={() => setActiveMode('FCL')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeMode === 'FCL'
                  ? 'bg-[#310052] text-white shadow-sm'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>FCL ({totalCounts.fcl})</span>
            </button>
          </div>

          {/* Company Website Link */}
          <a
            href="https://www.performerlogistics.com.mx"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center space-x-2 text-xs font-semibold text-[#310052] hover:text-[#431366] bg-slate-100 hover:bg-slate-200 px-3.5 py-1 rounded-full border border-slate-200 transition cursor-pointer"
            title="Visitar sitio web oficial de Performer Logistics"
          >
            <Globe className="w-3.5 h-3.5 text-[#310052]" />
            <span>www.performerlogistics.com.mx</span>
          </a>
        </div>

      </div>
    </header>
  );
};

