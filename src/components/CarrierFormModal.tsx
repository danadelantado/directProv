import React, { useState, useEffect } from 'react';
import { Carrier, TransportMode, ContactChannel, GeographicRegion, AltaEntity } from '../types';
import { X, Save, ShieldAlert, Truck, MapPin, Route, ShieldCheck, Mail, Trash2, Building2, MessageSquare } from 'lucide-react';
import { PerformerLogo } from './PerformerLogo';

interface CarrierFormModalProps {
  carrierToEdit: Carrier | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (carrierData: Carrier) => void;
  onDelete?: (carrierId: string, carrierName: string) => void;
}

const getCoordinatesFromText = async (locationText: string, defaultName: string): Promise<any[]> => {
  let cleanText = (locationText || '').toLowerCase().replace(/patio|base|oficina|bodega/gi, '').trim();

  try {
    const API_KEY = '6f8a21c0f6274f4e940c2e20b117a6c9'; 
    
    const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(cleanText)}&key=${API_KEY}&limit=1&countrycode=mx,us`);
    const data = await response.json();

    if (data && data.results && data.results.length > 0) {
      const location = data.results[0].geometry;
      return [{
        name: defaultName || 'Patio Principal',
        city: locationText.split(',')[0].trim().charAt(0).toUpperCase() + locationText.split(',')[0].trim().slice(1),
        country: 'Detectado automáticamente',
        lat: location.lat,
        lng: location.lng,
        type: 'Patio / Base'
      }];
    }
  } catch (error) {
    console.error("Error al contactar a OpenCage:", error);
  }

  return [{
    name: 'Base Central',
    city: 'Torreón',
    country: 'México',
    lat: 25.5428,
    lng: -103.4068,
    type: 'Patio / Base'
  }];
};

export const CarrierFormModal: React.FC<CarrierFormModalProps> = ({
  carrierToEdit,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [wcaId, setWcaId] = useState('');
  const [mode, setMode] = useState<TransportMode>('Terrestre');
  const [altaEntity, setAltaEntity] = useState<AltaEntity>('Performer');
  const [coverage, setCoverage] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [unitTypesText, setUnitTypesText] = useState('');
  const [frequentRoutesText, setFrequentRoutesText] = useState('');
  const [servicesOfferedText, setServicesOfferedText] = useState('');
  const [contactChannel, setContactChannel] = useState<ContactChannel>('Correo');
  const [originalChannel, setOriginalChannel] = useState('CORREO');
  const [hasWhatsappGroup, setHasWhatsappGroup] = useState(false);
  const [whatsappGroup, setWhatsappGroup] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [quoteUrl, setQuoteUrl] = useState('');
  const [hazmat, setHazmat] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (carrierToEdit) {
      setName(carrierToEdit.name);
      setWcaId(carrierToEdit.wcaId || '');
      setMode(carrierToEdit.mode);
      setAltaEntity(carrierToEdit.altaEntity || 'Performer');
      setCoverage(carrierToEdit.coverage);
      setLocation(carrierToEdit.location || '');
      setAddress(carrierToEdit.address || '');
      setUnitTypesText((carrierToEdit.unitTypes || []).join('\n'));
      setFrequentRoutesText((carrierToEdit.frequentRoutes || []).join('\n'));
      setServicesOfferedText((carrierToEdit.servicesOffered || []).join('\n'));
      setContactChannel(carrierToEdit.contactChannel);
      setOriginalChannel(carrierToEdit.originalChannel);
      const hasWha = Boolean(
        carrierToEdit.hasWhatsappGroup ||
        (carrierToEdit.whatsappGroup && carrierToEdit.whatsappGroup.trim().length > 0) ||
        carrierToEdit.contactChannel === 'WhatsApp'
      );
      setHasWhatsappGroup(hasWha);
      setWhatsappGroup(carrierToEdit.whatsappGroup || '');
      setPhone(carrierToEdit.phone || '');
      setEmail(carrierToEdit.email || '');
      setWebsite(carrierToEdit.website || '');
      setQuoteUrl(carrierToEdit.quoteUrl || '');
      setHazmat(carrierToEdit.hazmat);
      setNotes(carrierToEdit.notes || '');
    } else {
      // Defaults for new carrier
      setName('');
      setWcaId('');
      setMode('Terrestre');
      setAltaEntity('Performer');
      setCoverage('USA - MEX');
      setLocation('');
      setAddress('');
      setUnitTypesText('');
      setFrequentRoutesText('');
      setServicesOfferedText('');
      setContactChannel('Correo');
      setOriginalChannel('CORREO');
      setHasWhatsappGroup(false);
      setWhatsappGroup('');
      setPhone('');
      setEmail('');
      setWebsite('');
      setQuoteUrl('');
      setHazmat(false);
      setNotes('');
    }
  }, [carrierToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !coverage.trim()) return;

    const regions: GeographicRegion[] = [];
    const lower = coverage.toLowerCase();
    if (lower.includes('usa') || lower.includes('mex')) regions.push('USA - MEX');
    if (lower.includes('aicm') || lower.includes('altamira') || lower.includes('mexico general') || lower.includes('manzanillo')) regions.push('México / Local');
    if (lower.includes('francia') || lower.includes('alemania') || lower.includes('italia') || lower.includes('europa') || lower.includes('españa')) regions.push('Europa');
    if (lower.includes('asia') || lower.includes('china')) regions.push('Asia / China');
    if (lower.includes('brasil')) regions.push('Sudamérica');
    if (regions.length === 0) regions.push('Global / Cualquier País');

    const unitTypes = unitTypesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const frequentRoutes = frequentRoutesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const servicesOffered = servicesOfferedText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const textToSearch = location.trim() || coverage.trim() || 'Torreón'; 
    const generatedHubs = await getCoordinatesFromText(textToSearch, name.trim());

    const carrierData: Carrier = {
      ...(carrierToEdit || {}),
      id: carrierToEdit ? carrierToEdit.id : `carrier-custom-${Date.now()}`,
      wcaId: wcaId.trim() ? wcaId.trim() : undefined,
      name: name.trim(),
      mode,
      altaEntity,
      hasWhatsappGroup,
      coverage: coverage.trim(),
      location: location.trim() || undefined,
      address: address.trim() || undefined,
      unitTypes: unitTypes.length > 0 ? unitTypes : undefined,
      frequentRoutes: frequentRoutes.length > 0 ? frequentRoutes : undefined,
      servicesOffered: servicesOffered.length > 0 ? servicesOffered : undefined,
      contactChannel,
      originalChannel: originalChannel.trim() || (contactChannel === 'WhatsApp' ? 'WHA' : 'CORREO'),
      hazmat,
      whatsappGroup: whatsappGroup.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      website: website.trim() || undefined,
      quoteUrl: quoteUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      regions: regions.length > 0 ? regions : ['USA - MEX'],
      scoreOutOf10: carrierToEdit?.scoreOutOf10 ?? 0,
      evaluations: carrierToEdit?.evaluations ?? [],
      
      hubs: (carrierToEdit?.hubs && carrierToEdit.hubs.length > 0) ? carrierToEdit.hubs : generatedHubs,
    active: true,
  };

  console.log("1. Qué texto se busco?", location.trim() || coverage.trim());
  console.log("2. Que coordenadas regresa?", generatedHubs);
  console.log("3. Objeto completo a guardar:", carrierData);

    onSave(carrierData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-white border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <PerformerLogo size="sm" variant="dark" />
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {carrierToEdit ? 'Editar Proveedor de Transporte' : 'Registrar Nuevo Proveedor'}
              </h3>
              <p className="text-xs text-slate-500">
                Catálogo de proveedores y convenios logísticos (Performer / Kosmos)
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Alta con: Performer / Kosmos / Ambos */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
            <label className="block font-black text-slate-900 mb-2 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Building2 className="w-4 h-4 text-[#310052]" />
              <span>¿Dado de Alta con cuál entidad?</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setAltaEntity('Performer')}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition border cursor-pointer ${
                  altaEntity === 'Performer'
                    ? 'bg-[#310052] text-white border-[#310052] shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Performer
              </button>
              <button
                type="button"
                onClick={() => setAltaEntity('Kosmos')}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition border cursor-pointer ${
                  altaEntity === 'Kosmos'
                    ? 'bg-sky-700 text-white border-sky-700 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Kosmos
              </button>
              <button
                type="button"
                onClick={() => setAltaEntity('Ambos')}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition border cursor-pointer ${
                  altaEntity === 'Ambos'
                    ? 'bg-purple-900 text-[#D2E603] border-purple-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Ambos
              </button>
              <button
                type="button"
                onClick={() => setAltaEntity('Ninguno')}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition border cursor-pointer ${
                  altaEntity === 'Ninguno'
                    ? 'bg-slate-700 text-white border-slate-700 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Sin Alta / Trámite
              </button>
            </div>
          </div>

          {/* Nombre y Modo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Nombre del Proveedor *</label>
              <input
                type="text"
                required
                placeholder="Ej. TRANSPORTES LOMA, CARGO JET, SKY GLOBAL"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#310052] font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Modo de Transporte</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as TransportMode)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#310052]"
              >
                <option value="Terrestre">Terrestre (Cajas 53ft, Plataformas, Camiones)</option>
                <option value="Aereo">Aéreo (AICM, Charters, Aerolíneas)</option>
                <option value="WCA">WCA (Agente Internacional / Red WCA)</option>
                <option value="LCL">LCL (Consolidación Marítima Neutral)</option>
                <option value="FCL">FCL (Carga Completa de Contenedor)</option>
              </select>
            </div>
          </div>

          {/* ID WCA */}
          <div>
            <label className="block font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span>ID / Membresía Oficial WCA (Opcional)</span>
              <span className="text-[10px] text-amber-700 font-medium">Para agentes de la red internacional WCA</span>
            </label>
            <input
              type="text"
              placeholder="Ej. 27841, 91402, 114521"
              value={wcaId}
              onChange={(e) => setWcaId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#310052] font-mono"
            />
          </div>

          {/* Cobertura y Ubicación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>Cobertura Geográfica *</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. USA - MEX, MANZANILLO - GUADALAJARA, GLOBAL"
                value={coverage}
                onChange={(e) => setCoverage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#310052]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Patios / Bases / Instalaciones</label>
              <input
                type="text"
                placeholder="Ej. Torreón, Coahuila; Laredo, Texas; Madrid, España"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#310052]"
              />
            </div>
          </div>

          {/* Domicilio físico */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">Domicilio / Dirección de Oficinas</label>
            <input
              type="text"
              placeholder="Ej. Carr. Manzanillo-Minatitlán Km 4.5, Col. Tapeixtles, Manzanillo, Col."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#310052]"
            />
          </div>

          {/* Unidades & Flota */}
          <div>
            <label className="block font-bold text-slate-800 mb-1 flex items-center space-x-1">
              <Truck className="w-3.5 h-3.5 text-[#310052]" />
              <span>Tipo de Unidades & Flota (Una por línea)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Porta contenedor 20/40 (Sencillo y Full)&#10;Full de planas y chasis 20/40&#10;Camioneta 1.5 ton (Nissan NP300 / Caja Seca)&#10;Camioneta 3.5 ton (3.2 tons | 17 CBM)"
              value={unitTypesText}
              onChange={(e) => setUnitTypesText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#310052] font-mono text-[11px]"
            />
          </div>

          {/* Rutas Frecuentes */}
          <div>
            <label className="block font-bold text-slate-800 mb-1 flex items-center space-x-1">
              <Route className="w-3.5 h-3.5 text-sky-600" />
              <span>Rutas Frecuentes / Corredores (Una por línea)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Puerto de Manzanillo ➔ Guadalajara / Jalisco&#10;Puerto de Manzanillo ➔ CDMX / Bajío"
              value={frequentRoutesText}
              onChange={(e) => setFrequentRoutesText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#310052] font-mono text-[11px]"
            />
          </div>

          {/* Servicios Ofrecidos */}
          <div>
            <label className="block font-bold text-slate-800 mb-1 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Servicios Especiales & Equipamiento (Uno por línea)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Patio propio con seguridad 24/7&#10;Monitoreo GPS en tiempo real&#10;Cuenta espejo para clientes"
              value={servicesOfferedText}
              onChange={(e) => setServicesOfferedText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#310052] font-mono text-[11px]"
            />
          </div>

          {/* Grupo de WhatsApp (Independiente del canal de contacto directo) */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasWhatsappGroup}
                  onChange={(e) => setHasWhatsappGroup(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="font-bold text-emerald-950 text-xs flex items-center space-x-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>¿Tenemos grupo de WhatsApp activo con este transportista?</span>
                </span>
              </label>
              <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full font-bold">
                Aparece en la tarjeta
              </span>
            </div>

            {hasWhatsappGroup && (
              <div>
                <label className="block font-semibold text-emerald-900 mb-1 text-[11px]">
                  Nombre o Identificador del Grupo en WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="Ej. PERFORMER - TRANSPORTES ABC o Grupo Cotizaciones"
                  value={whatsappGroup}
                  onChange={(e) => setWhatsappGroup(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Canales de Contacto Directo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Medio Directo para Cotizar</label>
              <select
                value={contactChannel}
                onChange={(e) => {
                  const ch = e.target.value as ContactChannel;
                  setContactChannel(ch);
                  if (ch === 'WhatsApp') setOriginalChannel('WHA');
                  else if (ch === 'Correo') setOriginalChannel('CORREO');
                  else if (ch === 'Correo o Pagina') setOriginalChannel('CORREO O PAGINA');
                  else setOriginalChannel('PAGINA');
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#310052]"
              >
                <option value="Correo">Correo Electrónico</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Pagina Web">Página Web / Portal</option>
                <option value="Correo o Pagina">Correo o Portal Web</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-[#310052]" />
                <span>Correos Electrónicos</span>
              </label>
              <input
                type="text"
                placeholder="trafico@carrier.com, ventas@carrier.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#310052]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Teléfono Directo de Tráfico</label>
              <input
                type="text"
                placeholder="Ej. +52 (55) 1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#310052]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Página Web Principal</label>
              <input
                type="text"
                placeholder="https://www.carrier.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#310052]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              URL / Enlace del Sistema o Portal de Cotizaciones Online
            </label>
            <input
              type="text"
              placeholder="Ej. https://sistema.logikoss.com/login"
              value={quoteUrl}
              onChange={(e) => setQuoteUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#310052]"
            />
            <p className="text-[11px] text-slate-500 mt-0.5">
              Si el proveedor tiene portal digital de cotizaciones, los usuarios podrán acceder con un clic desde su ficha.
            </p>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <label className="flex items-center space-x-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
              <input
                type="checkbox"
                checked={hazmat}
                onChange={(e) => setHazmat(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded bg-white border-slate-300 focus:ring-rose-500"
              />
              <span className="font-bold text-rose-800 text-xs flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Certificado para Materiales Peligrosos (HAZMAT)</span>
              </span>
            </label>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Notas / Especialidades</label>
            <textarea
              rows={2}
              placeholder="Instrucciones especiales, tipos de caja, restricciones..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#310052]"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            {carrierToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(carrierToEdit.id, carrierToEdit.name);
                  onClose();
                }}
                className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer"
                title={`Eliminar permanentemente a ${carrierToEdit.name}`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar Proveedor</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#310052] hover:bg-[#431366] text-white rounded-xl font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer text-xs"
              >
                <Save className="w-4 h-4 text-[#D2E603]" />
                <span>{carrierToEdit ? 'Guardar Cambios' : 'Agregar Proveedor'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
