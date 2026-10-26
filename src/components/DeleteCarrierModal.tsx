import React from 'react';
import { Carrier } from '../types';
import { getCarrierResidence } from '../utils/geoResidence';
import { Trash2, AlertTriangle, ArrowLeft, MapPin, ShieldAlert } from 'lucide-react';

interface DeleteCarrierModalProps {
  carrier: Carrier | null;
  isOpen: boolean;
  onConfirmDelete: () => void;
  onCancelAndReturnHome: () => void;
}

export const DeleteCarrierModal: React.FC<DeleteCarrierModalProps> = ({
  carrier,
  isOpen,
  onConfirmDelete,
  onCancelAndReturnHome,
}) => {
  if (!isOpen || !carrier) return null;

  const residence = getCarrierResidence(carrier);

  return (
    <div
      id="delete-carrier-modal-backdrop"
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div
        id="delete-carrier-modal-card"
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150"
      >
        {/* Top Warning Visual Banner */}
        <div className="bg-rose-50 border-b border-rose-100 px-6 pt-6 pb-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto shadow-xs mb-3">
            <Trash2 className="w-7 h-7" />
          </div>
          <h2 id="delete-modal-title" className="text-lg font-black text-slate-900 leading-tight">
            ¿Estás segura de que deseas eliminar este proveedor?
          </h2>
          <p className="text-xs text-rose-800 font-medium mt-1.5 leading-relaxed">
            Esta acción lo eliminará de la lista y de la base de datos local de forma permanente.
          </p>
        </div>

        {/* Carrier Details Card */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-black text-slate-900">{carrier.name}</h3>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                      carrier.mode === 'Terrestre'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : carrier.mode === 'WCA' || carrier.mode === 'Aereo'
                        ? 'bg-purple-50 text-[#310052] border-purple-200 font-black'
                        : 'bg-blue-50 text-blue-800 border-blue-200 font-black'
                    }`}
                  >
                    {carrier.mode}
                  </span>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-white text-slate-800 border border-slate-200 rounded-md">
                    <span>{residence.flag}</span>
                    <span>{residence.country}</span>
                  </span>

                  {carrier.hazmat && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold bg-rose-50 text-rose-800 border border-rose-200 rounded-md">
                      <ShieldAlert className="w-2.5 h-2.5 text-rose-600" />
                      <span>HAZMAT</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {carrier.coverage && (
              <div className="mt-2.5 text-[11px] text-slate-600 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                <span className="truncate">{carrier.coverage}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 text-center">
            Para proceder con la eliminación presiona <strong>"Sí"</strong>. Si deseas cancelar y volver al catálogo principal presiona <strong>"No"</strong>.
          </p>

          {/* Action Buttons: Sí and No */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Botón NO: Regresa al inicio */}
            <button
              type="button"
              id="delete-modal-no-btn"
              onClick={onCancelAndReturnHome}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold text-sm rounded-xl transition flex items-center justify-center space-x-2 border border-slate-300 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>No</span>
            </button>

            {/* Botón SÍ: Elimina el proveedor */}
            <button
              type="button"
              id="delete-modal-yes-btn"
              onClick={onConfirmDelete}
              className="py-3 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-sm rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm hover:shadow"
            >
              <Trash2 className="w-4 h-4 text-white" />
              <span>Sí</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
