/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Carrier, TransportMode, CarrierEvaluation, AltaEntity } from './types';
import { INITIAL_CARRIERS } from './data/initialCarriers';
import { NEW_PRESENTATION_CARRIERS } from './data/newPresentationsCarriers';
import { Navbar } from './components/Navbar';
import { BrandHero } from './components/BrandHero';
import { PerformerLogo } from './components/PerformerLogo';
import { UniversalSearchBar } from './components/UniversalSearchBar';
import { CarrierCard } from './components/CarrierCard';
import { CarrierTable } from './components/CarrierTable';
import { QuoteModal } from './components/QuoteModal';
import { CompareModal } from './components/CompareModal';
import { CarrierFormModal } from './components/CarrierFormModal';
import { CarrierBulkImportModal } from './components/CarrierBulkImportModal';
import { CarrierServiceInfoModal } from './components/CarrierServiceInfoModal';
import { InteractiveLogisticsMap } from './components/InteractiveLogisticsMap';
import { CarrierEvaluationModal } from './components/CarrierEvaluationModal';
import { DeleteCarrierModal } from './components/DeleteCarrierModal';
import { matchesCarrierResidenceSearch, getCarrierResidence } from './utils/geoResidence';
import { LayoutGrid, Table, Search, Truck, Plane, Ship, ShieldAlert, Sparkles, Plus, MapPin, CheckCircle2, RotateCcw } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { AdminPanel } from './components/AdminPanel';
import { Register } from './components/Register';
import { ResetPassword } from './components/ResetPassword';
import { supabase } from './supabaseClient'; 
import { UpdatePassword } from './components/UpdatePassword';

const STORAGE_KEY = 'cat_carriers_logistica_v82';
const DELETED_CARRIERS_KEY = 'cat_deleted_carrier_ids_v1';

/**
 * Helper to normalize string for comparison
 */
function normalizeText(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

interface DeletedStore {
  ids: string[];
  names: string[];
}

function getDeletedStore(): DeletedStore {
  try {
    const raw = localStorage.getItem(DELETED_CARRIERS_KEY);
    if (!raw) return { ids: [], names: [] };
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return { ids: parsed, names: [] };
    }
    if (parsed && typeof parsed === 'object') {
      return {
        ids: Array.isArray(parsed.ids) ? parsed.ids : [],
        names: Array.isArray(parsed.names) ? parsed.names : [],
      };
    }
  } catch (e) {}
  return { ids: [], names: [] };
}

function saveDeletedStore(store: DeletedStore) {
  try {
    localStorage.setItem(DELETED_CARRIERS_KEY, JSON.stringify(store));
  } catch (e) {}
}

function isCarrierDeleted(id: string, name: string, store: DeletedStore): boolean {
  if (store.ids.includes(id)) return true;
  const norm = normalizeText(name);
  if (norm && store.names.includes(norm)) return true;
  return false;
}

/**
 * Merge new presentation carriers into a carrier list without creating duplicates
 * and preserving any existing user manual edits.
 */
function mergeNewPresentations(targetList: Carrier[], deletedStore: DeletedStore): Carrier[] {
  const result = [...targetList];

  for (const newC of NEW_PRESENTATION_CARRIERS) {
    if (isCarrierDeleted(newC.id, newC.name, deletedStore)) {
      continue;
    }
    const newNorm = normalizeText(newC.name);
    const matchIndex = result.findIndex((r) => {
      if (r.id === newC.id) return true;
      const rNorm = normalizeText(r.name);
      if (rNorm === newNorm) return true;
      // Partial matching for clear distinct brands
      if (newNorm.length >= 5 && rNorm.includes(newNorm)) return true;
      if (rNorm.length >= 5 && newNorm.includes(rNorm)) return true;
      return false;
    });

    if (matchIndex >= 0) {
      // Carrier already exists: update technical data without wiping user's manual customizations
      const existing = result[matchIndex];
      result[matchIndex] = {
        ...newC,
        ...existing, // user's name, custom email, whatsappGroup, altaEntity, evaluations take precedence
        coverage: (existing.coverage && existing.coverage.length > 35) ? existing.coverage : newC.coverage,
        location: existing.location || newC.location,
        address: existing.address || newC.address,
        website: existing.website || newC.website,
        phone: existing.phone || newC.phone,
        servicesOffered: Array.from(new Set([...(newC.servicesOffered || []), ...(existing.servicesOffered || [])])),
        unitTypes: Array.from(new Set([...(newC.unitTypes || []), ...(existing.unitTypes || [])])),
        frequentRoutes: Array.from(new Set([...(newC.frequentRoutes || []), ...(existing.frequentRoutes || [])])),
        hubs: (newC.hubs && newC.hubs.length > 0) ? newC.hubs : existing.hubs,
        hazmat: existing.hazmat || newC.hazmat,
      };
    } else {
      // Add new carrier
      result.push(newC);
    }
  }

  // Also ensure SIVI carrier is enriched from latest catalog without overriding user edits
  const siviIndex = result.findIndex(
    (r) => r.id === 'ter-sivi' || normalizeText(r.name).includes('sivi')
  );
  if (siviIndex >= 0) {
    const existingSivi = result[siviIndex];
    const baseSivi = INITIAL_CARRIERS.find((c) => c.id === 'ter-sivi');
    if (baseSivi && !isCarrierDeleted(baseSivi.id, baseSivi.name, deletedStore)) {
      result[siviIndex] = {
        ...baseSivi,
        ...existingSivi,
        servicesOffered: Array.from(new Set([...(baseSivi.servicesOffered || []), ...(existingSivi.servicesOffered || [])])),
        unitTypes: Array.from(new Set([...(baseSivi.unitTypes || []), ...(existingSivi.unitTypes || [])])),
        frequentRoutes: Array.from(new Set([...(baseSivi.frequentRoutes || []), ...(existingSivi.frequentRoutes || [])])),
        hubs: (baseSivi.hubs && baseSivi.hubs.length > 0) ? baseSivi.hubs : existingSivi.hubs,
      };
    }
  }

  return result;
}

/**
 * Intelligent Carrier Reconciler
 */
function loadAndReconcileCarriers(): Carrier[] {
  try {
    const deletedStore = getDeletedStore();

    const raw82 = localStorage.getItem(STORAGE_KEY);
    const raw81 = localStorage.getItem('cat_carriers_logistica_v81');
    const raw80 = localStorage.getItem('cat_carriers_logistica_v80');

    // PRIORITY 1
    if (raw82) {
      try {
        const parsed82: Carrier[] = JSON.parse(raw82);
        if (Array.isArray(parsed82) && parsed82.length > 0) {
          const active82Ids = new Set(parsed82.map((c) => c.id));
          const active82Names = new Set(parsed82.map((c) => normalizeText(c.name)));

          INITIAL_CARRIERS.forEach((init) => {
            if (!NEW_PRESENTATION_CARRIERS.some((np) => np.id === init.id)) {
              if (!active82Ids.has(init.id) && !active82Names.has(normalizeText(init.name))) {
                if (!deletedStore.ids.includes(init.id)) deletedStore.ids.push(init.id);
                const norm = normalizeText(init.name);
                if (norm && !deletedStore.names.includes(norm)) deletedStore.names.push(norm);
              }
            }
          });
          saveDeletedStore(deletedStore);

          const liveList: Carrier[] = parsed82
            .filter((c) => !isCarrierDeleted(c.id, c.name, deletedStore) && c.active !== false)
            .map((c) => {
              const isWCA = c.mode === 'WCA' || Boolean(c.wcaId);
              return {
                ...c,
                altaEntity: isWCA ? ('Performer' as AltaEntity) : (c.altaEntity || 'Performer'),
                hasWhatsappGroup:
                  c.hasWhatsappGroup !== undefined
                    ? c.hasWhatsappGroup
                    : Boolean(c.whatsappGroup && c.whatsappGroup.trim().length > 0) || c.contactChannel === 'WhatsApp',
              };
            });

          const merged = mergeNewPresentations(liveList, deletedStore);

          const finalCarriers = merged
            .filter((c) => !isCarrierDeleted(c.id, c.name, deletedStore))
            .map((c) => {
              if (c.mode === 'WCA' || Boolean(c.wcaId)) {
                return { ...c, altaEntity: 'Performer' as AltaEntity };
              }
              return c;
            });

          localStorage.setItem(STORAGE_KEY, JSON.stringify(finalCarriers));
          return finalCarriers;
        }
      } catch (e) {
        console.error('Error parsing STORAGE_KEY in reconciler:', e);
      }
    }

    // PRIORITY 2
    const parsed81: Carrier[] | null = raw81 ? JSON.parse(raw81) : null;
    const parsed80: Carrier[] | null = raw80 ? JSON.parse(raw80) : null;
    const pristineSource: Carrier[] | null =
      (parsed81 && Array.isArray(parsed81) && parsed81.length > 0)
        ? parsed81
        : (parsed80 && Array.isArray(parsed80) && parsed80.length > 0)
        ? parsed80
        : null;

    if (pristineSource && Array.isArray(pristineSource) && pristineSource.length > 0) {
      const pristineIdSet = new Set(pristineSource.map((c) => c.id));
      INITIAL_CARRIERS.forEach((init) => {
        if (!NEW_PRESENTATION_CARRIERS.some((np) => np.id === init.id)) {
          if (!pristineIdSet.has(init.id)) {
            if (!deletedStore.ids.includes(init.id)) deletedStore.ids.push(init.id);
            const norm = normalizeText(init.name);
            if (norm && !deletedStore.names.includes(norm)) deletedStore.names.push(norm);
          }
        }
      });
      saveDeletedStore(deletedStore);

      const reconciled: Carrier[] = pristineSource
        .filter((c) => !isCarrierDeleted(c.id, c.name, deletedStore) && c.active !== false)
        .map((c) => {
          const base = INITIAL_CARRIERS.find((init) => init.id === c.id);
          const isWCA = c.mode === 'WCA' || Boolean(c.wcaId) || base?.mode === 'WCA' || Boolean(base?.wcaId);
          const altaEntity: AltaEntity = isWCA ? 'Performer' : (c.altaEntity || base?.altaEntity || 'Performer');

          const whatsappGroup = c.whatsappGroup || base?.whatsappGroup || '';
          const email = c.email || base?.email || '';
          const contactChannel = c.contactChannel || base?.contactChannel || 'WhatsApp';
          const hasWhatsappGroup =
            c.hasWhatsappGroup !== undefined
              ? c.hasWhatsappGroup
              : Boolean(whatsappGroup && whatsappGroup.trim().length > 0) || contactChannel === 'WhatsApp';

          return {
            ...base,
            ...c,
            name: c.name || base?.name || '',
            email,
            whatsappGroup,
            hasWhatsappGroup,
            contactChannel,
            altaEntity,
            phone: c.phone || base?.phone,
            notes: c.notes || base?.notes,
            coverage: c.coverage || base?.coverage || '',
            location: c.location || base?.location,
            address: c.address || base?.address,
            rating: c.rating !== undefined ? c.rating : (base?.rating || 0),
            scoreOutOf10: c.scoreOutOf10 !== undefined ? c.scoreOutOf10 : (base?.scoreOutOf10 || 0),
            evaluations: (c.evaluations && c.evaluations.length > 0) ? c.evaluations : (base?.evaluations || []),
          };
        });

      const merged = mergeNewPresentations(reconciled, deletedStore);
      const finalCarriers = merged
        .filter((c) => !isCarrierDeleted(c.id, c.name, deletedStore))
        .map((c) => {
          if (c.mode === 'WCA' || Boolean(c.wcaId)) {
            return { ...c, altaEntity: 'Performer' as AltaEntity };
          }
          return c;
        });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalCarriers));
      return finalCarriers;
    }

    // PRIORITY 3
    const initialList = INITIAL_CARRIERS
      .filter((c) => !isCarrierDeleted(c.id, c.name, deletedStore))
      .map((c) => {
        if (c.mode === 'WCA' || Boolean(c.wcaId)) {
          return { ...c, altaEntity: 'Performer' as AltaEntity };
        }
        return c;
      });

    const merged = mergeNewPresentations(initialList, deletedStore);
    const finalCarriers = merged
      .filter((c) => !isCarrierDeleted(c.id, c.name, deletedStore))
      .map((c) => {
        if (c.mode === 'WCA' || Boolean(c.wcaId)) {
          return { ...c, altaEntity: 'Performer' as AltaEntity };
        }
        return c;
      });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalCarriers));
    } catch (e) {}

    return finalCarriers;
  } catch (e) {
    console.error('Error in loadAndReconcileCarriers:', e);
    return INITIAL_CARRIERS;
  }
}

export default function App() {

  const { user } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register' | 'reset'>('login');

  useEffect(() => {
    if(user) {
      setAuthView('login');
    }
  }, [user]);

  const [showRegister, setShowRegister] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Estado único de proveedores
  const [carriers, setCarriers] = useState<Carrier[]>(loadAndReconcileCarriers);

  // Descargar proveedores de Supabase al cargar
  useEffect(() => {
    const cargarProveedores = async () => {
      const { data, error } = await supabase
        .from('carriers')
        .select('data');

      if (error) {
        console.error("Error al descargar proveedores:", error);
      } else if (data && data.length > 0) {
        // Corrección del tipo "any" aquí
        const proveedoresLimpios = data.map((fila: any) => fila.data);
        setCarriers(proveedoresLimpios);
      }
    };

    cargarProveedores();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(carriers));
    } catch (e) {
      console.error('Error saving carriers:', e);
    }
  }, [carriers]);

  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveringPassword(true);
      }
    });
  }, []);

  // Si está en proceso de recuperación, muestras la vista de actualizar contraseña en lugar del login
  if (isRecoveringPassword) {
    return <UpdatePassword onSuccess={() => {
      setIsRecoveringPassword(false);
      window.location.href = '/'; // Regresar al inicio limpio
    }} />;
  }

  // UI View Mode (Grid vs Table)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter States
  const [activeMode, setActiveMode] = useState<TransportMode | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<string>('Todos');
  const [selectedRegion, setSelectedRegion] = useState<string>('Todas');
  const [hazmatOnly, setHazmatOnly] = useState<boolean>(false);

  // Modals & Active selections
  const [selectedForQuote, setSelectedForQuote] = useState<Carrier | null>(null);
  const [selectedForServiceInfo, setSelectedForServiceInfo] = useState<Carrier | null>(null);
  const [selectedForEvaluation, setSelectedForEvaluation] = useState<Carrier | null>(null);
  const [comparedCarrierIds, setComparedCarrierIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [carrierToEdit, setCarrierToEdit] = useState<Carrier | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState<boolean>(false);

  // Deletion modal & toast notification states
  const [carrierToDelete, setCarrierToDelete] = useState<Carrier | null>(null);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  const totalCounts = useMemo(() => {
    return {
      todos: carriers.filter((c) => c.active).length,
      terrestre: carriers.filter((c) => c.active && (c.mode === 'Terrestre' || c.additionalModes?.includes('Terrestre'))).length,
      aereo: carriers.filter((c) => c.active && (c.mode === 'Aereo' || c.additionalModes?.includes('Aereo'))).length,
      wca: carriers.filter((c) => c.active && (c.mode === 'WCA' || c.additionalModes?.includes('WCA'))).length,
      lcl: carriers.filter((c) => c.active && (c.mode === 'LCL' || c.additionalModes?.includes('LCL'))).length,
      fcl: carriers.filter((c) => c.active && (c.mode === 'FCL' || c.additionalModes?.includes('FCL'))).length,
    };
  }, [carriers]);

  // Reset all filters function
  const handleResetFilters = () => {
    setActiveMode('Todos');
    setSearchQuery('');
    setSelectedChannel('Todos');
    setSelectedRegion('Todas');
    setHazmatOnly(false);
  };

  // Smart Multi-Token Filter
  const filteredCarriers = useMemo(() => {
    return carriers.filter((carrier) => {
      if (!carrier.active) return false;

      // Mode Filter (supports primary mode or additional registered modes)
      if (activeMode !== 'Todos') {
        const matchesMode = carrier.mode === activeMode || (carrier.additionalModes && carrier.additionalModes.includes(activeMode));
        if (!matchesMode) return false;
      }

      // Contact Channel Filter
      if (selectedChannel !== 'Todos') {
        if (selectedChannel === 'WhatsApp' && carrier.contactChannel !== 'WhatsApp') return false;
        if (selectedChannel === 'Correo' && carrier.contactChannel !== 'Correo' && carrier.contactChannel !== 'Correo o Pagina') return false;
        if (selectedChannel === 'Pagina' && carrier.contactChannel !== 'Pagina Web' && carrier.contactChannel !== 'Correo o Pagina') return false;
      }

      // Region / Coverage Filter (Strict Residence-Aware)
      if (selectedRegion !== 'Todas') {
        const res = getCarrierResidence(carrier);
        if (selectedRegion === 'Europa') {
          if (res.continent !== 'Europa') return false;
        } else if (selectedRegion === 'Asia / China') {
          if (res.continent !== 'Asia / China') return false;
        } else if (selectedRegion === 'USA - MEX') {
          if (res.continent !== 'USA - MEX') return false;
        } else if (selectedRegion === 'México / Local') {
          if (res.continent !== 'México / Local') return false;
        } else if (selectedRegion === 'Sudamérica') {
          if (res.continent !== 'Sudamérica') return false;
        } else {
          const queryRegion = selectedRegion.toLowerCase();
          const matchesRes = res.continent.toLowerCase().includes(queryRegion);
          const matchesRegionList = carrier.regions.some((r) => r.toLowerCase().includes(queryRegion) || queryRegion.includes(r.toLowerCase()));
          if (!matchesRes && !matchesRegionList) return false;
        }
      }

      // Hazmat filter toggle
      if (hazmatOnly && !carrier.hazmat) return false;

      // Smart Residence-Aware Search Query (e.g. "europa", "china", "jtm portugal", "cargomind europa", "84031")
      if (searchQuery.trim()) {
        if (!matchesCarrierResidenceSearch(carrier, searchQuery)) return false;
      }

      return true;
    });
  }, [carriers, activeMode, selectedChannel, selectedRegion, hazmatOnly, searchQuery]);

  // Toggle comparison
  const handleToggleCompare = (carrier: Carrier) => {
    if (comparedCarrierIds.includes(carrier.id)) {
      setComparedCarrierIds(comparedCarrierIds.filter((id) => id !== carrier.id));
    } else {
      if (comparedCarrierIds.length >= 3) {
        setDeleteToast('Puedes comparar un máximo de 3 proveedores simultáneamente.');
        setTimeout(() => setDeleteToast(null), 3500);
        return;
      }
      setComparedCarrierIds([...comparedCarrierIds, carrier.id]);
    }
  };

  const comparedCarriers = useMemo(() => {
    return carriers.filter((c) => comparedCarrierIds.includes(c.id));
  }, [carriers, comparedCarrierIds]);

  // Save new / edited carrier
  const handleSaveCarrier = (updatedCarrier: Carrier) => {
    if (carrierToEdit) {
      setCarriers(carriers.map((c) => (c.id === updatedCarrier.id ? updatedCarrier : c)));
      setDeleteToast(`Datos del proveedor "${updatedCarrier.name}" actualizados correctamente.`);
      setTimeout(() => setDeleteToast(null), 3000);
    } else {
      setCarriers([updatedCarrier, ...carriers]);
      setDeleteToast(`Nuevo proveedor "${updatedCarrier.name}" agregado al catálogo.`);
      setTimeout(() => setDeleteToast(null), 3000);
    }
  };

  // Quick toggle Alta entity (Performer / Kosmos / Ambos / Ninguno)
  const handleToggleAlta = (carrierId: string, newAlta: AltaEntity) => {
    setCarriers((prev) =>
      prev.map((c) => (c.id === carrierId ? { ...c, altaEntity: newAlta } : c))
    );
  };

  // Quick toggle WhatsApp group presence
  const handleToggleWhatsappGroup = (carrierId: string, hasGroup: boolean) => {
    setCarriers((prev) =>
      prev.map((c) => (c.id === carrierId ? { ...c, hasWhatsappGroup: hasGroup } : c))
    );
  };

  // Bulk import with deduplication (updates existing matching carriers, adds new ones)
  const handleImportCarriers = (newCarriers: Carrier[], updatedCarriers: Carrier[]) => {
    setCarriers((prev) => {
      const updatedMap = new Map(updatedCarriers.map((c) => [c.id, c]));
      const currentUpdated = prev.map((c) => updatedMap.get(c.id) || c);
      const currentIds = new Set(currentUpdated.map((c) => c.id));
      const trulyNew = newCarriers.filter((c) => !currentIds.has(c.id));
      return [...trulyNew, ...currentUpdated];
    });

    const countNew = newCarriers.length;
    const countUpdated = updatedCarriers.length;
    setDeleteToast(
      `Importación exitosa: ${countNew} proveedores nuevos agregados, ${countUpdated} existentes actualizados sin duplicar.`
    );
    setTimeout(() => setDeleteToast(null), 4500);
  };

  // Save new carrier evaluation
  const handleSaveEvaluation = async (carrierId: string, newEvaluation: CarrierEvaluation) => {
    
    // 1. Encontrar el carrier actual para modificarlo
    const carrier = carriers.find(c => c.id === carrierId);
    if (!carrier) return;

    const currentEvals = carrier.evaluations || [];
    const updatedEvals = [newEvaluation, ...currentEvals];
    
    // Calcular nuevo promedio sobre 10
    const totalScore = updatedEvals.reduce((acc, curr) => acc + curr.overallScore, 0);
    const newAverage = Number((totalScore / updatedEvals.length).toFixed(1));

    const updatedCarrier = {
      ...carrier,
      evaluations: updatedEvals,
      scoreOutOf10: newAverage,
    };

    const { error } = await supabase
      .from('carriers')
      .update({ data: updatedCarrier })
      .eq('id', carrierId);

    if (error) {
      console.error("Error al guardar evaluación en Supabase:", error);
      alert("Hubo un error al guardar la evaluación en la nube.");
      return;
    }

    setCarriers((prevCarriers) =>
      prevCarriers.map((c) => (c.id === carrierId ? updatedCarrier : c))
    );

    if (selectedForEvaluation && selectedForEvaluation.id === carrierId) {
      setSelectedForEvaluation(updatedCarrier);
    }
  };

  // Prompt delete confirmation modal
  const handlePromptDelete = (carrierId: string, carrierName?: string) => {
    const target = carriers.find((c) => c.id === carrierId);
    if (target) {
      setCarrierToDelete(target);
    } else {
      setCarrierToDelete({
        id: carrierId,
        name: carrierName || 'Proveedor seleccionado',
        mode: 'Terrestre',
        coverage: '',
        regions: [],
        contactChannel: 'WhatsApp',
        originalChannel: 'WHA',
        responseTimeMinutes: 30,
        responseTimeLabel: '30 min',
        urgencyLevel: 'Media',
        hazmat: false,
        active: true,
      });
    }
  };

  // Confirmed delete ("Sí") -> permanently remove carrier from catalog and database
  const handleConfirmDelete = async () => {
    if (!carrierToDelete) return;
    const targetId = carrierToDelete.id;
    const targetName = carrierToDelete.name;

    try {
      // 1. ELIMINAR DE SUPABASE
      const { error } = await supabase
        .from('carriers')
        .delete()
        .eq('id', targetId);

      if (error) {
        console.error('Error al eliminar de Supabase:', error);
        setDeleteToast(`Error al eliminar en la nube: ${error.message}`);
        return;
      }

      // 2. Actualizar estado de React y cerrar modales
      const updated = carriers.filter((c) => c.id !== targetId);
      setCarriers(updated);
      setComparedCarrierIds((prev) => prev.filter((id) => id !== targetId));

      if (selectedForServiceInfo?.id === targetId) setSelectedForServiceInfo(null);
      if (selectedForQuote?.id === targetId) setSelectedForQuote(null);
      if (selectedForEvaluation?.id === targetId) setSelectedForEvaluation(null);
      if (carrierToEdit?.id === targetId) {
        setCarrierToEdit(null);
        setIsFormModalOpen(false);
      }

      setCarrierToDelete(null);

      // 3. Mostrar notificación
      setDeleteToast(`El proveedor "${targetName}" ha sido eliminado permanentemente de la nube.`);
      setTimeout(() => {
        setDeleteToast(null);
      }, 4500);
      
    } catch (e) {
      console.error('Error en proceso de eliminación:', e);
    }
  };

  // Cancel deletion ("No") -> return directly to "inicio"
  const handleCancelDeleteAndReturnHome = () => {
    setCarrierToDelete(null);

    // Close any other open inspection or form modal
    setSelectedForServiceInfo(null);
    setSelectedForQuote(null);
    setSelectedForEvaluation(null);
    setCarrierToEdit(null);
    setIsFormModalOpen(false);
    setIsCompareModalOpen(false);

    // Return to start: reset all filters & search query
    handleResetFilters();

    // Smooth scroll to top to return to initial catalog view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to initial dataset with custom confirmation
  const handleResetData = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmResetData = () => {
    const store = getDeletedStore();
    const safeDefaults = INITIAL_CARRIERS
      .filter((c) => !isCarrierDeleted(c.id, c.name, store))
      .map((c) => {
        if (c.mode === 'WCA' || Boolean(c.wcaId)) {
          return { ...c, altaEntity: 'Performer' as AltaEntity };
        }
        return c;
      });

    setCarriers(safeDefaults);
    setComparedCarrierIds([]);
    setActiveMode('Todos');
    setSearchQuery('');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeDefaults));
    } catch (e) {
      console.error('Error resetting carriers storage:', e);
    }
    setIsResetConfirmOpen(false);
    setDeleteToast('El catálogo de transportistas ha sido restaurado.');
    setTimeout(() => setDeleteToast(null), 3500);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Proveedor', 'Modo', 'Ubicacion', 'Unidades', 'Rutas Frecuentes', 'Cobertura', 'Canal Contacto', 'Correos', 'Tiempo Respuesta', 'Urgencia', 'HAZMAT', 'Notas'];
    const rows = filteredCarriers.map((c) => [
      `"${c.name}"`,
      `"${c.mode}"`,
      `"${(c.location || '').replace(/"/g, '""')}"`,
      `"${(c.unitTypes || []).join('; ').replace(/"/g, '""')}"`,
      `"${(c.frequentRoutes || []).join('; ').replace(/"/g, '""')}"`,
      `"${c.coverage}"`,
      `"${c.originalChannel}"`,
      `"${c.email || ''}"`,
      `"${c.responseTimeLabel}"`,
      `"${c.urgencyLevel}"`,
      `"${c.hazmat ? 'SI' : 'NO'}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `catalogo_proveedores_performer_${activeMode.toLowerCase()}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if(!user) {
    if (authView === 'register') return <Register onSwitchToLogin={() => setAuthView('login')}/>;
    if (authView === 'reset') return <ResetPassword onSwitchToLogin={() => setAuthView('login')}/>;
    return <Login onSwitchToRegister={() => setAuthView('register')} onSwitchToReset={() => setAuthView('reset')} />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased selection:bg-[#310052] selection:text-white">
      
      {/* Sticky Header Navbar */}
      <Navbar
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        totalCounts={totalCounts}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenNewCarrierModal={() => {
          setCarrierToEdit(null);
          setIsFormModalOpen(true);
        }}
        onOpenBulkImportModal={() => setIsBulkImportOpen(true)}
        onOpenCompareModal={() => setIsCompareModalOpen(true)}
        compareCount={comparedCarrierIds.length}
        onExportCSV={handleExportCSV}
        onResetData={handleResetData}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
      />

      

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Brand Hero Presentation - Only shown at the root 'Todos' view without active search to maximize workspace efficiency */}
        {activeMode === 'Todos' && !searchQuery && (
          <BrandHero
            onOpenNewCarrierModal={() => {
              setCarrierToEdit(null);
              setIsFormModalOpen(true);
            }}
            onOpenBulkImportModal={() => setIsBulkImportOpen(true)}
          />
        )}

        {/* Interactive Global & Mexico Logistics Map - Rendered in 'Todos' Filter */}
        {activeMode === 'Todos' && (
          <InteractiveLogisticsMap
            carriers={carriers}
            onSelectCarrierForQuote={(c) => setSelectedForQuote(c)}
            onViewCarrierInfo={(c) => setSelectedForServiceInfo(c)}
            onFilterByRegionOrLocation={(locationText) => {
              setSearchQuery(locationText);
            }}
            selectedFilterText={searchQuery}
          />
        )}

        {/* Unified Intelligent Search Bar with Dynamic Country & Route Filtering */}
        <UniversalSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeMode={activeMode}
          setActiveMode={setActiveMode}
          selectedChannel={selectedChannel}
          setSelectedChannel={setSelectedChannel}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          hazmatOnly={hazmatOnly}
          setHazmatOnly={setHazmatOnly}
          totalResultsCount={filteredCarriers.length}
          totalCarriersCount={carriers.length}
          onResetFilters={handleResetFilters}
          carriers={carriers}
        />

        {/* View Switcher & Filter Status Bar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 my-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-900 tracking-wide">
              {activeMode === 'Todos'
                ? 'Todos los Proveedores Logísticos'
                : activeMode === 'Aereo'
                ? 'Proveedores de Transporte Aéreo'
                : `Proveedores de Transporte ${activeMode}`}
            </span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#310052]/10 text-[#310052] rounded-full text-xs font-semibold">
                Búsqueda: <span className="italic">"{searchQuery}"</span>
              </span>
            )}

            {/* Quick reset active filter badge */}
            {(activeMode !== 'Todos' || searchQuery || selectedChannel !== 'Todos' || selectedRegion !== 'Todas' || hazmatOnly) && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer Filtros</span>
              </button>
            )}
          </div>

          {/* View Toggle (Grid vs Table) */}
          <div className="flex items-center space-x-3 self-end sm:self-auto">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Mostrando <strong>{filteredCarriers.length}</strong> de {carriers.length} proveedores
            </span>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#310052] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Vista en cuadrícula de tarjetas"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Tarjetas</span>
              </button>

              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-[#310052] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Vista en tabla de hoja de cálculo"
              >
                <Table className="w-3.5 h-3.5" />
                <span>Tabla</span>
              </button>
            </div>
          </div>

        </div>

        {/* Carrier Catalog Content (Grid or Table) */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCarriers.length === 0 ? (
              <div className="col-span-full p-12 bg-white border border-slate-200/90 rounded-2xl text-center shadow-sm">
                <p className="text-slate-600 text-sm font-medium">
                  No se encontraron proveedores que coincidan con los términos de búsqueda: <strong>"{searchQuery}"</strong>.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Intenta buscar con términos más amplios como <em>"nissan"</em>, <em>"manzanillo"</em>, <em>"caja seca"</em>, o <em>"laredo"</em>.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 bg-[#310052] hover:bg-[#431366] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
                >
                  Ver Todos los Proveedores ({carriers.length})
                </button>
              </div>
            ) : (
              filteredCarriers.map((carrier) => (
                <CarrierCard
                  key={carrier.id}
                  carrier={carrier}
                  onSelectForQuote={(c) => setSelectedForQuote(c)}
                  onViewServiceInfo={(c) => setSelectedForServiceInfo(c)}
                  onEvaluateCarrier={(c) => setSelectedForEvaluation(c)}
                  onDeleteCarrier={handlePromptDelete}
                  onEditCarrier={(c) => {
                    setCarrierToEdit(c);
                    setIsFormModalOpen(true);
                  }}
                  isCompared={comparedCarrierIds.includes(carrier.id)}
                  onToggleCompare={handleToggleCompare}
                  onToggleAlta={handleToggleAlta}
                  onToggleWhatsappGroup={handleToggleWhatsappGroup}
                />
              ))
            )}
          </div>
        ) : (
          <CarrierTable
            carriers={filteredCarriers}
            onSelectForQuote={(c) => setSelectedForQuote(c)}
            onViewServiceInfo={(c) => setSelectedForServiceInfo(c)}
            onEvaluateCarrier={(c) => setSelectedForEvaluation(c)}
            onDeleteCarrier={handlePromptDelete}
            onEditCarrier={(c) => {
              setCarrierToEdit(c);
              setIsFormModalOpen(true);
            }}
            comparedCarrierIds={comparedCarrierIds}
            onToggleCompare={handleToggleCompare}
            onToggleAlta={handleToggleAlta}
            onToggleWhatsappGroup={handleToggleWhatsappGroup}
          />
        )}

        {/* Footnote / Quick Information */}
        <footer className="mt-12 pt-8 pb-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <PerformerLogo size="md" variant="dark" showTagline={true} />
            <div className="hidden sm:block h-8 w-px bg-slate-200" />
            <div className="text-left hidden sm:block">
              <p className="text-[11px] text-slate-600 font-medium">
                Delivering performance and bright experiences across the supply chain.
              </p>
              <a
                href="https://www.performerlogistics.com.mx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#310052] hover:underline font-semibold"
              >
                www.performerlogistics.com.mx
              </a>
            </div>
          </div>
          <p className="text-slate-500 text-[11px] text-center md:text-right">
            © {new Date().getFullYear()} Performer Logistics. Todos los derechos reservados.
          </p>
        </footer>

      </main>

      {/* Service Info Modal */}
      {selectedForServiceInfo && (
        <CarrierServiceInfoModal
          carrier={selectedForServiceInfo}
          isOpen={true}
          onClose={() => setSelectedForServiceInfo(null)}
          onOpenQuoteModal={(c) => setSelectedForQuote(c)}
          onOpenEvaluationModal={(c) => setSelectedForEvaluation(c)}
          onDeleteCarrier={handlePromptDelete}
        />
      )}

      {/* Carrier Evaluation Modal (1 to 10 Scale & Comments) */}
      {selectedForEvaluation && (
        <CarrierEvaluationModal
          carrier={selectedForEvaluation}
          isOpen={true}
          onClose={() => setSelectedForEvaluation(null)}
          onSaveEvaluation={handleSaveEvaluation}
        />
      )}

      {/* Quote Modal */}
      {selectedForQuote && (
        <QuoteModal
          carrier={selectedForQuote}
          onClose={() => setSelectedForQuote(null)}
        />
      )}

      {/* Side-by-Side Compare Modal */}
      {isCompareModalOpen && (
        <CompareModal
          carriers={comparedCarriers}
          onClose={() => setIsCompareModalOpen(false)}
          onSelectForQuote={(c) => setSelectedForQuote(c)}
          onRemoveFromCompare={(id) =>
            setComparedCarrierIds(comparedCarrierIds.filter((cid) => cid !== id))
          }
        />
      )}

      {/* Carrier Form Modal (Add / Edit) */}
      {isFormModalOpen && (
        <CarrierFormModal
          carrierToEdit={carrierToEdit}
          isOpen={true}
          onClose={() => {
            setIsFormModalOpen(false);
            setCarrierToEdit(null);
          }}
          onSave={handleSaveCarrier}
          onDelete={handlePromptDelete}
        />
      )}

      {/* Carrier Bulk Import & Deduplication Modal */}
      {isBulkImportOpen && (
        <CarrierBulkImportModal
          isOpen={true}
          onClose={() => setIsBulkImportOpen(false)}
          existingCarriers={carriers}
          onImportCarriers={handleImportCarriers}
        />
      )}

      {/* Dedicated Delete Confirmation Modal (Pregunta "¿Estás segura...?", Botón "Sí" y Botón "No") */}
      {carrierToDelete && (
        <DeleteCarrierModal
          carrier={carrierToDelete}
          isOpen={true}
          onConfirmDelete={handleConfirmDelete}
          onCancelAndReturnHome={handleCancelDeleteAndReturnHome}
        />
      )}

      {/* Reset Data Confirmation Modal (Safe for iframes without window.confirm) */}
      {isResetConfirmOpen && (
        <div
          id="reset-confirm-modal"
          className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 mx-auto shadow-xs mb-3">
              <RotateCcw className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-black text-slate-900 leading-tight">
              ¿Deseas restaurar la lista original de proveedores?
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Esta acción restablecerá el catálogo con los transportistas predeterminados de Performer Logistics y deshará las eliminaciones locales.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                id="reset-modal-cancel-btn"
                onClick={() => setIsResetConfirmOpen(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold text-sm rounded-xl transition border border-slate-300 cursor-pointer"
              >
                No
              </button>
              <button
                type="button"
                id="reset-modal-confirm-btn"
                onClick={handleConfirmResetData}
                className="py-2.5 px-4 bg-[#310052] hover:bg-[#431366] text-white font-bold text-sm rounded-xl transition cursor-pointer shadow-sm"
              >
                Sí, restaurar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-app Toast Notification */}
      {deleteToast && (
        <div
          id="app-feedback-toast"
          className="fixed bottom-6 right-6 z-80 max-w-md bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-100 flex-1 leading-snug">
            {deleteToast}
          </p>
          <button
            onClick={() => setDeleteToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer text-sm"
            title="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      )}

      {isAdminPanelOpen && <AdminPanel onClose={() => setIsAdminPanelOpen(false)} />}
    </div>
  );
}