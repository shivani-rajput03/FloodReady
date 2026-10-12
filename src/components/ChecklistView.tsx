import React, { useState } from 'react';
import { 
  Plus, ShieldCheck, CheckSquare
} from 'lucide-react';
import { HouseholdChecklist } from '../types';
import { storageService } from '../services/storageService';

interface ChecklistViewProps {
  checklist: HouseholdChecklist;
  onUpdateChecklist: (updated: HouseholdChecklist) => void;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  checklist,
  onUpdateChecklist
}) => {
  const [activeSection, setActiveSection] = useState<'members' | 'medications' | 'documents' | 'gobag' | 'pets'>('gobag');
  const [newMedName, setNewMedName] = useState('');
  const [newGoBagItem, setNewGoBagItem] = useState('');
  const [savedNotification, setSavedNotification] = useState(false);

  const toggleGoBagItem = (id: string) => {
    const updated = {
      ...checklist,
      goBagItems: checklist.goBagItems.map(item =>
        item.id === id ? { ...item, packed: !item.packed } : item
      )
    };
    onUpdateChecklist(updated);
    storageService.saveChecklist(updated);
  };

  const toggleMedication = (id: string) => {
    const updated = {
      ...checklist,
      medications: checklist.medications.map(item =>
        item.id === id ? { ...item, packed: !item.packed } : item
      )
    };
    onUpdateChecklist(updated);
    storageService.saveChecklist(updated);
  };

  const toggleDocument = (id: string) => {
    const updated = {
      ...checklist,
      documents: checklist.documents.map(item =>
        item.id === id ? { ...item, packed: !item.packed } : item
      )
    };
    onUpdateChecklist(updated);
    storageService.saveChecklist(updated);
  };

  const togglePetItem = (id: string) => {
    const updated = {
      ...checklist,
      petSupplies: checklist.petSupplies.map(item =>
        item.id === id ? { ...item, packed: !item.packed } : item
      )
    };
    onUpdateChecklist(updated);
    storageService.saveChecklist(updated);
  };

  const addGoBagItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoBagItem.trim()) return;
    const newItem = {
      id: `gb-${Date.now()}`,
      item: newGoBagItem.trim(),
      packed: false
    };
    const updated = {
      ...checklist,
      goBagItems: [...checklist.goBagItems, newItem]
    };
    onUpdateChecklist(updated);
    storageService.saveChecklist(updated);
    setNewGoBagItem('');
    showSaveToast();
  };

  const addMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;
    const newItem = {
      id: `med-${Date.now()}`,
      name: newMedName.trim(),
      dosage: 'Standard prescription',
      packed: false
    };
    const updated = {
      ...checklist,
      medications: [...checklist.medications, newItem]
    };
    onUpdateChecklist(updated);
    storageService.saveChecklist(updated);
    setNewMedName('');
    showSaveToast();
  };

  const showSaveToast = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  const totalItems = checklist.goBagItems.length + checklist.medications.length + checklist.documents.length;
  const packedItems = 
    checklist.goBagItems.filter(i => i.packed).length +
    checklist.medications.filter(i => i.packed).length +
    checklist.documents.filter(i => i.packed).length;
  const progressPercent = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Progress Card */}
      <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-bold text-neutral-100">Evacuation Readiness Index</h2>
            <p className="text-xs text-neutral-400">Go-Bag, life-saving medicines & identity records</p>
          </div>
          <span className="text-xl font-black font-mono text-blue-400">{progressPercent}%</span>
        </div>
        <div className="w-full bg-neutral-950 rounded-full h-2.5 overflow-hidden border border-neutral-800">
          <div 
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-2 text-[11px] text-neutral-400 font-mono flex items-center justify-between">
          <span>{packedItems} of {totalItems} items secured</span>
          {savedNotification && <span className="text-emerald-400 font-bold">Saved offline ✓</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'gobag', label: '🎒 72h Go-Bag' },
          { id: 'medications', label: '💊 Prescriptions' },
          { id: 'documents', label: '📄 Vital Documents' },
          { id: 'members', label: '👥 Household' },
          { id: 'pets', label: '🐾 Pets' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as typeof activeSection)}
            className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
              activeSection === tab.id
                ? 'bg-neutral-100 text-neutral-950 font-bold shadow-lg'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Go-Bag Essentials */}
      {activeSection === 'gobag' && (
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-100">72-Hour Evacuation Go-Bag</h3>
            <span className="text-xs text-neutral-400 font-mono">Check off as packed</span>
          </div>

          <div className="space-y-2">
            {checklist.goBagItems.map(item => (
              <label 
                key={item.id} 
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  item.packed ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-neutral-950 border-neutral-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.packed}
                  onChange={() => toggleGoBagItem(item.id)}
                  className="rounded bg-neutral-900 border-neutral-700 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className={`text-xs ${item.packed ? 'line-through text-neutral-500' : 'text-neutral-200 font-medium'}`}>
                  {item.item}
                </span>
              </label>
            ))}
          </div>

          <form onSubmit={addGoBagItem} className="flex gap-2 pt-2 border-t border-neutral-800">
            <input
              type="text"
              placeholder="Add custom go-bag item..."
              value={newGoBagItem}
              onChange={e => setNewGoBagItem(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-neutral-950 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Medications */}
      {activeSection === 'medications' && (
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 space-y-3 shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-neutral-100">Life-Preserving Medications</h3>
            <p className="text-xs text-neutral-400">Keep at least 7 days' supply sealed in waterproof casing.</p>
          </div>

          <div className="space-y-2">
            {checklist.medications.map(item => (
              <label 
                key={item.id} 
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                  item.packed ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-neutral-950 border-neutral-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.packed}
                    onChange={() => toggleMedication(item.id)}
                    className="rounded bg-neutral-900 border-neutral-700 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <div>
                    <div className={`text-xs font-semibold ${item.packed ? 'line-through text-neutral-500' : 'text-neutral-200'}`}>
                      {item.name}
                    </div>
                    <div className="text-[11px] text-neutral-400">{item.dosage}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${item.packed ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
                  {item.packed ? 'Secured' : 'Needs Pack'}
                </span>
              </label>
            ))}
          </div>

          <form onSubmit={addMedication} className="flex gap-2 pt-2 border-t border-neutral-800">
            <input
              type="text"
              placeholder="Add prescription medicine..."
              value={newMedName}
              onChange={e => setNewMedName(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-neutral-950 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Documents */}
      {activeSection === 'documents' && (
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 space-y-3 shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-neutral-100">Vital Legal & Identity Documents</h3>
            <p className="text-xs text-neutral-400">Store in certified waterproof pouches and cloud backups.</p>
          </div>

          <div className="space-y-2">
            {checklist.documents.map(item => (
              <label 
                key={item.id} 
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  item.packed ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-neutral-950 border-neutral-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.packed}
                  onChange={() => toggleDocument(item.id)}
                  className="rounded bg-neutral-900 border-neutral-700 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className={`text-xs ${item.packed ? 'line-through text-neutral-500' : 'text-neutral-200 font-medium'}`}>
                  {item.title}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Members */}
      {activeSection === 'members' && (
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 space-y-3 shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-neutral-100">Household Safety Roster</h3>
            <p className="text-xs text-neutral-400">Ensure senior citizens, infants, and medical needs are monitored.</p>
          </div>

          <div className="space-y-2">
            {checklist.members.map(member => (
              <div 
                key={member.id} 
                className="p-3 rounded-xl border border-neutral-800 bg-neutral-950 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-neutral-100">{member.name}</div>
                  <div className="text-[11px] text-neutral-400">Age: {member.ageGroup}</div>
                  {member.specialNeeds && member.specialNeeds !== 'None' && (
                    <div className="text-[11px] text-amber-400 font-medium mt-0.5">
                      ⚠️ Requirement: {member.specialNeeds}
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase">
                  Accounted
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Pets */}
      {activeSection === 'pets' && (
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 space-y-3 shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-neutral-100">Pet & Animal Evacuation</h3>
            <p className="text-xs text-neutral-400">Never leave companion pets tethered or locked during water rises.</p>
          </div>

          <div className="space-y-2">
            {checklist.petSupplies.map(item => (
              <label 
                key={item.id} 
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  item.packed ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-neutral-950 border-neutral-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.packed}
                  onChange={() => togglePetItem(item.id)}
                  className="rounded bg-neutral-900 border-neutral-700 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className={`text-xs ${item.packed ? 'line-through text-neutral-500' : 'text-neutral-200 font-medium'}`}>
                  {item.item}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
