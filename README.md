# FloodReady — Flood Disaster Management Mobile-First App

**FloodReady** is a mobile-first, resilient web application designed to support citizens and responders during all three critical phases of flood disaster management: **Preparation**, **Active Flood Emergency**, and **Post-Disaster Recovery**.

---

## 🛠️ Stack Choice & Architecture Rationale
- **Framework**: React 19 + TypeScript + Vite (ultra-fast compilation, low bundle size, strong typing)
- **Styling**: Tailwind CSS v4 (mobile ergonomically sized tap targets, high-contrast disaster palette, reduced motion support)
- **Mapping**: Leaflet + React-Leaflet with OpenStreetMap tiles (lightweight, zero expensive proprietary API keys required, works smoothly on mobile browsers)
- **Offline & Sound**: Native Web Audio API Synthesizer (instant hardware-grade siren sound generator and attention chimes without downloading external MP3 files), Web Vibration API, and persistent LocalStorage caching.
- **Provider-Adapter Layer**: Modular hydrology & meteorological data abstraction separating official feeds (NDMA, IMD, CWC format) from live weather endpoints (Open-Meteo API) and offline demo modes.

---

## 🌟 Core Features & Modules

### 1. Home Screen & Local Risk Intelligence
- **Location Transparency**: Never claims to know your live position without permission. Supports explicit GPS access as well as private manual district/city selection.
- **Risk Indicator & Explanation**: Displays local risk severity (**Low**, **Moderate**, **High**, **Critical**) with an expandable breakdown explaining the exact parameters (24h cumulative rainfall, river gauge stages, soil saturation, and dam spillway discharge).
- **Official Attribution**: Every alert details its issuing body, issuance timestamp, geographical scope, limitations, and confidence rating.

### 2. High-Visibility Emergency SOS & Siren Beacon
- **Acoustic Rescue Siren**: One-tap toggle generating a loud European/disaster warning warble (650Hz–1050Hz) and rhythmic mobile vibration for alerting nearby boats or search parties.
- **One-Tap Direct Dialing**: Instant access to verified national numbers (`112` Emergency, `1078` NDRF HQ, `1070` State Disaster Management, `108` Ambulance, `101` Fire).
- **Private "I'm Safe" / "I Need Help" SMS Dispatch**: Pre-drafts explicit status messages with GPS/district coordinates for emergency contacts. Never shares location automatically in the background without explicit user confirmation.

### 3. Nearby Facilities Directory (Local Demo Mode)
- **Categorized Services**: Relief camps, hospitals, emergency trauma wings, municipal sandbag/pump depots, and 24/7 pharmacies.
- **Demo Transparency**: The classroom-demo directory generates clearly labelled fictional points around the selected coordinates. It does not claim these are real shelters, hospitals, or services.
- **Filter by Needs**: Filter for wheelchair/step-free accessibility, medical staffing, and verified active status.
- **Flood Safety Warning**: Reminds users to never wade or drive into floodwaters ("Turn Around, Don't Drown").

### 4. Interactive Hazard & Relief Map
- OpenStreetMap Leaflet layer plotting the user's position, radius boundary, nearby verified shelters, hospitals, and community road blockage warnings.

### 5. Practical Safety Protocols (NDMA, IMD & WHO Aligned)
- Actionable, scannable guidance for:
  - **Before**: 72-Hour emergency plan, watertight document storage, pet contingencies.
  - **During**: Life-safety rules, power shutoffs, avoiding attic traps, escape from submerged vehicles.
  - **Evacuation**: Safe route decisions and personal essentials.
  - **Water & Health**: Disinfection protocols (boiling & chlorination), Leptospirosis prevention, electrical risks, and reptile caution.
  - **Recovery**: Safe return, damage documentation for insurance/relief claims, and mold prevention.
- All instructions are pre-cached locally for weak network and blackout conditions.

### 6. Preparedness Checklists & Community Hazard Reporting
- **Personal Go-Bag & Medication Checklist**: Interactive checkboxes with readiness progress tracking saved on-device.
- **Crowdsource Hazard Submissions**: Submit reports of impassable underpasses or stranded persons, visibly labeled as *UNVERIFIED* until checked by authorities.

---

## 🚀 Running the App Locally

### Prerequisites
- Node.js (v18+)
- npm

### Quick Start
```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Start the Vite development server
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Switching Feeds (Live vs. Demo Mode)
Open the app, tap the **Settings** gear icon in the top header, and choose:
- **Demo / Simulation Mode**: Demonstrates NDMA/CWC river gauge surges and severe warning conditions.
- **Open-Meteo Live API**: Connects to live precipitation models and weather telemetry for any GPS coordinate.


## Data accuracy notes (updated)

- Weather values are requested from the Open-Meteo API. Availability and timestamps depend on the API/network.
- The LOW/MODERATE/HIGH indicator is a simple app-defined estimate from precipitation values; it is not an official flood warning.
- The illustrative river/drainage level is simulated and must not be treated as a physical gauge reading.
- Eight directional cards request weather for approximate points around the selected location and attempt to resolve locality names. Failed weather requests display as unavailable instead of using randomized fallback values.
- For reliable classroom demonstrations, the nearby facility directory uses local demo fixtures and does not call public Overpass servers. It places clearly labelled fictional sample points around the selected coordinates and calculates illustrative distances. Names, coordinates, addresses, services, accessibility, phone numbers, and availability are not real or verified. Never use these demo points for emergency navigation. For real-world use, replace this demo service with a trusted, verified facility data source.
- Hazard reports are saved in this browser's local storage only; they are not transmitted to an emergency authority. SOS check-in opens the device's SMS composer for user review and does not dispatch a rescue team.

## Run locally

Requires Node.js 22 or newer.

```powershell
npm ci
npm run dev
```

Open the local URL printed by Vite. To check a production build, run `npm run build`.

## Weather data interpretation and limitations

- Current precipitation, temperature, and humidity are fetched from the Open-Meteo forecast API for the selected coordinates.
- “Today's Forecast Total” is the API's forecast total for the local calendar day; it is not a rolling trailing-24-hour measurement.
- “Peak Hourly Forecast (Next 24h)” and the next-24-hour total are calculated from the next 24 complete hourly precipitation forecast values after the API's current-hour timestamp. Compass cards show each point's next-24-hour total; opening a card also shows its local calendar-day total and peak hourly forecast. Missing/incomplete forecast values are shown as unavailable instead of being silently treated as zero.
- If the API returns an incomplete response or a request fails, the dashboard shows an unavailable/error state instead of silently treating missing values as zero or retaining the previous location's weather values.
- Directional readings are separate weather-model API requests at eight compass bearings, each approximately 15 km from the selected coordinates. Locality names use best-effort reverse geocoding and may not correspond to an official weather station.
- The risk label is a simple app-defined estimate based on precipitation thresholds. It is not an official warning and cannot establish that an area is flood-safe. River/gauge readings and nearby facility markers may be illustrative/demo data; verify emergency information with official authorities.


## Latest location/weather correctness updates

- The eight compass sample points now use spherical destination calculations so the N, NE, E, SE, S, SW, W and NW samples are each approximately 15 km away, including diagonal sectors.
- If a user quickly switches between locations, slower responses for an earlier location are ignored so they cannot overwrite the latest selection.
- The UI calls the daily value “Today's Forecast Total” to distinguish a local-calendar-day forecast from a rolling 24-hour total.
