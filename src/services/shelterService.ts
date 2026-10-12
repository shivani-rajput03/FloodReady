import { ShelterFacility } from '../types';

export interface NearbyFacilitiesResult {
  facilities: ShelterFacility[];
  message: string;
}

const EARTH_RADIUS_KM = 6371.0088;

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const radians = (value: number) => (value * Math.PI) / 180;
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pointAtDistance(lat: number, lon: number, distanceKmValue: number, bearingDegrees: number) {
  const radians = (value: number) => (value * Math.PI) / 180;
  const degrees = (value: number) => (value * 180) / Math.PI;
  const angularDistance = distanceKmValue / EARTH_RADIUS_KM;
  const bearing = radians(bearingDegrees);
  const latitude = radians(lat);
  const longitude = radians(lon);
  const destinationLatitude = Math.asin(
    Math.sin(latitude) * Math.cos(angularDistance) +
    Math.cos(latitude) * Math.sin(angularDistance) * Math.cos(bearing),
  );
  const destinationLongitude = longitude + Math.atan2(
    Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latitude),
    Math.cos(angularDistance) - Math.sin(latitude) * Math.sin(destinationLatitude),
  );
  return { latitude: degrees(destinationLatitude), longitude: degrees(destinationLongitude) };
}

/**
 * Local demo directory. Deliberately does not call public map APIs, so a classroom
 * demo still works when Overpass servers time out or block browser requests.
 * Every item is explicitly fictional and must never be treated as a real service.
 */
export async function getNearbyFacilitiesForLocation(
  lat: number,
  lon: number,
  radiusMeters = 5000,
): Promise<NearbyFacilitiesResult> {
  const now = new Date().toISOString();
  const demoCity = 'selected location';
  const samples: Array<{
    suffix: string;
    category: ShelterFacility['category'];
    distanceKm: number;
    bearing: number;
    services: string[];
  }> = [
    { suffix: 'Shelter Point', category: 'shelter', distanceKm: 0.8, bearing: 0, services: ['Evacuation information'] },
    { suffix: 'Medical Point', category: 'hospital', distanceKm: 1.2, bearing: 65, services: ['Medical information'] },
    { suffix: 'Relief Camp Point', category: 'relief_camp', distanceKm: 1.7, bearing: 145, services: ['Relief-camp information'] },
    { suffix: 'Sandbag & Pump Point', category: 'sandbags', distanceKm: 2.1, bearing: 225, services: ['Flood-equipment information'] },
    { suffix: 'Pharmacy Point', category: 'pharmacy', distanceKm: 2.5, bearing: 300, services: ['Pharmacy information'] },
  ];

  const facilities: ShelterFacility[] = samples
    .filter((sample) => sample.distanceKm <= radiusMeters / 1000)
    .map((sample, index) => {
      const point = pointAtDistance(lat, lon, sample.distanceKm, sample.bearing);
      return {
        id: `demo-local-${index + 1}-${lat.toFixed(3)}-${lon.toFixed(3)}`,
        name: sample.suffix,
        category: sample.category,
        address: `Illustrative point near ${demoCity}; not a real address`,
        latitude: point.latitude,
        longitude: point.longitude,
        distanceKm: +distanceKm(lat, lon, point.latitude, point.longitude).toFixed(1),
        contactPhone: '',
        status: 'unknown',
        isVerified: false,
        verifiedBy: 'Local demo fixture — fictional, not independently verified',
        lastVerificationTime: now,
        accessibilityFeatures: [],
        servicesProvided: sample.services,
        notes: 'Fictional demonstration record generated relative to the selected map location. It does not identify a real facility and must not be used for emergency navigation.',
      };
    });

  return {
    facilities,
    message: `DEMO MODE: Showing ${facilities.length} fictional sample points around the selected location so the interface can be demonstrated without public map servers. Names, coordinates, distances, services and availability are illustrative only—not real facilities. Do not use for emergencies.`,
  };
}
