import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Shield, MapPin, Volume2, Bell, 
  Trash2, Database, Info, CheckCircle, ExternalLink, Moon
} from 'lucide-react';
import { floodDataService } from '../services/floodDataService';
import { emergencyAudio } from '../services/audioService';
import { storageService } from '../services/storageService';
import { LocationData, EmergencyContact } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationData;
  onUpdateLocation: (loc: LocationData) => void;
  mode: 'live' | 'demo';
  onToggleMode: (mode: 'live' | 'demo') => void;
  emergencyContacts: EmergencyContact[];
  onUpdateContacts: (contacts: EmergencyContact[]) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  location,
  onUpdateLocation,
  mode,
  onToggleMode,
  emergencyContacts,
  onUpdateContacts
}) => {
  const [quietHours, setQuietHours] = useState(false);
  const [dataCleared, setDataCleared] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [manualCity, setManualCity] = useState(location.name);

  if (!isOpen) return null;

  const handleClearData = () => {
    storageService.clearSavedLocation();
    setDataCleared(true);
    setTimeout(() => setDataCleared(false), 3000);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;

    const updated = [
      ...emergencyContacts,
      {
        id: `c-${Date.now()}`,
        name: contactName.trim(),
        relation: 'Contact',
        phone: contactPhone.trim(),
        notifyOnSOS: true
      }
    ];
    onUpdateContacts(updated);
    storageService.saveContacts(updated);
    setContactName('');
    setContactPhone('');
  };

  const handleDeleteContact = (id: string) => {
    const updated = emergencyContacts.filter(c => c.id !== id);
    onUpdateContacts(updated);
    storageService.saveContacts(updated);
  };

  const handleSaveManualLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCity.trim()) return;
    
    // Quick preset coordinate resolver
    let lat = 26.1820;
    let lon = 91.7580;
    const lower = manualCity.toLowerCase();
    if (lower.includes('patna')) { lat = 25.5941; lon = 85.1376; }
    else if (lower.includes('mumbai')) { lat = 19.0760; lon = 72.8777; }
    else if (lower.includes('chennai')) { lat = 13.0827; lon = 80.2707; }
    else if (lower.includes('delhi')) { lat = 28.6139; lon = 77.2090; }
    else if (lower.includes('kerala') || lower.includes('kochi')) { lat = 9.9312; lon = 76.2673; }

    const newLoc: LocationData = {
      latitude: lat,
      longitude: lon,
      name: manualCity.trim(),
      country: 'India',
      sourceType: 'manual',
      timestamp: new Date().toISOString()
    };
    onUpdateLocation(newLoc);
    storageService.saveLocation(newLoc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
      <div 
        role="dialog" 
        aria-modal="true" 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col"
      >
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <SettingsIcon className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold">FloodReady Preferences & Settings</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-slate-300 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-xs">
          {/* Provider / Data Feed Switcher */}
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-600" />
              Hydrology & Weather Data Feed Provider
            </h3>
            <p className="text-slate-500 mb-2">
              Switch between Live API feeds and Verified Simulation/Demo payloads.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onToggleMode('demo')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  mode === 'demo'
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-900">Demo / Simulation</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Official NDMA/CWC simulation template with severe alert triggers.
                </div>
              </button>

              <button
                onClick={() => onToggleMode('live')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  mode === 'live'
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-900">Open-Meteo Live API</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Live real-time precipitation & runoff forecasts based on GPS coordinates.
                </div>
              </button>
            </div>
          </div>

          {/* Manual Location Override */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Location Settings (Privacy-Preserved)
            </h3>
            <p className="text-slate-500 mb-2">
              If GPS is turned off or declined, set your region manually.
            </p>
            <form onSubmit={handleSaveManualLocation} className="flex gap-2">
              <input
                type="text"
                value={manualCity}
                onChange={e => setManualCity(e.target.value)}
                placeholder="e.g. Guwahati, Patna, Mumbai, Chennai, Kochi..."
                className="flex-1 p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </form>
          </div>

          {/* Emergency Alert Audio Controls */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-amber-600" />
              Siren & Alert Sound Controls
            </h3>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-slate-500" />
                <div>
                  <div className="font-semibold text-slate-800">Quiet Hours Mode</div>
                  <div className="text-[11px] text-slate-500">Mutes non-critical automated test sounds</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={quietHours}
                onChange={e => setQuietHours(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>

            <button
              onClick={() => emergencyAudio.playAttentionChime()}
              className="text-blue-600 hover:text-blue-800 font-semibold text-xs flex items-center gap-1"
            >
              🔊 Test Warning Attention Chime
            </button>
          </div>

          {/* Emergency Contacts for Check-In */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-800 text-sm mb-1">
              Personal Emergency SMS Contacts
            </h3>
            <div className="space-y-1.5">
              {emergencyContacts.map(c => (
                <div key={c.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-800">{c.name}</span>
                    <span className="text-slate-500 ml-2">{c.phone}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteContact(c.id)}
                    className="p-1 text-slate-400 hover:text-red-600"
                    aria-label={`Remove ${c.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddContact} className="grid grid-cols-5 gap-2 pt-1">
              <input
                type="text"
                placeholder="Name"
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                className="col-span-2 p-2 border border-slate-200 rounded-lg text-xs"
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                className="col-span-2 p-2 border border-slate-200 rounded-lg text-xs"
              />
              <button
                type="submit"
                className="col-span-1 bg-slate-900 text-white font-bold rounded-lg text-xs hover:bg-slate-800"
              >
                Add
              </button>
            </form>
          </div>

          {/* Privacy & Clear Data */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm mb-1">
              Privacy & On-Device Storage
            </h3>
            <p className="text-slate-500 mb-2">
              Your location and emergency checklists stay exclusively on this browser. You can clear saved cached entries at any time.
            </p>
            <button
              onClick={handleClearData}
              className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Saved Local Cache & Location</span>
            </button>
            {dataCleared && (
              <p className="text-emerald-600 font-semibold mt-1">✓ Local cache successfully purged.</p>
            )}
          </div>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
