import { FloodAlert, WaterLevelReading, RiskLevel, RiskFactor, LocationData } from '../types';

export interface FeedResponse {
  riskLevel: RiskLevel;
  riskSummary: string;
  sourceAttribution: string;
  sourceType: 'official' | 'estimated' | 'demo';
  lastUpdated: string;
  factors: RiskFactor[];
  alerts: FloodAlert[];
  riverReadings: WaterLevelReading[];
  recommendations: string[];
  limitations: string;
}

export interface FloodDataProvider {
  name: string;
  isAvailable: boolean;
  getFloodStatus(location: LocationData): Promise<FeedResponse>;
}

// 1. Simulated / Verified Demo Provider (Default when live government APIs are restricted or offline)
export class DemoDisasterProvider implements FloodDataProvider {
  name = 'Disaster Management Feeds (Demo Mode)';
  isAvailable = true;

  async getFloodStatus(location: LocationData): Promise<FeedResponse> {
    const isCoastalOrAssam = location.name.toLowerCase().includes('guwahati') || 
                            location.name.toLowerCase().includes('patna') || 
                            location.name.toLowerCase().includes('chennai') || 
                            location.name.toLowerCase().includes('mumbai') ||
                            location.name.toLowerCase().includes('kerala');

    const riskLevel: RiskLevel = isCoastalOrAssam ? 'HIGH' : 'MODERATE';
    const currentTime = new Date().toISOString();

    const alerts: FloodAlert[] = [
      {
        id: 'alt-imd-2026-091',
        title: 'Orange Warning: Heavy Inundation & River Spate',
        severity: riskLevel,
        headline: `High discharge upstream impacting ${location.district || location.name} low-lying catchment zones.`,
        instruction: 'Move livestock, essential medications, and emergency go-bags to 2nd floor or higher ground. Avoid crossing submergible causeways.',
        source: 'IMD (India Meteorological Dept) & State Disaster Management Authority (SDMA)',
        sourceType: 'demo',
        issuedAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
        updatedAt: currentTime,
        geographicCoverage: `${location.name} and adjoining basins within 25km`,
        confidence: 'Simulated',
        limitations: 'Simulated feed demonstrating warning payload format based on IMD Flash Flood & Inundation Bulletins.',
        isStale: false
      },
      {
        id: 'alt-cwc-2026-044',
        title: 'River Gauge Exceeding Warning Mark',
        severity: 'MODERATE',
        headline: 'Basin telemetry reports upstream surge flowing at 0.45m above Warning level.',
        instruction: 'Do not approach embankment walls. Fishermen and small crafts advised not to venture near riverbanks.',
        source: 'Central Water Commission (CWC) Flood Forecast Cell',
        sourceType: 'demo',
        issuedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        updatedAt: currentTime,
        geographicCoverage: 'Basin Reach Sector 4A',
        confidence: 'Simulated',
        limitations: 'Telemetry data simulated from CWC Flood Forecast format.',
        isStale: false
      }
    ];

    const riverReadings: WaterLevelReading[] = [
      {
        stationName: `${location.name} Central Barrage`,
        riverName: 'Main Drainage River',
        currentLevelMeters: 42.85,
        warningLevelMeters: 41.50,
        dangerLevelMeters: 43.20,
        trend: 'rising',
        lastUpdated: currentTime,
        source: 'Central Water Commission (CWC)',
        isSimulated: true
      },
      {
        stationName: 'Sub-catchment Gauge Station 02',
        riverName: 'Tributary Feeder',
        currentLevelMeters: 18.20,
        warningLevelMeters: 19.00,
        dangerLevelMeters: 20.50,
        trend: 'steady',
        lastUpdated: currentTime,
        source: 'State Irrigation Dept',
        isSimulated: true
      }
    ];

    const factors: RiskFactor[] = [
      {
        parameter: '24h Cumulative Precipitation',
        value: '112.4 mm (Heavy)',
        status: 'severe',
        impactDescription: 'Runoff capacity of stormwater drains exceeded by 40% in low-lying pockets.'
      },
      {
        parameter: 'River Stage / Water Table',
        value: '0.35m below Danger Level (Rising)',
        status: 'warning',
        impactDescription: 'Water approaching lower bank threshold; potential backflow into urban storm canals.'
      },
      {
        parameter: 'Soil Moisture Saturation',
        value: '88% (Near Saturation)',
        status: 'warning',
        impactDescription: 'Reduced ground absorption leads to rapid flash runoff.'
      },
      {
        parameter: 'Upstream Dam Release Discharge',
        value: '14,200 cusecs (Controlled spillway)',
        status: 'watch',
        impactDescription: 'Expected water transit travel time to local sector is 4 to 6 hours.'
      }
    ];

    return {
      riskLevel,
      riskSummary: riskLevel === 'HIGH' 
        ? `High flood hazard detected in ${location.name}. River levels rising toward danger threshold with ongoing heavy precipitation.`
        : `Moderate waterlogging risk for ${location.name}. Low-lying road intersections experiencing pooling.`,
      sourceAttribution: 'CWC India, IMD Weather Warning Matrix, SDMA Feeds',
      sourceType: 'demo',
      lastUpdated: currentTime,
      factors,
      alerts,
      riverReadings,
      recommendations: [
        'Relocate vehicles and valuable electronics to higher elevations or multi-level garages.',
        'Charge power banks, mobile devices, and emergency flashlights immediately.',
        'Keep drinking water stored in sealed clean containers for minimum 72 hours.',
        'Review closest verified shelter route and assemble your household Go-Bag.'
      ],
      limitations: 'Currently operating in Demo/Simulation Mode. Official telemetry feeds require API integration or direct SDMA secure gateway keys.'
    };
  }
}

// 2. Open-Meteo & Public Weather API Adapter (Live Real-Time Weather & Rain Hazard)
export class OpenMeteoFloodAdapter implements FloodDataProvider {
  name = 'Open-Meteo Live Hydrology & Precipitation';
  isAvailable = true;

  async getFloodStatus(location: LocationData): Promise<FeedResponse> {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code&hourly=precipitation,rain&daily=precipitation_sum,precipitation_hours&timezone=auto`;
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Open-Meteo HTTP error: ${res.status}`);
      }
      const data = await res.json();
      const currentRain = data.current?.precipitation || 0;
      const dailyRain = data.daily?.precipitation_sum?.[0] || 0;
      const hourlyRainArray: number[] = data.hourly?.precipitation?.slice(0, 24) || [];
      const maxHourlyRain = Math.max(...hourlyRainArray, 0);

      // Heuristic risk determination based on live precipitation
      let riskLevel: RiskLevel = 'LOW';
      let riskSummary = `Normal weather in ${location.name}. Minimal precipitation recorded (${dailyRain}mm today).`;
      
      if (currentRain > 15 || dailyRain > 100 || maxHourlyRain > 25) {
        riskLevel = 'HIGH';
        riskSummary = `Severe rainfall detected (${dailyRain}mm 24h total, peak ${maxHourlyRain}mm/hr). Serious flash flood and waterlogging threat.`;
      } else if (currentRain > 5 || dailyRain > 45 || maxHourlyRain > 10) {
        riskLevel = 'MODERATE';
        riskSummary = `Moderate rainfall (${dailyRain}mm today). Potential localized street waterlogging in underpasses and low zones.`;
      }

      const currentTime = new Date().toISOString();

      const alerts: FloodAlert[] = [];
      if (riskLevel === 'HIGH' || riskLevel === 'MODERATE') {
        alerts.push({
          id: `live-meteo-${Date.now()}`,
          title: riskLevel === 'HIGH' ? 'Severe Precipitation Flash Flood Watch' : 'Localized Waterlogging Advisory',
          severity: riskLevel,
          headline: `Live atmospheric telemetry reports ${dailyRain}mm total rainfall near ${location.name}.`,
          instruction: 'Avoid inundated underpasses, open drainage culverts, and low-lying basements.',
          source: 'Open-Meteo High-Resolution Precipitation Telemetry',
          sourceType: 'official',
          issuedAt: data.current?.time ? new Date(data.current.time).toISOString() : currentTime,
          updatedAt: currentTime,
          geographicCoverage: `Coordinates: ${location.latitude.toFixed(3)}°N, ${location.longitude.toFixed(3)}°E (${location.name})`,
          confidence: 'High',
          limitations: 'Precipitation model and satellite assimilation data. For river gauge stage, cross-verify with local hydrology authority.',
          isStale: false
        });
      }

      const factors: RiskFactor[] = [
        {
          parameter: 'Live Current Precipitation',
          value: `${currentRain} mm/hr`,
          status: currentRain > 10 ? 'severe' : currentRain > 3 ? 'warning' : 'normal',
          impactDescription: currentRain > 10 ? 'Torrential downpour in progress.' : 'Standard rainfall rate.'
        },
        {
          parameter: '24-Hour Cumulative Rain',
          value: `${dailyRain} mm`,
          status: dailyRain > 70 ? 'severe' : dailyRain > 35 ? 'warning' : 'normal',
          impactDescription: dailyRain > 50 ? 'Excessive accumulation causing localized runoff overload.' : 'Within seasonal manageable limits.'
        },
        {
          parameter: 'Peak Rain Intensity in Next 24h',
          value: `${maxHourlyRain} mm/hr`,
          status: maxHourlyRain > 20 ? 'severe' : maxHourlyRain > 8 ? 'warning' : 'normal',
          impactDescription: 'Forecasted peak hourly intensity across the immediate catchment.'
        }
      ];

      return {
        riskLevel,
        riskSummary,
        sourceAttribution: 'Live Global Weather & Precipitation Models (Open-Meteo)',
        sourceType: 'official',
        lastUpdated: currentTime,
        factors,
        alerts,
        riverReadings: [
          {
            stationName: `${location.name} Basin Hydrology Point`,
            riverName: 'Local Catchment Inflow',
            currentLevelMeters: +(12.2 + (dailyRain * 0.05)).toFixed(2),
            warningLevelMeters: 16.5,
            dangerLevelMeters: 18.0,
            trend: currentRain > 0 ? 'rising' : 'steady',
            lastUpdated: currentTime,
            source: 'Catchment Hydrology Model Estimate',
            isSimulated: true
          }
        ],
        recommendations: [
          'Monitor local district emergency broadcast channel.',
          'Do not drive into water of unknown depth ("Turn Around, Don\'t Drown").',
          'Disconnect ground-level electrical appliances if water approaches doorways.'
        ],
        limitations: 'Live weather telemetry active. River gauge levels are estimated hydrological indicators based on precipitation runoff.'
      };
    } catch (err) {
      console.warn('OpenMeteo fetch failed, falling back to Demo Provider:', err);
      return new DemoDisasterProvider().getFloodStatus(location);
    }
  }
}

// Data Provider Manager with Provider Switcher
export class FloodDataService {
  private currentProvider: FloodDataProvider;
  private mode: 'live' | 'demo' = 'demo';

  constructor() {
    this.currentProvider = new DemoDisasterProvider();
  }

  setMode(mode: 'live' | 'demo') {
    this.mode = mode;
    if (mode === 'live') {
      this.currentProvider = new OpenMeteoFloodAdapter();
    } else {
      this.currentProvider = new DemoDisasterProvider();
    }
  }

  getMode(): 'live' | 'demo' {
    return this.mode;
  }

  getProviderName(): string {
    return this.currentProvider.name;
  }

  async fetchFloodData(location: LocationData): Promise<FeedResponse> {
    return await this.currentProvider.getFloodStatus(location);
  }
}

export const floodDataService = new FloodDataService();
