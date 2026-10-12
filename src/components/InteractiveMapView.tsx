import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { LocationData, ShelterFacility, CommunityReport } from '../types';

// Fix default Leaflet icon paths in React/Vite builds
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface InteractiveMapViewProps {
  userLocation: LocationData;
  shelters: ShelterFacility[];
  reports: CommunityReport[];
}

export const InteractiveMapView: React.FC<InteractiveMapViewProps> = ({
  userLocation,
  shelters,
  reports
}) => {
  const center: [number, number] = [userLocation.latitude, userLocation.longitude];

  // Custom marker icons
  const createCustomIcon = (bgColor: string, text: string) => {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<div style="background-color: ${bgColor}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: bold;">${text}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });
  };

  const userIcon = createCustomIcon('#2563eb', '👤');
  const shelterIcon = createCustomIcon('#10b981', '🏠');
  const hospitalIcon = createCustomIcon('#e11d48', '🏥');
  const hazardIcon = createCustomIcon('#d97706', '⚠️');

  return (
    <section className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-xl">
      <div className="p-3 bg-neutral-950 border-b border-neutral-800 flex flex-wrap items-center justify-between text-xs text-neutral-300 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-neutral-100">Map View — Location, Facilities & Hazard Reports</span>
          <span className="text-[11px] bg-blue-950 text-blue-300 border border-blue-900 px-2 py-0.5 rounded font-medium">
            OpenStreetMap Tiles
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span> You
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span> Shelter
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span> Medical
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span> Road Hazard
          </span>
        </div>
      </div>

      <div className="h-[360px] sm:h-[420px] w-full relative z-0 bg-neutral-950">
        <MapContainer
          key={`${userLocation.latitude}-${userLocation.longitude}`}
          center={center}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Location Marker & Proximity Zone */}
          <Marker position={center} icon={userIcon}>
            <Popup>
              <div className="text-xs">
                <strong>Your Location:</strong>
                <p>{userLocation.name}</p>
                <p className="text-slate-500 text-[10px]">Lat: {userLocation.latitude.toFixed(4)}, Lon: {userLocation.longitude.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
          <Circle 
            center={center} 
            radius={1500} 
            pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1 }} 
          />

          {/* Shelters & Hospitals */}
          {shelters.map(shelter => (
            <Marker
              key={shelter.id}
              position={[shelter.latitude, shelter.longitude]}
              icon={shelter.category === 'hospital' ? hospitalIcon : shelterIcon}
            >
              <Popup>
                <div className="text-xs max-w-[200px] space-y-1">
                  <h4 className="font-bold text-slate-900">{shelter.name}</h4>
                  <p className="text-slate-600 text-[11px]">{shelter.address}</p>
                  <p className="text-emerald-700 font-semibold text-[11px]">
                    {shelter.status === 'unknown' ? 'Availability: UNKNOWN' : `Status: ${shelter.status.toUpperCase()}`}
                  </p>
                  {shelter.contactPhone ? (
                    <a
                      href={`tel:${shelter.contactPhone}`}
                      className="inline-block mt-1 text-[11px] text-blue-600 font-bold hover:underline"
                    >
                      📞 Listed phone (unverified): {shelter.contactPhone}
                    </a>
                  ) : (
                    <p className="text-amber-700 text-[11px] font-semibold">No phone listed in map data</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Community Hazard Reports */}
          {reports.map(report => (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={hazardIcon}
            >
              <Popup>
                <div className="text-xs max-w-[200px] space-y-1">
                  <h4 className="font-bold text-amber-900">⚠️ Hazard: {report.locationName}</h4>
                  <p className="text-slate-700 text-[11px]">{report.description}</p>
                  <span className="inline-block text-[10px] uppercase font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                    Status: {report.status}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="p-2.5 bg-neutral-950 text-[11px] text-neutral-400 border-t border-neutral-800">
        📌 <em>Map interactions:</em> Drag or zoom to explore. The blue marker is your selected location. Nearby facility markers are OpenStreetMap listings, not confirmation of emergency-shelter status or current availability. Hazard markers represent locally stored community reports. Use official local guidance during emergencies.
      </div>
    </section>
  );
};
