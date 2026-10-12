import { LocationData, HouseholdChecklist, EmergencyContact, CommunityReport } from '../types';

const STORAGE_KEYS = {
  LOCATION: 'floodready_location_v1',
  CHECKLIST: 'floodready_checklist_v1',
  CONTACTS: 'floodready_contacts_v1',
  REPORTS: 'floodready_reports_v1',
  ALERTS_CONFIG: 'floodready_alerts_config_v1',
  OFFLINE_CACHE_TIME: 'floodready_cache_timestamp_v1'
};

const DEFAULT_LOCATION: LocationData = {
  latitude: 26.1820,
  longitude: 91.7580,
  name: 'Guwahati (Brahmaputra Basin)',
  district: 'Kamrup Metropolitan',
  state: 'Assam',
  country: 'India',
  sourceType: 'default',
  timestamp: new Date().toISOString()
};

export const INITIAL_CHECKLIST: HouseholdChecklist = {
  members: [
    { id: 'm1', name: 'Primary User', ageGroup: 'Adult (32)', specialNeeds: 'None', safe: true },
    { id: 'm2', name: 'Grandmother', ageGroup: 'Senior (71)', specialNeeds: 'Limited mobility / needs walker', safe: true }
  ],
  medications: [
    { id: 'med1', name: 'Blood Pressure (Amlodipine 5mg)', dosage: '1 tablet daily', packed: true },
    { id: 'med2', name: 'Insulin Glargine + Needles', dosage: 'Cold pack required', packed: false },
    { id: 'med3', name: 'ORS & Water Purification Drops', dosage: '2 packs in ziplock', packed: true }
  ],
  documents: [
    { id: 'doc1', title: 'Aadhaar / National ID Cards (in waterproof ziplock)', packed: true },
    { id: 'doc2', title: 'Property Deeds & Home Insurance Policies', packed: false },
    { id: 'doc3', title: 'Hospital prescription cards & vaccination records', packed: true }
  ],
  petSupplies: [
    { id: 'pet1', item: 'Pet leash, sturdy harness, & identification tag', packed: true },
    { id: 'pet2', item: 'Dry kibble (3-day ration) & folding silicone bowl', packed: false }
  ],
  goBagItems: [
    { id: 'gb1', item: 'High-power LED flashlight with extra alkaline batteries', packed: true },
    { id: 'gb2', item: 'Fully charged 20,000mAh Power Bank + cables', packed: true },
    { id: 'gb3', item: 'High-decibel emergency whistle (for rescue signaling)', packed: true },
    { id: 'gb4', item: 'First aid kit (sterile gauze, antiseptic ointment, bandage)', packed: true },
    { id: 'gb5', item: 'Emergency cash in low denomination banknotes', packed: false },
    { id: 'gb6', item: 'Spare clothes and thermal emergency space blanket', packed: false }
  ]
};

export const INITIAL_CONTACTS: EmergencyContact[] = [
  { id: 'c1', name: 'Local Emergency Contact (Sibling)', relation: 'Sibling', phone: '+91 98765 43210', notifyOnSOS: true },
  { id: 'c2', name: 'Out-of-State Relative', relation: 'Uncle', phone: '+91 91234 56789', notifyOnSOS: true }
];

export const INITIAL_REPORTS: CommunityReport[] = [
  {
    id: 'rep-1',
    type: 'flooded_road',
    description: 'Underpass flooded with approx 3.5 ft stagnant water. 1 vehicle stalled. Road blocked.',
    locationName: 'Railway Underpass Sector 4',
    latitude: 26.175,
    longitude: 91.750,
    reportedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    status: 'unverified',
    urgency: 'high'
  },
  {
    id: 'rep-2',
    type: 'power_hazard',
    description: 'Snapped overhead electrical cable hanging near water canal. Avoid junction.',
    locationName: 'East Canal Ring Road Corner',
    latitude: 26.185,
    longitude: 91.765,
    reportedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    status: 'confirmed',
    urgency: 'high'
  }
];

export class StorageService {
  getLocation(): LocationData {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOCATION);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Storage read failed', e);
    }
    return DEFAULT_LOCATION;
  }

  saveLocation(loc: LocationData) {
    try {
      localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(loc));
      localStorage.setItem(STORAGE_KEYS.OFFLINE_CACHE_TIME, new Date().toISOString());
    } catch (e) {
      console.warn('Storage write failed', e);
    }
  }

  clearSavedLocation() {
    try {
      localStorage.removeItem(STORAGE_KEYS.LOCATION);
    } catch (e) {
      console.warn('Clear location failed', e);
    }
  }

  getChecklist(): HouseholdChecklist {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHECKLIST);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Storage read checklist failed', e);
    }
    return INITIAL_CHECKLIST;
  }

  saveChecklist(checklist: HouseholdChecklist) {
    try {
      localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(checklist));
    } catch (e) {
      console.warn('Storage save checklist failed', e);
    }
  }

  getContacts(): EmergencyContact[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Storage read contacts failed', e);
    }
    return INITIAL_CONTACTS;
  }

  saveContacts(contacts: EmergencyContact[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
    } catch (e) {
      console.warn('Storage save contacts failed', e);
    }
  }

  getCommunityReports(): CommunityReport[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Storage read reports failed', e);
    }
    return INITIAL_REPORTS;
  }

  saveCommunityReports(reports: CommunityReport[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    } catch (e) {
      console.warn('Storage save reports failed', e);
    }
  }

  getLastCacheTime(): string | null {
    return localStorage.getItem(STORAGE_KEYS.OFFLINE_CACHE_TIME);
  }
}

export const storageService = new StorageService();
