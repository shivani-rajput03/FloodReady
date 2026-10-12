import React, { useState } from 'react';
import { 
  Building2, Phone, MapPin, CheckCircle2, AlertTriangle, 
  ExternalLink, Filter, Shield, HeartPulse, Droplets, Waves, 
  Plus, Edit2, Trash2, Check, X
} from 'lucide-react';
import { ShelterFacility, LocationData, UserSession } from '../types';

interface SheltersViewProps {
  shelters: ShelterFacility[];
  userLocation: LocationData;
  userSession: UserSession;
  onUpdateShelters: (shelters: ShelterFacility[]) => void;
  dataMessage?: string;
  onRetryNearbyFacilities?: () => void;
}

export const SheltersView: React.FC<SheltersViewProps> = ({ 
  shelters, 
  userLocation,
  userSession,
  onUpdateShelters,
  dataMessage = 'Facility details are sample information and have not been verified.',
  onRetryNearbyFacilities,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [onlyAccessible, setOnlyAccessible] = useState<boolean>(false);

  // Admin states
  const [isAddingShelter, setIsAddingShelter] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New shelter form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ShelterFacility['category']>('shelter');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCapacityTotal, setFormCapacityTotal] = useState(300);
  const [formCapacityAvail, setFormCapacityAvail] = useState(150);
  const [formStatus, setFormStatus] = useState<ShelterFacility['status']>('open');

  const isAdmin = userSession.role === 'admin';

  // Compute haversine distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(1);
  };

  const filteredShelters = shelters
    .map(s => ({
      ...s,
      distanceKm: calculateDistance(userLocation.latitude, userLocation.longitude, s.latitude, s.longitude)
    }))
    .filter(s => {
      if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
      if (onlyVerified && !s.isVerified) return false;
      if (onlyAccessible && !s.accessibilityFeatures.some(f => f.toLowerCase().includes('wheelchair') || f.toLowerCase().includes('ramp') || f.toLowerCase().includes('ada') || f.toLowerCase().includes('step-free'))) return false;
      return true;
    })
    .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hospital':
        return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case 'sandbags':
        return <Waves className="w-4 h-4 text-amber-400" />;
      case 'relief_camp':
      case 'water_distribution':
        return <Droplets className="w-4 h-4 text-blue-400" />;
      default:
        return <Building2 className="w-4 h-4 text-emerald-400" />;
    }
  };

  // Admin action: Delete facility
  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this facility record as Admin?')) return;
    const updated = shelters.filter(s => s.id !== id);
    onUpdateShelters(updated);
  };

  // Admin action: Update capacity or status
  const handleToggleStatus = (id: string, currentStatus: ShelterFacility['status']) => {
    const nextStatus: ShelterFacility['status'] = currentStatus === 'open' ? 'full' : currentStatus === 'full' ? 'limited' : 'open';
    const updated = shelters.map(s => s.id === id ? { ...s, status: nextStatus, lastVerificationTime: new Date().toISOString() } : s);
    onUpdateShelters(updated);
  };

  // Admin action: Add new facility
  const handleSaveNewFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAddress.trim()) return;

    const newFacility: ShelterFacility = {
      id: `admin-facility-${Date.now()}`,
      name: formName.trim(),
      category: formCategory,
      address: formAddress.trim(),
      latitude: +(userLocation.latitude + (Math.random() * 0.02 - 0.01)).toFixed(4),
      longitude: +(userLocation.longitude + (Math.random() * 0.02 - 0.01)).toFixed(4),
      contactPhone: formPhone.trim(),
      capacity: {
        total: Number(formCapacityTotal) || 200,
        available: Number(formCapacityAvail) || 100
      },
      status: formStatus,
      isVerified: true,
      verifiedBy: `Admin Verified (${userSession.name})`,
      lastVerificationTime: new Date().toISOString(),
      accessibilityFeatures: ['Wheelchair accessible', 'Emergency Power Backup'],
      servicesProvided: ['Clean drinking water', 'Cooked meals', 'First-aid'],
      notes: 'Added via Admin Management Console.'
    };

    onUpdateShelters([newFacility, ...shelters]);
    setIsAddingShelter(false);
    setFormName('');
    setFormAddress('');
  };

  return (
    <div className="space-y-4">
      {/* Search, Filter, and Admin Header Controls */}
      <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-400" />
            <h2 className="text-sm font-bold text-neutral-100">
              Nearby Facility Directory · {userLocation.name.split(',')[0]}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-mono font-medium">
              {filteredShelters.length} facilities
            </span>
            {isAdmin && (
              <button
                onClick={() => setIsAddingShelter(!isAddingShelter)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Facility</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Services' },
            { id: 'shelter', label: 'Flood Shelters' },
            { id: 'hospital', label: 'Hospitals / Trauma' },
            { id: 'relief_camp', label: 'Relief Camps' },
            { id: 'sandbags', label: 'Sandbags & Pumps' },
            { id: 'pharmacy', label: 'Pharmacies' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accessibility & Verification Toggles */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-neutral-800">
          <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
            <input 
              type="checkbox" 
              checked={onlyVerified} 
              onChange={e => setOnlyVerified(e.target.checked)}
              className="rounded bg-neutral-950 border-neutral-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="font-medium">Only verified records</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
            <input 
              type="checkbox" 
              checked={onlyAccessible} 
              onChange={e => setOnlyAccessible(e.target.checked)}
              className="rounded bg-neutral-950 border-neutral-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="font-medium">Wheelchair / Step-Free Accessible</span>
          </label>
          {isAdmin && (
            <span className="text-[11px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded-md">
              ⚡ Admin Mode Active: You can add, edit capacity, or remove facilities
            </span>
          )}
        </div>
      </div>

      {/* Admin Add Facility Form Drawer */}
      {isAdmin && isAddingShelter && (
        <form onSubmit={handleSaveNewFacility} className="bg-neutral-900 border border-blue-600/40 p-4 rounded-2xl shadow-xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Register New Relief Facility in {userLocation.name.split(',')[0]}
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingShelter(false)}
              className="text-neutral-500 hover:text-neutral-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Facility Name</label>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="e.g. City High School Emergency Camp"
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-700 bg-neutral-950 text-neutral-200 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Facility Category</label>
              <select
                value={formCategory}
                onChange={e => setFormCategory(e.target.value as ShelterFacility['category'])}
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-700 bg-neutral-950 text-neutral-200"
              >
                <option value="shelter">Flood Shelter</option>
                <option value="hospital">Hospital / Trauma Center</option>
                <option value="relief_camp">Relief Camp</option>
                <option value="sandbags">Sandbags & Pumps</option>
                <option value="pharmacy">Pharmacy</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">Street Address</label>
            <input
              type="text"
              value={formAddress}
              onChange={e => setFormAddress(e.target.value)}
              placeholder="e.g. Ring Road Sector 4, Opposite Stadium"
              className="w-full text-xs p-2.5 rounded-xl border border-neutral-700 bg-neutral-950 text-neutral-200 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Phone</label>
              <input
                type="text"
                value={formPhone}
                onChange={e => setFormPhone(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-neutral-700 bg-neutral-950 text-neutral-200"
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Total Capacity</label>
              <input
                type="number"
                value={formCapacityTotal}
                onChange={e => setFormCapacityTotal(Number(e.target.value))}
                className="w-full text-xs p-2 rounded-xl border border-neutral-700 bg-neutral-950 text-neutral-200"
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Available Beds</label>
              <input
                type="number"
                value={formCapacityAvail}
                onChange={e => setFormCapacityAvail(Number(e.target.value))}
                className="w-full text-xs p-2 rounded-xl border border-neutral-700 bg-neutral-950 text-neutral-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingShelter(false)}
              className="px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
            >
              Save Facility
            </button>
          </div>
        </form>
      )}

      {/* Safety Notice on Routing & Flood Waters */}
      <div className="p-3.5 bg-amber-950/40 rounded-xl border border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-300">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong>Facility information notice:</strong> {dataMessage} Selected location: <strong>{userLocation.name}</strong>. Names, coordinates, distances, services, accessibility and availability may be inaccurate. Confirm details with local authorities before relying on a facility during an emergency.
        </div>
      </div>

      {/* Facility Cards */}
      {filteredShelters.length === 0 && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center">
          <MapPin className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-neutral-100">No facilities match this filter</h3>
          <p className="text-xs text-neutral-400 mt-1">{dataMessage} Try another category or increase the search radius.</p>
          {onRetryNearbyFacilities && (
            <button
              type="button"
              onClick={onRetryNearbyFacilities}
              className="mt-3 inline-flex items-center rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-100 hover:bg-neutral-700"
            >
              Refresh facility list
            </button>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredShelters.map(facility => (
          <div 
            key={facility.id}
            className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 shadow-xl hover:border-neutral-700 transition-all flex flex-col justify-between relative group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="p-2.5 rounded-xl bg-neutral-800 shrink-0">
                    {getCategoryIcon(facility.category)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-100 leading-snug">{facility.name}</h3>
                    <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0 text-neutral-500" />
                      <span>{facility.address}</span>
                    </p>
                  </div>
                </div>

                {facility.distanceKm !== undefined && (
                  <span className="text-xs font-mono font-black px-2 py-0.5 bg-neutral-800 text-blue-400 rounded-lg shrink-0 border border-neutral-700">
                    {facility.distanceKm} km
                  </span>
                )}
              </div>

              {/* Status and Capacity */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] uppercase ${
                  facility.status === 'open' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {facility.status === 'unknown' ? 'Availability: unknown' : `Status: ${facility.status}`}
                </span>

                {facility.capacity && (
                  <span className="text-[11px] text-neutral-300 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 font-mono">
                    Capacity: <strong>{facility.capacity.available}</strong> / {facility.capacity.total} available
                  </span>
                )}

                {/* Admin Status Switcher Button */}
                {isAdmin && (
                  <button
                    onClick={() => handleToggleStatus(facility.id, facility.status)}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold underline ml-1"
                  >
                    Change Status
                  </button>
                )}
              </div>

              {/* Provided Services */}
              <div className="mt-3">
                <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Services & Relief:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {facility.servicesProvided.map((service, idx) => (
                    <span key={idx} className="text-[11px] bg-neutral-950 text-neutral-300 px-2 py-0.5 rounded border border-neutral-800">
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Accessibility tags */}
              {facility.accessibilityFeatures.length > 0 && (
                <div className="mt-2 text-[11px] text-neutral-400">
                  <strong className="text-neutral-300">Accessibility: </strong>
                  {facility.accessibilityFeatures.join(', ')}
                </div>
              )}

              {/* Verification Metadata */}
              <div className="mt-3 pt-2 border-t border-neutral-800 text-[10px] text-neutral-500 flex flex-wrap items-center justify-between gap-1">
                <span>Source: {facility.isVerified ? `Verified by ${facility.verifiedBy}` : facility.verifiedBy}</span>
                <span>Sample record date: {new Date(facility.lastVerificationTime).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Action Bar: Direct Phone & Google/Apple Maps Links + Admin Controls */}
            <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center gap-2">
              <a
                href={facility.contactPhone ? `tel:${facility.contactPhone}` : undefined}
                className="flex-1 py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-neutral-700 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>{facility.contactPhone ? (facility.isVerified ? `Call ${facility.contactPhone}` : `Listed phone: ${facility.contactPhone}`) : 'No listed phone'}</span>
              </a>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-2.5 bg-neutral-950 hover:bg-neutral-800 text-blue-400 rounded-xl text-xs font-bold flex items-center gap-1 border border-neutral-800 transition-colors"
                title="Open Directions in Google Maps"
              >
                <span>Google</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={`https://maps.apple.com/?daddr=${facility.latitude},${facility.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-2.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-bold flex items-center gap-1 border border-neutral-800 transition-colors"
                title="Open Directions in Apple Maps"
              >
                <span>Apple</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {isAdmin && (
                <button
                  onClick={() => handleDelete(facility.id)}
                  className="p-2 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-400 rounded-xl transition-colors"
                  title="Admin Delete Facility"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
