import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, AlertTriangle, LifeBuoy, BookOpen, 
  CheckSquare, MessageSquare, Compass, Radio, LogOut, User, Lock
} from 'lucide-react';
import { LocationData, HouseholdChecklist, EmergencyContact, CommunityReport, UserSession, ShelterFacility } from './types';
import { 
  fetchStrictRealtimeFloodData, 
  RealtimeFeedResponse 
} from './services/strictRealtimeService';
import { getNearbyFacilitiesForLocation } from './services/shelterService';
import { emergencyAudio } from './services/audioService';
import { storageService } from './services/storageService';

import { RiskAlertBanner } from './components/RiskAlertBanner';
import { LocationSearchCompass } from './components/LocationSearchCompass';
import { SheltersView } from './components/SheltersView';
import { SafetyGuidanceView } from './components/SafetyGuidanceView';
import { ChecklistView } from './components/ChecklistView';
import { HazardReportingView } from './components/HazardReportingView';
import { SosModal } from './components/SosModal';
import { AuthModal } from './components/AuthModal';
import { InteractiveMapView } from './components/InteractiveMapView';

type NavigationTab = 'overview' | 'shelters' | 'safety' | 'checklist' | 'community';

export const App: React.FC = () => {
  // Authentication session state
  const [session, setSession] = useState<UserSession | null>(null);

  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [location, setLocation] = useState<LocationData>(storageService.getLocation());
  const [feedResponse, setFeedResponse] = useState<RealtimeFeedResponse | null>(null);
  const [shelters, setShelters] = useState<ShelterFacility[]>([]);
  const [shelterDataMessage, setShelterDataMessage] = useState('Demo mode: preparing illustrative points around the selected location…');
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const requestSequence = useRef(0);
  const [isSosOpen, setIsSosOpen] = useState(false);
  // Keep the map hidden until the user explicitly selects a searched location or GPS position.
  const [isMapVisible, setIsMapVisible] = useState(false);

  const [checklist, setChecklist] = useState<HouseholdChecklist>(storageService.getChecklist());
  const [emergencyContacts] = useState<EmergencyContact[]>(storageService.getContacts());
  const [reports, setReports] = useState<CommunityReport[]>(storageService.getCommunityReports());

  // Fetch weather and nearby mapped facilities whenever the selected location changes.
  const updateDataForLocation = async (loc: LocationData) => {
    const requestId = ++requestSequence.current;
    setLoading(true);
    setFeedError(null);
    setFeedResponse(null);
    setShelters([]);
    setShelterDataMessage('Demo mode: preparing illustrative points around the selected location…');

    const [weatherResult, facilitiesResult] = await Promise.allSettled([
      fetchStrictRealtimeFloodData(loc),
      getNearbyFacilitiesForLocation(loc.latitude, loc.longitude),
    ]);

    // Ignore stale results if the user selected another location while requests were running.
    if (requestId !== requestSequence.current) return;

    if (weatherResult.status === 'fulfilled') {
      setFeedResponse(weatherResult.value);
    } else {
      console.error('Failed to load weather data', weatherResult.reason);
      setFeedError(weatherResult.reason instanceof Error ? weatherResult.reason.message : 'Weather data is currently unavailable. Please try again.');
    }

    if (facilitiesResult.status === 'fulfilled') {
      setShelters(facilitiesResult.value.facilities);
      setShelterDataMessage(facilitiesResult.value.message);
    } else {
      console.error('Failed to load nearby mapped facilities', facilitiesResult.reason);
      setShelters([]);
      setShelterDataMessage('Demo mode is active. Illustrative local records are used instead of live map data; they are not real facilities.');
    }

    setLoading(false);
  };

  useEffect(() => {
    updateDataForLocation(location);
  }, [location]);

  const handleRequestGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLoc: LocationData = {
          latitude: +pos.coords.latitude.toFixed(4),
          longitude: +pos.coords.longitude.toFixed(4),
          name: `Current GPS (${pos.coords.latitude.toFixed(2)}°N, ${pos.coords.longitude.toFixed(2)}°E)`,
          country: 'Local Coordinates',
          sourceType: 'gps',
          timestamp: new Date().toISOString()
        };
        setLocation(newLoc);
        setIsMapVisible(true);
        storageService.saveLocation(newLoc);
      },
      (err) => {
        console.warn('Geolocation denied or timed out:', err);
        alert('Location access was declined or timed out. You can use the search bar to find any city or district worldwide.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSelectLocation = (newLoc: LocationData) => {
    setLocation(newLoc);
    setIsMapVisible(true);
    storageService.saveLocation(newLoc);
  };

  const handleAddCommunityReport = (report: CommunityReport) => {
    const updated = [report, ...reports];
    setReports(updated);
    storageService.saveCommunityReports(updated);
  };

  // If user is not authenticated, show role-selection login gate
  if (!session) {
    return <AuthModal onLogin={setSession} />;
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white pb-20 md:pb-6">
      
      {/* Top Header - Dark Grey & Black with User Role Indicator and Single SOS */}
      <header className="sticky top-0 z-30 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-blue-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white">FloodReady</span>
                <span className={`text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                  session.role === 'admin' 
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                }`}>
                  {session.role === 'admin' ? '🛡️ Admin Console' : '👤 Citizen Public'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-medium">
                {session.role === 'admin' ? 'Full Command & Shelter Management' : 'Read-Only Safety & SOS Protection'}
              </p>
            </div>
          </div>

          {/* Role Status & Strictly Single Emergency SOS Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSession(null)}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800 transition-colors"
              title="Logout / Switch Account"
            >
              <LogOut className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsSosOpen(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs shadow-lg flex items-center gap-2 sos-pulse transition-all"
              aria-label="Open Emergency SOS"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>EMERGENCY / SOS</span>
            </button>
          </div>
        </div>

        {/* Desktop / Tablet Navigation Bar */}
        <div className="hidden md:block bg-neutral-900/80 border-t border-neutral-800">
          <div className="max-w-6xl mx-auto px-4 flex space-x-1">
            {[
              { id: 'overview', label: 'Real-Time Risk & 360° Compass', icon: Compass },
              { id: 'shelters', label: `Nearby Shelters (${shelters.length})`, icon: LifeBuoy },
              { id: 'safety', label: 'Safety Protocols', icon: BookOpen },
              { id: 'checklist', label: 'Go-Bag & Family Check', icon: CheckSquare },
              { id: 'community', label: 'Hazard Reports', icon: MessageSquare },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as NavigationTab)}
                  className={`flex items-center gap-1.5 py-2.5 px-3.5 text-xs font-bold transition-colors border-b-2 ${
                    isActive
                      ? 'border-blue-500 text-blue-400 bg-neutral-850'
                      : 'border-transparent text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 space-y-4">
        
        {/* Tab 1: Real-Time Risk & 360° Compass Directions */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            
            {/* Global Search and 8 Cardinal Directions Radar Matrix */}
            <LocationSearchCompass
              currentLocation={location}
              cardinalZones={feedResponse?.cardinalZones || []}
              onSelectLocation={handleSelectLocation}
              onRequestGps={handleRequestGps}
              isLoading={loading}
            />

            {/* Show the map only after the user selects a search result or requests GPS. */}
            {isMapVisible && (
              <InteractiveMapView
                key={`${location.latitude}-${location.longitude}`}
                userLocation={location}
                shelters={shelters}
                reports={reports}
              />
            )}

            {/* Explicitly show feed failures rather than leaving old values or showing zeros. */}
            {feedError && (
              <div role="alert" className="rounded-2xl border border-amber-700/60 bg-amber-950/30 p-4 text-sm text-amber-200">
                <strong>Weather data unavailable.</strong> {feedError} Values are not being replaced with zeroes. Check your internet connection and refresh.
              </div>
            )}

            {/* Strict Real-Time Alert Banner and Weather Sensor Metrics */}
            {feedResponse && (
              <RiskAlertBanner
                feed={feedResponse}
                location={location}
                onRefresh={() => updateDataForLocation(location)}
                loading={loading}
                onTestSound={() => emergencyAudio.playAttentionChime()}
              />
            )}

            {/* Quick Action Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => setActiveTab('shelters')}
                className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-2xl text-left transition-all"
              >
                <div className="text-blue-400 mb-1">🏠</div>
                <div className="text-xs font-bold text-neutral-100">Find Shelters</div>
                <div className="text-[11px] text-neutral-400">
                  {shelters.length} facilities near {location.name.split(',')[0]}
                </div>
              </button>

              <button
                onClick={() => setActiveTab('safety')}
                className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-2xl text-left transition-all"
              >
                <div className="text-blue-400 mb-1">📖</div>
                <div className="text-xs font-bold text-neutral-100">Flood Rules</div>
                <div className="text-[11px] text-neutral-400">NDMA life safety rules</div>
              </button>

              <button
                onClick={() => setActiveTab('checklist')}
                className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-2xl text-left transition-all"
              >
                <div className="text-blue-400 mb-1">🎒</div>
                <div className="text-xs font-bold text-neutral-100">Go-Bag Packing</div>
                <div className="text-[11px] text-neutral-400">Meds & water checklist</div>
              </button>

              <button
                onClick={() => setActiveTab('community')}
                className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-2xl text-left transition-all"
              >
                <div className="text-blue-400 mb-1">⚠️</div>
                <div className="text-xs font-bold text-neutral-100">Report Hazard</div>
                <div className="text-[11px] text-neutral-400">Citizen road alert</div>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Verified Shelters (Simultaneously Updated to Current Searched Location) */}
        {activeTab === 'shelters' && (
          <SheltersView 
            shelters={shelters} 
            userLocation={location}
            userSession={session}
            onUpdateShelters={setShelters}
            dataMessage={shelterDataMessage}
            onRetryNearbyFacilities={() => updateDataForLocation(location)}
          />
        )}

        {/* Tab 3: Safety Guidance */}
        {activeTab === 'safety' && (
          <SafetyGuidanceView />
        )}

        {/* Tab 4: Checklists */}
        {activeTab === 'checklist' && (
          <ChecklistView checklist={checklist} onUpdateChecklist={setChecklist} />
        )}

        {/* Tab 5: Community Hazard Reports */}
        {activeTab === 'community' && (
          <HazardReportingView
            reports={reports}
            currentLocation={location}
            onAddReport={handleAddCommunityReport}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Dark Grey Theme) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 z-40 px-2 py-1.5 shadow-2xl">
        <div className="flex justify-around items-center">
          {[
            { id: 'overview', label: 'Radar', icon: Compass },
            { id: 'shelters', label: 'Shelters', icon: LifeBuoy },
            { id: 'safety', label: 'Guides', icon: BookOpen },
            { id: 'checklist', label: 'Go-Bag', icon: CheckSquare },
            { id: 'community', label: 'Reports', icon: MessageSquare },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as NavigationTab)}
                className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
                  isActive ? 'text-blue-400 font-bold' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[10px] mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Single Strictly Unified Emergency SOS Hub Modal */}
      <SosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        location={location}
        emergencyContacts={emergencyContacts}
      />

    </div>
  );
};

export default App;
