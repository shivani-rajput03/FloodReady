import { FloodAlert, WaterLevelReading, RiskLevel, RiskFactor, LocationData } from '../types';

export interface CardinalPointData {
  direction: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
  directionName: string;
  locality: string;
  dataStatus: 'live' | 'unavailable';
  latitude: number;
  longitude: number;
  rainCurrent: number;
  rainToday: number;
  rainNext24h: number;
  peakHourlyNext24h: number;
  risk: RiskLevel;
  distanceKm: number;
}

export interface RealtimeFeedResponse {
  riskLevel: RiskLevel;
  riskSummary: string;
  sourceAttribution: string;
  sourceType: 'estimated';
  lastUpdated: string;
  factors: RiskFactor[];
  alerts: FloodAlert[];
  riverReadings: WaterLevelReading[];
  recommendations: string[];
  limitations: string;
  livePrecipitation: {
    currentMm: number;
    dailySumMm: number;
    next24hSumMm: number;
    maxHourlyMm: number;
    humidity: number;
    tempC: number;
  };
  cardinalZones: CardinalPointData[];
}

// Bearings for eight compass sectors. Coordinates are calculated on a sphere so
// each sample is approximately 15 km from the selected location, including diagonals.
const CARDINAL_OFFSETS: Array<{ dir: CardinalPointData['direction']; name: string; bearing: number }> = [
  { dir: 'N', name: 'North Sector', bearing: 0 },
  { dir: 'NE', name: 'North-East Sector', bearing: 45 },
  { dir: 'E', name: 'East Sector', bearing: 90 },
  { dir: 'SE', name: 'South-East Sector', bearing: 135 },
  { dir: 'S', name: 'South Sector', bearing: 180 },
  { dir: 'SW', name: 'South-West Sector', bearing: 225 },
  { dir: 'W', name: 'West Sector', bearing: 270 },
  { dir: 'NW', name: 'North-West Sector', bearing: 315 },
];

function roundMm(value: number): number {
  return Math.round(value * 10) / 10;
}

function getNext24HourPrecipitation(
  times: unknown,
  precipitation: unknown,
  currentTime: unknown
): { values: number[]; totalMm: number; maxHourlyMm: number } | null {
  if (!Array.isArray(times) || !Array.isArray(precipitation) || typeof currentTime !== 'string') return null;

  // Open-Meteo timestamps are in the location's requested timezone. Start with
  // the first forecast timestamp strictly after its current-time timestamp so
  // we don't count the current hour as a future forecast hour.
  let startIndex = times.findIndex((time) => typeof time === 'string' && time > currentTime);
  if (startIndex < 0) startIndex = times.findIndex((time) => typeof time === 'string' && time >= currentTime);
  if (startIndex < 0) return null;

  const values = precipitation.slice(startIndex, startIndex + 24);
  if (values.length !== 24 || values.some((value) => typeof value !== 'number' || !Number.isFinite(value) || value < 0)) {
    return null;
  }

  return {
    values,
    totalMm: roundMm(values.reduce((sum, value) => sum + value, 0)),
    maxHourlyMm: roundMm(Math.max(...values))
  };
}

function pointAtDistance(latitude: number, longitude: number, bearingDegrees: number, distanceKm = 15) {
  const earthRadiusKm = 6371.0088;
  const angularDistance = distanceKm / earthRadiusKm;
  const bearing = bearingDegrees * Math.PI / 180;
  const lat1 = latitude * Math.PI / 180;
  const lon1 = longitude * Math.PI / 180;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
    Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing)
  );
  const lon2 = lon1 + Math.atan2(
    Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
    Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
  );
  return {
    latitude: +(lat2 * 180 / Math.PI).toFixed(4),
    longitude: ((((lon2 * 180 / Math.PI) + 540) % 360) - 180)
  };
}

export async function searchLocationsRealtime(query: string): Promise<LocationData[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) return [];

    return data.results.map((r: { name: string; admin1?: string; country?: string; latitude: number; longitude: number }) => ({
      latitude: r.latitude,
      longitude: r.longitude,
      name: `${r.name}${r.admin1 ? `, ${r.admin1}` : ''}${r.country ? `, ${r.country}` : ''}`,
      district: r.admin1 || '',
      state: r.admin1 || '',
      country: r.country || '',
      sourceType: 'manual' as const,
      timestamp: new Date().toISOString()
    }));
  } catch (err) {
    console.warn('Geocoding search error:', err);
    return [];
  }
}

export async function fetchStrictRealtimeFloodData(location: LocationData): Promise<RealtimeFeedResponse> {
  // Fetch current/forecast meteorological data from Open-Meteo. These are weather-model/API values, not physical flood-sensor readings.
  const centerUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code&hourly=precipitation,rain&daily=precipitation_sum,precipitation_hours&timezone=auto`;
  
  const res = await fetch(centerUrl);
  if (!res.ok) {
    throw new Error(`Real-time Telemetry Service returned HTTP ${res.status}`);
  }
  const data = await res.json();

  // Do not silently turn missing API values into zero: zero rainfall is a real observation,
  // while missing data must be treated as a failed/incomplete feed.
  const currentRain = data.current?.precipitation;
  const currentTemp = data.current?.temperature_2m;
  const currentHum = data.current?.relative_humidity_2m;
  const dailyRain = data.daily?.precipitation_sum?.[0];
  if ([currentRain, currentTemp, currentHum, dailyRain].some((v) => typeof v !== 'number' || !Number.isFinite(v))) {
    throw new Error('Open-Meteo returned incomplete current or daily weather data. Please refresh and try again.');
  }

  // Calculate the maximum over the next 24 forecast hours, not the first 24 entries
  // (which may mostly be hours that have already passed today).
  const currentApiTime = typeof data.current?.time === 'string' ? data.current.time : '';
  const next24Forecast = getNext24HourPrecipitation(data.hourly?.time, data.hourly?.precipitation, currentApiTime);
  if (!next24Forecast) {
    throw new Error('Open-Meteo did not return 24 complete future hourly precipitation values. Please refresh and try again.');
  }
  const next24HourTotal = next24Forecast.totalMm;
  const maxHourlyRain = next24Forecast.maxHourlyMm;

  // Simple demonstration thresholds applied to weather data. This is an estimate, not an official flood warning.
  let riskLevel: RiskLevel = 'LOW';
  if (currentRain > 12 || dailyRain > 90 || maxHourlyRain > 20) {
    riskLevel = 'HIGH';
  } else if (currentRain > 4 || dailyRain > 35 || maxHourlyRain > 8) {
    riskLevel = 'MODERATE';
  }

  // Sample weather at eight points around the selected location. If a request fails, show unavailable instead of inventing/randomizing values.
  const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    try {
      const r = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}&lang=en`);
      if (!r.ok) return '';
      const j = await r.json();
      const f = j.features?.[0]?.properties;
      if (!f) return '';
      return [f.name, f.locality, f.district, f.city, f.county].filter((v, i, a) => v && a.indexOf(v) === i).slice(0, 2).join(', ');
    } catch { return ''; }
  };

  // Fetch cardinal directions in parallel
  const cardinalPromises = CARDINAL_OFFSETS.map(async (offset) => {
    const samplePoint = pointAtDistance(location.latitude, location.longitude, offset.bearing);
    const lat = samplePoint.latitude;
    const lon = +samplePoint.longitude.toFixed(4);
    const [locality, weatherResult] = await Promise.all([
      reverseGeocode(lat, lon),
      (async () => {
        try {
          const cardUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=precipitation&hourly=precipitation&daily=precipitation_sum&timezone=auto`;
          const cardRes = await fetch(cardUrl);
          if (!cardRes.ok) return null;
          const cData = await cardRes.json();
          const cardCurrent = cData.current?.precipitation;
          const cardToday = cData.daily?.precipitation_sum?.[0];
          if (typeof cardCurrent !== 'number' || !Number.isFinite(cardCurrent) || cardCurrent < 0 ||
              typeof cardToday !== 'number' || !Number.isFinite(cardToday) || cardToday < 0) return null;
          const cardNext24 = getNext24HourPrecipitation(cData.hourly?.time, cData.hourly?.precipitation, cData.current?.time);
          if (!cardNext24) return null;
          return {
            current: roundMm(cardCurrent),
            today: roundMm(cardToday),
            next24h: cardNext24.totalMm,
            peakHourlyNext24h: cardNext24.maxHourlyMm
          };
        } catch { return null; }
      })()
    ]);
    const cCurrent = weatherResult?.current ?? 0;
    const cToday = weatherResult?.today ?? 0;
    const cNext24h = weatherResult?.next24h ?? 0;
    const cPeakHourly = weatherResult?.peakHourlyNext24h ?? 0;
    let cRisk: RiskLevel = 'LOW';
    if (weatherResult && (cCurrent > 12 || cToday > 90 || cPeakHourly > 20)) cRisk = 'HIGH';
    else if (weatherResult && (cCurrent > 4 || cToday > 35 || cPeakHourly > 8)) cRisk = 'MODERATE';
    return {
      direction: offset.dir,
      directionName: offset.name,
      locality: locality || `Near ${lat.toFixed(3)}, ${lon.toFixed(3)}`,
      dataStatus: weatherResult ? 'live' : 'unavailable',
      latitude: lat,
      longitude: lon,
      rainCurrent: cCurrent,
      rainToday: cToday,
      rainNext24h: cNext24h,
      peakHourlyNext24h: cPeakHourly,
      risk: cRisk,
      distanceKm: 15
    } as CardinalPointData;
  });

  const cardinalZones = await Promise.all(cardinalPromises);
  const currentTime = new Date().toISOString();

  const alerts: FloodAlert[] = [];
  if (riskLevel === 'HIGH' || riskLevel === 'MODERATE') {
    alerts.push({
      id: `live-alert-${Date.now()}`,
      title: riskLevel === 'HIGH' ? 'Severe Flood & Inundation Warning' : 'Active Precipitation & Waterlogging Advisory',
      severity: riskLevel,
      headline: `Open-Meteo reports ${dailyRain} mm of precipitation for the local forecast day around ${location.name}. This is a weather-based estimate, not an official flood warning.`,
      instruction: 'Stay clear of low-lying roadways, culverts, and underpasses. Evacuate basement floors immediately.',
      source: 'Open-Meteo weather API; threshold-based estimate, not an official warning',
      sourceType: 'estimated',
      issuedAt: currentTime,
      updatedAt: currentTime,
      geographicCoverage: `${location.name} (+ 15km Cardinal Radius)`,
      confidence: 'Medium',
      limitations: 'Weather-model/API data with simple app-defined thresholds; not a verified flood bulletin or physical gauge reading.',
      isStale: false
    });
  }

  const factors: RiskFactor[] = [
    {
      parameter: 'Current Precipitation',
      value: `${roundMm(currentRain)} mm`,
      status: currentRain > 10 ? 'severe' : currentRain > 3 ? 'warning' : 'normal',
      impactDescription: currentRain > 8 ? 'High current precipitation reported by the weather API.' : 'Current precipitation reported by the weather API; local flooding can still occur.'
    },
    {
      parameter: "Today's Forecast Precipitation",
      value: `${roundMm(dailyRain)} mm`,
      status: dailyRain > 75 ? 'severe' : dailyRain > 30 ? 'warning' : 'normal',
      impactDescription: dailyRain > 50 ? 'Daily precipitation is above this app’s high threshold; check official local alerts.' : 'Daily precipitation is below this app’s configured threshold; local flooding can still occur.'
    },
    {
      parameter: 'Forecast Precipitation Total (Next 24h)',
      value: `${next24HourTotal} mm`,
      status: next24HourTotal > 90 ? 'severe' : next24HourTotal > 35 ? 'warning' : 'normal',
      impactDescription: 'Sum of the next 24 complete hourly precipitation forecast values; distinct from the local calendar-day total.'
    },
    {
      parameter: 'Peak Forecast Precipitation (Next 24h)',
      value: `${maxHourlyRain} mm/h`,
      status: maxHourlyRain > 18 ? 'severe' : maxHourlyRain > 7 ? 'warning' : 'normal',
      impactDescription: 'Maximum hourly precipitation forecast over the next 24 hours at the selected coordinate; not a measured river inflow.'
    },
    {
      parameter: 'Atmospheric Relative Humidity',
      value: `${currentHum}% (${currentTemp}°C)`,
      status: currentHum > 90 ? 'warning' : 'normal',
      impactDescription: 'Humidity and temperature are contextual weather values; they do not independently confirm flood risk.'
    }
  ];

  const riverReadings: WaterLevelReading[] = [
    {
      stationName: `${location.name.split(',')[0]} Drainage Inflow Gauge`,
      riverName: 'Local Basin Runoff Sector',
      currentLevelMeters: +(11.5 + (dailyRain * 0.04)).toFixed(2),
      warningLevelMeters: 14.50,
      dangerLevelMeters: 16.00,
      trend: currentRain > 0 ? 'rising' : 'steady',
      lastUpdated: currentTime,
      source: 'Simulated illustrative value (not a live river gauge)',
      isSimulated: true
    }
  ];

  return {
    riskLevel,
    riskSummary: riskLevel === 'HIGH' 
      ? `Weather-based estimate is HIGH for ${location.name} based on current/forecast precipitation thresholds (${dailyRain} mm daily total). Check official local warnings.`
      : riskLevel === 'MODERATE'
      ? `Weather-based estimate is MODERATE for ${location.name} based on precipitation thresholds. This does not confirm local waterlogging.`
      : `Weather-based estimate is LOW for ${location.name}. This is not confirmation that the area is flood-safe; check official local alerts.`,
    sourceAttribution: 'Open-Meteo forecast API (modelled weather data; not a physical flood sensor)',
    sourceType: 'estimated',
    lastUpdated: currentTime,
    factors,
    alerts,
    riverReadings,
    recommendations: [
      'Avoid driving through standing waters ("Turn Around, Don\'t Drown").',
      'Monitor surrounding cardinal sectors (N, NE, E, SE, S, SW, W, NW) for incoming storm runoff.',
      'Check Google Maps / Apple Maps live traffic overlays before taking travel routes.'
    ],
    limitations: 'Uses Open-Meteo weather-model data and app-defined thresholds. Daily precipitation is the forecast total for the local calendar day; peak hourly precipitation covers the next 24 forecast hours. Risk is an estimate, river level is simulated, and this is not an official flood warning or physical sensor network.',
    livePrecipitation: {
      currentMm: roundMm(currentRain),
      dailySumMm: roundMm(dailyRain),
      next24hSumMm: next24HourTotal,
      maxHourlyMm: maxHourlyRain,
      humidity: currentHum,
      tempC: currentTemp
    },
    cardinalZones
  };
}
