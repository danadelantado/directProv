import React, { useState } from 'react';
import { Carrier, CarrierEvaluation } from '../types';
import { X, Star, MessageSquare, Check, ShieldCheck, User, Calendar, Award, ThumbsUp, AlertTriangle, Plus, Sparkles } from 'lucide-react';
import { PerformerLogo } from './PerformerLogo';

interface CarrierEvaluationModalProps {
  carrier: Carrier | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveEvaluation: (carrierId: string, evaluation: CarrierEvaluation) => void;
}

export const CarrierEvaluationModal: React.FC<CarrierEvaluationModalProps> = ({
  carrier,
  isOpen,
  onClose,
  onSaveEvaluation,
}) => {
  const [evaluatorName, setEvaluatorName] = useState('Equipo Performer Logistics');
  const [slaResponse, setSlaResponse] = useState(9);
  const [unitAvailability, setUnitAvailability] = useState(9);
  const [rateCompetitiveness, setRateCompetitiveness] = useState(9);
  const [trackingCommunication, setTrackingCommunication] = useState(9);
  const [customerService, setCustomerService] = useState(9);
  const [securityCompliance, setSecurityCompliance] = useState(9);
  const [comments, setComments] = useState('');
  const [recommendation, setRecommendation] = useState<CarrierEvaluation['recommendation']>('Altamente Recomendado');
  const [showAddForm, setShowAddForm] = useState(true);

  if (!isOpen || !carrier) return null;

  // Compute live average score out of 10
  const computedAverage = Number(
    ((slaResponse + unitAvailability + rateCompetitiveness + trackingCommunication + customerService + securityCompliance) / 6).toFixed(1)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) {
      alert('Por favor agrega un breve comentario u observación sobre el desempeño del proveedor.');
      return;
    }

    const newEvaluation: CarrierEvaluation = {
      id: `eval-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      evaluatorName: evaluatorName.trim() || 'Evaluador Performer',
      overallScore: computedAverage,
      criteriaScores: {
        slaResponse,
        unitAvailability,
        rateCompetitiveness,
        trackingCommunication,
        customerService,
        securityCompliance,
      },
      comments: comments.trim(),
      recommendation,
    };

    onSaveEvaluation(carrier.id, newEvaluation);
    setComments('');
    setShowAddForm(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (score >= 6.5) return 'text-amber-700 bg-amber-50 border-amber-300';
    return 'text-rose-700 bg-rose-50 border-rose-300';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-white border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <PerformerLogo size="sm" variant="dark" />
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>Evaluación de Desempeño y Calificación (1 al 10)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Proveedor: <strong className="text-slate-900">{carrier.name}</strong> ({carrier.mode}) — Cobertura: {carrier.coverage}
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs">
          
          {/* Current Score Summary Card */}
          <div className="p-4 bg-gradient-to-r from-purple-50 via-slate-50 to-purple-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-[#310052] text-[#D2E603] rounded-2xl shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Calificación Global Actual:
                </span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-slate-900">
                    {carrier.scoreOutOf10 && carrier.scoreOutOf10 > 0 ? `${carrier.scoreOutOf10.toFixed(1)} / 10` : '0 / 10'}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    ({(carrier.evaluations || []).length} evaluaciones registradas)
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-2 bg-[#310052] hover:bg-[#431366] text-white rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#D2E603]" />
              <span>{showAddForm ? 'Ocultar Formulario' : 'Agregar Nueva Evaluación'}</span>
            </button>
          </div>

          {/* New Evaluation Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#310052]" />
                  <span>Registrar Evaluación con Puntos Operativos (Escala 1 al 10):</span>
                </h4>
                <span className={`px-2.5 py-1 text-xs font-black rounded-lg border ${getScoreColor(computedAverage)}`}>
                  Promedio: {computedAverage} / 10
                </span>
              </div>

              {/* Evaluator & Recommendation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Nombre del Evaluador / Área:</label>
                  <input
                    type="text"
                    required
                    value={evaluatorName}
                    onChange={(e) => setEvaluatorName(e.target.value)}
                    placeholder="Ej. Operaciones Performer / Tráfico Aéreo"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-[#310052] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Dictamen / Recomendación:</label>
                  <select
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-[#310052] focus:outline-none"
                  >
                    <option value="Altamente Recomendado">🌟 Altamente Recomendado</option>
                    <option value="Conforme / Aceptable">✅ Conforme / Aceptable</option>
                    <option value="Bajo Observación">⚠️ Bajo Observación</option>
                    <option value="No Recomendado">❌ No Recomendado</option>
                  </select>
                </div>
              </div>

              {/* Sliders for the 6 Evaluation Points (1 to 10) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-200">
                
                {/* 1. SLA Response */}
                <div>
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span>1. Tiempo de Respuesta SLA:</span>
                    <strong className="text-[#310052]">{slaResponse} / 10</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={slaResponse}
                    onChange={(e) => setSlaResponse(Number(e.target.value))}
                    className="w-full accent-[#310052] cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500">Velocidad en cotizar y confirmar unidades</span>
                </div>

                {/* 2. Unit Availability */}
                <div>
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span>2. Disponibilidad de Unidades/Espacio:</span>
                    <strong className="text-[#310052]">{unitAvailability} / 10</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={unitAvailability}
                    onChange={(e) => setUnitAvailability(Number(e.target.value))}
                    className="w-full accent-[#310052] cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500">Capacidad real de asignación inmediata</span>
                </div>

                {/* 3. Rate Competitiveness */}
                <div>
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span>3. Competitividad de Tarifas:</span>
                    <strong className="text-[#310052]">{rateCompetitiveness} / 10</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={rateCompetitiveness}
                    onChange={(e) => setRateCompetitiveness(Number(e.target.value))}
                    className="w-full accent-[#310052] cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500">Precios transparentes sin costos ocultos</span>
                </div>

                {/* 4. Tracking & Communication */}
                <div>
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span>4. Seguimiento & Estatus en Tránsito:</span>
                    <strong className="text-[#310052]">{trackingCommunication} / 10</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={trackingCommunication}
                    onChange={(e) => setTrackingCommunication(Number(e.target.value))}
                    className="w-full accent-[#310052] cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500">Reportes proactivos de posicionamiento y entrega</span>
                </div>

                {/* 5. Customer Service */}
                <div>
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span>5. Atención al Cliente & Tráfico:</span>
                    <strong className="text-[#310052]">{customerService} / 10</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={customerService}
                    onChange={(e) => setCustomerService(Number(e.target.value))}
                    className="w-full accent-[#310052] cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500">Disposición de ejecutivos y resolución de problemas</span>
                </div>

                {/* 6. Security & HAZMAT Compliance */}
                <div>
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span>6. Seguridad & Cumplimiento:</span>
                    <strong className="text-[#310052]">{securityCompliance} / 10</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={securityCompliance}
                    onChange={(e) => setSecurityCompliance(Number(e.target.value))}
                    className="w-full accent-[#310052] cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500">GPS satelital, licencias SCT/DOT, pólizas</span>
                </div>

              </div>

              {/* Comments Box */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Comentarios, Experiencias & Retroalimentación Operativa *:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ej. Excelente servicio en rutas Manzanillo - Bajío. Entregaron en tiempo y nos facilitaron cuenta espejo GPS. Muy recomendable..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-[#310052] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#310052] hover:bg-[#431366] text-white font-bold rounded-xl transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4 text-[#D2E603]" />
                  <span>Guardar Evaluación ({computedAverage}/10)</span>
                </button>
              </div>
            </form>
          )}

          {/* Historical Evaluations & Comments List */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#310052]" />
              <span>Historial de Evaluaciones y Comentarios Registrados:</span>
            </h4>

            {(!carrier.evaluations || carrier.evaluations.length === 0) ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-500">
                <p className="text-xs">Aún no hay evaluaciones individuales registradas para este proveedor.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Utiliza el formulario superior para asignar la primera calificación y comentarios operativos.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {carrier.evaluations.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <strong className="text-slate-900 text-xs">{item.evaluatorName}</strong>
                          <span className="text-[10px] text-slate-400">•</span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {item.date}
                          </span>
                        </div>

                        {item.recommendation && (
                          <span className="inline-block mt-1 text-[10px] font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {item.recommendation}
                          </span>
                        )}
                      </div>

                      <span className={`px-2.5 py-1 text-xs font-black rounded-lg border shrink-0 ${getScoreColor(item.overallScore)}`}>
                        {item.overallScore.toFixed(1)} / 10
                      </span>
                    </div>

                    {/* Criteria breakdown mini chips */}
                    {item.criteriaScores && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px] bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <div>SLA: <strong>{item.criteriaScores.slaResponse}/10</strong></div>
                        <div>Unidades: <strong>{item.criteriaScores.unitAvailability}/10</strong></div>
                        <div>Tarifas: <strong>{item.criteriaScores.rateCompetitiveness}/10</strong></div>
                        <div>Tracking: <strong>{item.criteriaScores.trackingCommunication}/10</strong></div>
                        <div>Atención: <strong>{item.criteriaScores.customerService}/10</strong></div>
                        <div>Seguridad: <strong>{item.criteriaScores.securityCompliance}/10</strong></div>
                      </div>
                    )}

                    <p className="text-xs text-slate-700 font-medium italic bg-slate-50/60 p-2.5 rounded-xl border border-slate-200/60">
                      "{item.comments}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 transition cursor-pointer"
          >
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  );
};
