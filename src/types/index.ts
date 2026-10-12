export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type UserRole = 'public' | 'admin';

export interface UserSession {
  role: UserRole;
  username: string;
  name: string;
  badge?: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  name: string;
  district?: string;
  state?: string;
  country: string;
  sourceType: 'gps' | 'manual' | 'default';
  timestamp: string;
}

export interface RiskFactor {
  parameter: string;
  value: string;
  status: 'normal' | 'watch' | 'warning' | 'severe';
  impactDescription: string;
}

export interface FloodAlert {
  id: string;
  title: string;
  severity: RiskLevel;
  headline: string;
  instruction: string;
  source: string;
  sourceType: 'official' | 'estimated' | 'demo';
  issuedAt: string;
  updatedAt: string;
  expiresAt?: string;
  geographicCoverage: string;
  confidence: 'High' | 'Medium' | 'Low' | 'Simulated';
  limitations: string;
  isStale?: boolean;
}

export interface WaterLevelReading {
  stationName: string;
  riverName: string;
  currentLevelMeters: number;
  warningLevelMeters: number;
  dangerLevelMeters: number;
  trend: 'rising' | 'falling' | 'steady';
  lastUpdated: string;
  source: string;
  isSimulated?: boolean;
}

export interface ShelterFacility {
  id: string;
  name: string;
  category: 'shelter' | 'hospital' | 'relief_camp' | 'sandbags' | 'water_distribution' | 'pharmacy';
  address: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  contactPhone: string;
  capacity?: {
    total: number;
    available: number;
  };
  status: 'open' | 'limited' | 'full' | 'standby' | 'unknown';
  isVerified: boolean;
  verifiedBy: string;
  lastVerificationTime: string;
  accessibilityFeatures: string[]; // e.g., 'Wheelchair accessible', 'Medical staff on site', 'Pet friendly'
  servicesProvided: string[];
  notes?: string;
}

export interface SafetyGuideSection {
  id: string;
  title: string;
  stage: 'before' | 'during' | 'after' | 'evacuation' | 'health_sanitation';
  source: string;
  reviewedDate: string;
  priorityActions: string[];
  detailedInstructions: string[];
  offlineAvailable: boolean;
}

export interface CommunityReport {
  id: string;
  type: 'flooded_road' | 'waterlogging' | 'person_trapped' | 'power_hazard' | 'relief_needed';
  description: string;
  locationName: string;
  latitude: number;
  longitude: number;
  reportedAt: string;
  status: 'unverified' | 'under_review' | 'confirmed';
  contactPhone?: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  notifyOnSOS: boolean;
}

export interface HouseholdChecklist {
  members: Array<{ id: string; name: string; ageGroup: string; specialNeeds?: string; safe: boolean }>;
  medications: Array<{ id: string; name: string; dosage: string; packed: boolean }>;
  documents: Array<{ id: string; title: string; packed: boolean }>;
  petSupplies: Array<{ id: string; item: string; packed: boolean }>;
  goBagItems: Array<{ id: string; item: string; packed: boolean }>;
}
