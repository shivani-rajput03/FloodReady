import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Compass, Navigation, ArrowUp, ArrowUpRight, 
  ArrowRight, ArrowDownRight, ArrowDown, ArrowDownLeft, ArrowLeft, ArrowUpLeft,
  Droplets, ExternalLink, RefreshCw, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { LocationData, RiskLevel } from '../types';
import { CardinalPointData, searchLocationsRealtime } from '../services/strictRealtimeService';

interface LocationSearchCompassProps {
  currentLocation: LocationData;
  cardinalZones: CardinalPointData[];
  onSelectLocation: (loc: LocationData) => void;
  onRequestGps: () => void;
  isLoading: boolean;
}

export const LocationSearchCompass: React.FC<LocationSearchCompassProps> = ({
  currentLocation,
  cardinalZones,
  onSelectLocation,
  onRequestGps,
  isLoading
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDirection, setSelectedDirection] = useState<CardinalPointData | null>(null);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLocationsRealtime(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getDirectionIcon = (dir: CardinalPointData['direction']) => {
    switch (dir) {
      case 'N': return <ArrowUp className="w-4 h-4" />;
      case 'NE': return <ArrowUpRight className="w-4 h-4" />;
      case 'E': return <ArrowRight className="w-4 h-4" />;
      case 'SE': return <ArrowDownRight className="w-4 h-4" />;
      case 'S': return <ArrowDown className="w-4 h-4" />;
      case 'SW': return <ArrowDownLeft className="w-4 h-4" />;
      case 'W': return <ArrowLeft className="w-4 h-4" />;
      case 'NW': return <ArrowUpLeft className="w-4 h-4" />;
    }
  };

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'HIGH':
      case 'CRITICAL':
        return 'text-red-400 border-red-500/50 bg-red-950/40 hover:bg-red-900/50';
      case 'MODERATE':
        return 'text-amber-400 border-amber-500/50 bg-amber-950/40 hover:bg-amber-900/50';
      default:
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-900/40';
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${currentLocation.name} ${currentLocation.latitude},${currentLocation.longitude}`)}`;
  const appleMapsUrl = `https://maps.apple.com/?ll=${currentLocation.latitude},${currentLocation.longitude}&q=${encodeURIComponent(currentLocation.name)}`;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
      
      {/* Search Input Box */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-blue-400" />
            Live Global Location Search
          </span>
          <button
            onClick={onRequestGps}
            className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            <Navigation className="w-3 h-3" />
            <span>Use My GPS</span>
          </button>
        </label>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any town, district or city (e.g. Mumbai, Guwahati, Patna, Tokyo)..."
            className="w-full bg-neutral-950 text-neutral-100 placeholder-neutral-500 text-sm px-4 py-3 pl-10 rounded-xl border border-neutral-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
          {isSearching && (
            <RefreshCw className="w-4 h-4 text-blue-400 animate-spin absolute right-3.5 top-3.5" />
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="bg-neutral-950 border border-neutral-700 rounded-xl overflow-hidden shadow-2xl divide-y divide-neutral-800 z-20">
            {searchResults.map((res, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectLocation(res);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="w-full text-left p-3 hover:bg-neutral-800 flex items-center justify-between text-xs text-neutral-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="font-semibold">{res.name}</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {res.latitude.toFixed(2)}°, {res.longitude.toFixed(2)}°
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current Location Display & Navigation Bridges */}
      <div className="p-3.5 bg-neutral-950/80 rounded-xl border border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-neutral-800 text-blue-400">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-neutral-100">{currentLocation.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono">
                {currentLocation.sourceType === 'gps' ? 'Live GPS' : 'Manual Target'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono">
              Lat: {currentLocation.latitude.toFixed(4)}° | Lon: {currentLocation.longitude.toFixed(4)}°
            </p>
          </div>
        </div>

        {/* Direct Google Maps & Apple Maps Bridges */}
        <div className="flex items-center gap-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1.5 border border-neutral-700 transition-colors"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </a>
          <a
            href={appleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1.5 border border-neutral-700 transition-colors"
          >
            <span>Apple Maps</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </a>
        </div>
      </div>

      {/* 8 Directional Weather Samples */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
          <span className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            360° Directional Weather Samples (approx. 15 km)
          </span>
          <span className="text-[11px] text-neutral-500">Weather API samples · estimated risk</span>
        </div>
        <p className="text-[11px] text-neutral-400">
          Weather API readings at eight approximate points around the selected location. Locality names are best-effort geocoding results; risk is an estimate, not an official warning:
        </p>

        {/* 8 Cardinal Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {cardinalZones.map((zone) => {
            const isSelected = selectedDirection?.direction === zone.direction;
            return (
              <button
                key={zone.direction}
                onClick={() => setSelectedDirection(zone)}
                className={`p-2.5 rounded-xl border text-left transition-all ${zone.dataStatus === 'live' ? getRiskColor(zone.risk) : 'text-neutral-400 border-neutral-700 bg-neutral-900/60'} ${
                  isSelected ? 'ring-2 ring-blue-400' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs flex items-center gap-1">
                    {getDirectionIcon(zone.direction)}
                    {zone.direction} ({zone.locality || zone.directionName})
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {zone.dataStatus === 'live' ? zone.risk : 'N/A'}
                  </span>
                </div>
                <div className="mt-1 text-[11px] font-mono flex items-center justify-between text-neutral-300">
                  <span>{zone.dataStatus === 'live' ? `Rain: ${zone.rainCurrent} mm` : 'Weather unavailable'}</span>
                  <span>{zone.dataStatus === 'live' ? `next 24h: ${zone.rainNext24h} mm` : '—'}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Cardinal Sector Detail Drawer if selected */}
        {selectedDirection && (
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-200">
                {selectedDirection.locality} · {selectedDirection.direction} sector
              </span>
              <button
                onClick={() => setSelectedDirection(null)}
                className="text-[10px] text-neutral-500 hover:text-neutral-300"
              >
                Close ✕
              </button>
            </div>
            <p className="text-neutral-400 text-[11px]">
              Coordinates: {selectedDirection.latitude}, {selectedDirection.longitude} (approx. 15 km from selected location)
            </p>
            <div className="flex flex-wrap gap-3 text-[11px] text-neutral-300 pt-1">
              <span>Weather API precipitation: <strong>{selectedDirection.dataStatus === 'live' ? `${selectedDirection.rainCurrent} mm` : 'Unavailable'}</strong></span>
              <span>Today’s forecast total: <strong>{selectedDirection.dataStatus === 'live' ? `${selectedDirection.rainToday} mm` : 'Unavailable'}</strong></span>
              <span>Next 24h forecast total: <strong>{selectedDirection.dataStatus === 'live' ? `${selectedDirection.rainNext24h} mm` : 'Unavailable'}</strong></span>
              <span>Peak hourly forecast (next 24h): <strong>{selectedDirection.dataStatus === 'live' ? `${selectedDirection.peakHourlyNext24h} mm` : 'Unavailable'}</strong></span>
              <span>Threat Level: <strong className={selectedDirection.dataStatus !== 'live' ? 'text-neutral-400' : selectedDirection.risk === 'HIGH' || selectedDirection.risk === 'CRITICAL' ? 'text-red-400' : selectedDirection.risk === 'MODERATE' ? 'text-amber-400' : 'text-emerald-400'}>{selectedDirection.dataStatus === 'live' ? selectedDirection.risk : 'Unavailable'}</strong></span>
            </div>
            <div className="pt-2 flex gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedDirection.latitude},${selectedDirection.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Open Sector in Google Maps Directions →
              </a>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
